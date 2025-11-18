import { supabase } from '../supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
  inviteCode?: string;
}

/**
 * Login with email and password (local auth)
 */
export const loginWithEmail = async (credentials: LoginCredentials) => {
  try {
    const { data, error } = await supabase.rpc('login_user', {
      p_email: credentials.email,
      p_password: credentials.password,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || '로그인에 실패했습니다');
    }

    return { data: data.user, error: null };
  } catch (error: any) {
    console.error('Login error:', error);
    return { data: null, error: error.message || '로그인 중 오류가 발생했습니다' };
  }
};

/**
 * Sign up with email and password (local auth)
 */
export const signupWithEmail = async (signupData: SignupData) => {
  try {
    const { data, error } = await supabase.rpc('register_user', {
      p_username: signupData.username,
      p_email: signupData.email,
      p_password: signupData.password,
      p_invite_code: signupData.inviteCode || null,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || '회원가입에 실패했습니다');
    }

    return { data: data.user, error: null };
  } catch (error: any) {
    console.error('Signup error:', error);
    return { data: null, error: error.message || '회원가입 중 오류가 발생했습니다' };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'rezom://auth/callback',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    return { data: null, error: error.message || '구글 로그인 중 오류가 발생했습니다' };
  }
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) throw error;

    if (data?.session) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('사용자 정보를 찾을 수 없습니다');

      // Sync with our users table
      const result = await syncSocialUser(user);

      return {
        data: {
          user: result.user,
          session: data.session,
          isNew: result.is_new,
        },
        error: null,
      };
    }

    return { data: null, error: '세션을 찾을 수 없습니다' };
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    return { data: null, error: error.message || '인증 처리 중 오류가 발생했습니다' };
  }
};

/**
 * Sync Supabase auth user with our users table
 */
const syncSocialUser = async (authUser: any) => {
  try {
    const provider = authUser.app_metadata.provider || 'google';
    const providerId = authUser.id;
    const email = authUser.email;
    const username = authUser.user_metadata.full_name || authUser.user_metadata.name;
    const avatarUrl = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;

    const { data, error } = await supabase.rpc('find_or_create_social_user', {
      p_provider: provider,
      p_provider_user_id: providerId,
      p_email: email,
      p_username: username,
      p_avatar_url: avatarUrl,
      p_display_name: username,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || '사용자 정보 동기화에 실패했습니다');
    }

    return data;
  } catch (error: any) {
    console.error('Sync social user error:', error);
    throw new Error(error.message || '사용자 정보 동기화 중 오류가 발생했습니다');
  }
};

/**
 * Sign out
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    // Clear AsyncStorage
    await AsyncStorage.clear();

    return { error: null };
  } catch (error: any) {
    console.error('Sign out error:', error);
    return { error: error.message || '로그아웃 중 오류가 발생했습니다' };
  }
};

/**
 * Get current session
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

/**
 * Update username
 */
export const updateUsername = async (userId: string, newUsername: string) => {
  try {
    const { data, error } = await supabase.rpc('update_username_with_limit', {
      p_user_id: userId,
      p_new_username: newUsername,
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.error || '닉네임 변경에 실패했습니다');
    }

    return { data, error: null };
  } catch (error: any) {
    console.error('Update username error:', error);
    return { data: null, error: error.message || '닉네임 변경 중 오류가 발생했습니다' };
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const session = await getCurrentSession();
  return !!session;
};
