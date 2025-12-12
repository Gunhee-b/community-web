import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from '../lib/supabase'

/**
 * Get redirect URL based on platform (web vs mobile)
 */
const getRedirectUrl = async () => {
  let isNative = false
  try {
    const { Capacitor } = await import('@capacitor/core')
    isNative = Capacitor.isNativePlatform()
  } catch {
    // Not in native environment
  }

  if (isNative) {
    // For mobile apps, use custom scheme
    return 'ingk://auth/callback'
  }

  const siteUrl =
    import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '') ||
    (typeof window !== 'undefined' ? window.location.origin : '')

  if (!siteUrl) {
    throw new Error('Site URL is not configured for OAuth redirect')
  }

  const redirectUrl = `${siteUrl}/auth/callback`
  console.log('OAuth Redirect URL:', redirectUrl)
  return redirectUrl
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const redirectUrl = await getRedirectUrl()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Google sign-in error:', error)
    throw new Error(error.message || '구글 로그인 중 오류가 발생했습니다')
  }
}

/**
 * Sign in with Kakao (Custom implementation)
 * Note: Kakao requires custom OAuth implementation as it's not natively supported by Supabase
 */
export const signInWithKakao = async () => {
  try {
    // For now, we'll use a custom flow with Kakao REST API
    // This will need to be implemented with Kakao JavaScript SDK
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID
    const REDIRECT_URI = await getRedirectUrl()

    if (!KAKAO_CLIENT_ID) {
      throw new Error('Kakao Client ID is not configured')
    }

    // Redirect to Kakao OAuth
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=kakao`

    let isNative = false
    try {
      const { Capacitor } = await import('@capacitor/core')
      isNative = Capacitor.isNativePlatform()
    } catch {
      // Not in native environment
    }

    if (isNative) {
      // For mobile, use Browser plugin
      const { Browser } = await import('@capacitor/browser')
      await Browser.open({ url: kakaoAuthUrl })
    } else {
      // For web, redirect
      window.location.href = kakaoAuthUrl
    }

    return { success: true }
  } catch (error) {
    console.error('Kakao sign-in error:', error)
    throw new Error(error.message || '카카오 로그인 중 오류가 발생했습니다')
  }
}

/**
 * Handle OAuth callback (for web)
 */
export const handleOAuthCallback = async () => {
  try {
    console.log('🔄 handleOAuthCallback: Starting...')

    // First try to exchange the code for session
    console.log('📡 Getting Supabase session...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ Session error:', sessionError)
      throw sessionError
    }

    console.log('✅ Session exists:', !!sessionData?.session)

    if (sessionData?.session) {
      // Get user info from Supabase auth
      console.log('👤 Getting auth user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error('❌ User fetch error:', userError)
        throw userError
      }

      if (!user) {
        console.error('❌ No user in session')
        throw new Error('User not found')
      }

      console.log('✅ Auth user exists:', user.email)

      // Sync with our users table
      try {
        console.log('🔄 Syncing user to database...')
        const result = await syncSocialUser(user)

        console.log('✅ Sync successful, user created')

        return {
          success: true,
          user: result.user,
          session: sessionData.session,
          isNew: result.is_new,
        }
      } catch (syncError) {
        console.error('❌ User sync failed:', syncError)
        console.error('❌ Sync error details:', {
          message: syncError.message,
          code: syncError.code,
          details: syncError.details,
          hint: syncError.hint
        })
        throw new Error(`사용자 정보 동기화 실패: ${syncError.message}`)
      }
    }

    console.warn('⚠️ No session found in callback')
    throw new Error('인증 세션을 찾을 수 없습니다. 다시 시도해주세요.')
  } catch (error) {
    console.error('❌ OAuth callback error:', error)
    throw error
  }
}

/**
 * Handle Kakao OAuth callback
 */
export const handleKakaoCallback = async (code) => {
  try {
    const REDIRECT_URI = await getRedirectUrl()

    console.log('Kakao callback - Redirect URI:', REDIRECT_URI)
    console.log('Kakao callback - Code:', code)

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration is missing')
    }

    // Call Supabase Edge Function to handle token exchange and user creation
    const edgeFunctionUrl = `${SUPABASE_URL}/functions/v1/kakao-auth`

    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    })

    const data = await response.json()

    console.log('Kakao auth response:', data)

    if (!data.success || !data.data) {
      console.error('Kakao auth error:', data.error)
      throw new Error(data.error || 'Kakao 인증에 실패했습니다')
    }

    return {
      success: true,
      user: data.data.user,
      isNew: data.data.is_new || false,
    }
  } catch (error) {
    console.error('Kakao callback error:', error)
    throw new Error(error.message || '카카오 인증 처리 중 오류가 발생했습니다')
  }
}

/**
 * Sync Supabase auth user with our users table
 */
export const syncSocialUser = async (authUser) => {
  try {
    const provider = authUser.app_metadata.provider || 'google'
    const providerId = authUser.id
    const email = authUser.email
    const username = authUser.user_metadata.full_name || authUser.user_metadata.name
    const avatarUrl = authUser.user_metadata.avatar_url || authUser.user_metadata.picture

    console.log('Syncing social user with params:', {
      provider,
      providerId,
      email,
      username,
      avatarUrl
    })

    const { data, error } = await supabase.rpc('find_or_create_social_user', {
      p_provider: provider,
      p_provider_user_id: providerId,
      p_email: email,
      p_username: username,
      p_avatar_url: avatarUrl,
      p_display_name: username,
    })

    console.log('RPC Response:', { data, error })

    if (error) {
      console.error('RPC Error Details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw error
    }

    // Handle the Table Row response from the SQL function (snake_case)
    // The function returns: { "id": "...", "username": "...", "full_name": "...", "avatar_url": "...", "role": "...", "is_new": bool }
    const profile = data

    if (!profile || !profile.id) {
      console.error('Profile ID missing in response:', profile)
      throw new Error('Failed to sync user: Invalid response format')
    }

    console.log('User sync successful:', profile)

    // Return in the format expected by handleOAuthCallback
    // Profile is already in snake_case format from the DB
    return {
      success: true,
      user: {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
      },
      is_new: profile.is_new || false,
    }
  } catch (error) {
    console.error('Sync social user error:', error)
    throw new Error(error.message || '사용자 정보 동기화 중 오류가 발생했습니다')
  }
}

/**
 * Link social account to existing user (for migration)
 */
export const linkSocialAccountToUser = async (userId, provider) => {
  try {
    const redirectUrl = await getRedirectUrl()
    // Start OAuth flow with metadata
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          link_user_id: userId,
        },
      },
    })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Link social account error:', error)
    throw new Error(error.message || '소셜 계정 연동 중 오류가 발생했습니다')
  }
}

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    return data.session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Sign out error:', error)
    throw new Error(error.message || '로그아웃 중 오류가 발생했습니다')
  }
}

/**
 * Update username (with rate limiting)
 */
export const updateUsername = async (userId, newUsername) => {
  try {
    const { data, error } = await supabase.rpc('update_username_with_limit', {
      p_user_id: userId,
      p_new_username: newUsername,
    })

    if (error) throw error

    if (!data.success) {
      throw new Error(data.error || 'Failed to update username')
    }

    return data
  } catch (error) {
    console.error('Update username error:', error)
    throw new Error(error.message || '닉네임 변경 중 오류가 발생했습니다')
  }
}

/**
 * Get user's social connections
 */
export const getSocialConnections = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', userId)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Get social connections error:', error)
    return []
  }
}
