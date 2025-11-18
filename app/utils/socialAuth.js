import { supabase } from '../lib/supabase'
import { Capacitor } from '@capacitor/core'

/**
 * Get redirect URL based on platform (web vs mobile)
 */
const getRedirectUrl = () => {
  if (Capacitor.isNativePlatform()) {
    // For mobile apps, use custom scheme
    return 'rezom://auth/callback'
  }
  // For web, use current origin
  return `${window.location.origin}/auth/callback`
}

/**
 * Sign in with Google
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: getRedirectUrl(),
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
    const REDIRECT_URI = getRedirectUrl()

    if (!KAKAO_CLIENT_ID) {
      throw new Error('Kakao Client ID is not configured')
    }

    // Redirect to Kakao OAuth
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&state=kakao`

    if (Capacitor.isNativePlatform()) {
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
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    if (data?.session) {
      // Get user info from Supabase auth
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not found')

      // Sync with our users table
      const result = await syncSocialUser(user)

      return {
        success: true,
        user: result.user,
        session: data.session,
        isNew: result.is_new,
      }
    }

    return { success: false, error: 'No session found' }
  } catch (error) {
    console.error('OAuth callback error:', error)
    throw new Error(error.message || '인증 처리 중 오류가 발생했습니다')
  }
}

/**
 * Handle Kakao OAuth callback
 */
export const handleKakaoCallback = async (code) => {
  try {
    const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID
    const KAKAO_CLIENT_SECRET = import.meta.env.VITE_KAKAO_CLIENT_SECRET
    const REDIRECT_URI = getRedirectUrl()

    // Exchange code for token
    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: KAKAO_CLIENT_ID,
        client_secret: KAKAO_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get Kakao token')
    }

    // Get user info
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    })

    const userData = await userResponse.json()

    if (!userResponse.ok) {
      throw new Error('Failed to get Kakao user info')
    }

    // Find or create user in our database
    const { data, error } = await supabase.rpc('find_or_create_social_user', {
      p_provider: 'kakao',
      p_provider_user_id: userData.id.toString(),
      p_email: userData.kakao_account?.email,
      p_username: userData.properties?.nickname,
      p_avatar_url: userData.properties?.profile_image,
      p_display_name: userData.properties?.nickname,
    })

    if (error) throw error

    if (!data.success) {
      throw new Error(data.error || 'Failed to create user')
    }

    return {
      success: true,
      user: data.user,
      isNew: data.is_new,
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

    const { data, error } = await supabase.rpc('find_or_create_social_user', {
      p_provider: provider,
      p_provider_user_id: providerId,
      p_email: email,
      p_username: username,
      p_avatar_url: avatarUrl,
      p_display_name: username,
    })

    if (error) throw error

    if (!data.success) {
      throw new Error(data.error || 'Failed to sync user')
    }

    return data
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
    // Start OAuth flow with metadata
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getRedirectUrl(),
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
