import { storage, secureStorage } from '../utils/storage-native';
import { post, get, API_ENDPOINTS } from './api';
import { User } from '../types';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';
import Constants from 'expo-constants';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

/**
 * 저장소 키 상수
 */
const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  AUTH_TYPE: 'auth_type', // 'local' | 'social'
} as const;

/**
 * 로그인 자격 증명 타입
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * 회원가입 데이터 타입
 */
export interface SignupData {
  username: string;
  email: string;
  password: string;
  inviteCode?: string;
}

/**
 * 인증 응답 타입
 */
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

/**
 * 토큰 페어
 */
export interface TokenPair {
  accessToken: string;
  refreshToken?: string;
}

/**
 * 인증 서비스
 * 사용자 인증, 토큰 관리, 세션 관리를 담당
 */
export class AuthService {
  /**
   * 이메일/비밀번호로 로그인
   *
   * @param credentials - 로그인 자격 증명
   * @returns 인증 응답 또는 에러
   *
   * @example
   * ```typescript
   * const result = await AuthService.login({
   *   email: 'user@example.com',
   *   password: 'password123'
   * });
   *
   * if (result.success && result.data) {
   *   console.log('Logged in:', result.data.user);
   * }
   * ```
   */
  static async login(credentials: LoginCredentials) {
    try {
      const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);

      if (response.success && response.data) {
        await this.saveAuthData(response.data, 'local');
        return response;
      }

      return response;
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || '로그인 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * 회원가입
   *
   * @param signupData - 회원가입 데이터
   * @returns 인증 응답 또는 에러
   *
   * @example
   * ```typescript
   * const result = await AuthService.signup({
   *   username: 'john_doe',
   *   email: 'john@example.com',
   *   password: 'securePassword123',
   *   inviteCode: 'INVITE123'
   * });
   * ```
   */
  static async signup(signupData: SignupData) {
    try {
      const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, signupData);

      if (response.success && response.data) {
        await this.saveAuthData(response.data, 'local');
        return response;
      }

      return response;
    } catch (error: any) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error.message || '회원가입 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * 로그아웃
   * - 서버에 로그아웃 요청
   * - 소셜 로그인인 경우 provider별 로그아웃 처리
   * - 로컬 토큰 및 사용자 데이터 삭제
   *
   * @returns 성공 여부
   *
   * @example
   * ```typescript
   * await AuthService.logout();
   * // 로그인 화면으로 리다이렉트
   * ```
   */
  static async logout(): Promise<boolean> {
    try {
      const authType = await this.getAuthType();
      const accessToken = await this.getAccessToken();

      // 카카오 소셜 로그인인 경우 카카오 로그아웃 처리
      if (authType === 'social' && accessToken?.startsWith('kakao_')) {
        await this.logoutFromKakao(accessToken);
      }

      // Supabase 세션 로그아웃
      try {
        await supabase.auth.signOut();
      } catch (supabaseError) {
        console.log('Supabase logout (세션이 없을 수 있음):', supabaseError);
      }

      // 일반 로그인인 경우 서버에 로그아웃 요청 (선택사항)
      if (authType === 'local') {
        try {
          await post(API_ENDPOINTS.AUTH.LOGOUT);
        } catch (apiError) {
          console.log('Backend logout request failed:', apiError);
        }
      }

      // 로컬 저장소 정리
      await this.clearAuthData();

      console.log('✅ Logout successful');
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 데이터는 삭제
      await this.clearAuthData();
      return false;
    }
  }

  /**
   * 카카오 로그아웃
   * - 카카오 액세스 토큰 무효화
   *
   * @param accessToken - 카카오 액세스 토큰
   * @private
   */
  private static async logoutFromKakao(accessToken: string): Promise<void> {
    try {
      // 'kakao_' 접두사 제거
      const kakaoAccessToken = accessToken.replace('kakao_', '');

      // 카카오 로그아웃 API 호출
      const logoutUrl = 'https://kapi.kakao.com/v1/user/logout';

      const response = await fetch(logoutUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${kakaoAccessToken}`,
        },
      });

      if (response.ok) {
        console.log('✅ Kakao logout successful');
      } else {
        const errorData = await response.json();
        console.warn('⚠️ Kakao logout warning:', errorData);
      }
    } catch (error) {
      console.error('❌ Kakao logout error:', error);
      // 카카오 로그아웃 실패해도 계속 진행 (로컬 정리는 해야 함)
    }
  }

  /**
   * 현재 로그인한 사용자 정보 가져오기
   *
   * @returns 사용자 정보 또는 null
   *
   * @example
   * ```typescript
   * const user = await AuthService.getCurrentUser();
   * if (user) {
   *   console.log('Current user:', user.username);
   * }
   * ```
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await storage.getObject(STORAGE_KEYS.USER_DATA);
      return userData as User | null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * 서버에서 최신 사용자 정보 가져오기
   *
   * @returns 사용자 정보 또는 null
   */
  static async fetchCurrentUser(): Promise<User | null> {
    try {
      // 로컬 스토리지에서 사용자 정보 가져오기 (API 호출 없이)
      const user = await this.getCurrentUser();

      if (user) {
        return user;
      }

      // 로컬에 사용자 정보가 없으면 null 반환
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  /**
   * 액세스 토큰 가져오기
   *
   * @returns 액세스 토큰 또는 null
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * 리프레시 토큰 가져오기
   *
   * @returns 리프레시 토큰 또는 null
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await secureStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * 인증 토큰 갱신
   *
   * @returns 새 토큰 페어 또는 null
   *
   * @example
   * ```typescript
   * const tokens = await AuthService.refreshTokens();
   * if (tokens) {
   *   console.log('Tokens refreshed successfully');
   * }
   * ```
   */
  static async refreshTokens(): Promise<TokenPair | null> {
    try {
      const accessToken = await this.getAccessToken();
      const refreshToken = await this.getRefreshToken();

      // Kakao 소셜 로그인 토큰은 리프레시하지 않음
      if (accessToken?.startsWith('kakao_')) {
        console.log('Kakao token does not need refresh');
        return null;
      }

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken,
      });

      if (response.success && response.data) {
        const { access_token, refresh_token } = response.data;

        // 새 토큰 저장
        await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);

        if (refresh_token) {
          await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
        }

        return {
          accessToken: access_token,
          refreshToken: refresh_token,
        };
      }

      return null;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      // 리프레시 실패 시 로그아웃
      await this.clearAuthData();
      return null;
    }
  }

  /**
   * 인증 상태 확인
   *
   * @returns 인증 여부
   *
   * @example
   * ```typescript
   * const isAuth = await AuthService.isAuthenticated();
   * if (!isAuth) {
   *   // 로그인 화면으로 리다이렉트
   * }
   * ```
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      const user = await this.getCurrentUser();

      return !!(token && user);
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  /**
   * 토큰 만료 여부 확인
   *
   * @param token - JWT 토큰
   * @returns 만료 여부
   */
  static isTokenExpired(token: string): boolean {
    try {
      // Kakao 소셜 로그인 토큰은 JWT가 아니므로 만료 확인 건너뛰기
      if (token.startsWith('kakao_')) {
        return false; // Kakao 토큰은 만료되지 않은 것으로 간주
      }

      // JWT 토큰 디코딩 (payload 부분)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // 밀리초로 변환

      return Date.now() >= expiryTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true; // 에러 발생 시 만료된 것으로 간주
    }
  }

  /**
   * 인증 데이터 저장 (내부 사용)
   *
   * @param authData - 인증 응답 데이터
   * @param authType - 인증 타입 ('local' | 'social')
   */
  private static async saveAuthData(
    authData: AuthResponse,
    authType: 'local' | 'social'
  ): Promise<void> {
    try {
      const { user, access_token, refresh_token } = authData;

      // 토큰을 SecureStore에 저장
      await secureStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, access_token);

      if (refresh_token) {
        await secureStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
      }

      // 사용자 정보를 AsyncStorage에 저장
      await storage.setObject(STORAGE_KEYS.USER_DATA, user);
      await storage.setItem(STORAGE_KEYS.AUTH_TYPE, authType);
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  }

  /**
   * 인증 데이터 삭제 (내부 사용)
   */
  private static async clearAuthData(): Promise<void> {
    try {
      await secureStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await secureStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_DATA);
      await storage.removeItem(STORAGE_KEYS.AUTH_TYPE);
    } catch (error) {
      console.error('Error clearing auth data:', error);
      throw error;
    }
  }

  /**
   * 인증 타입 가져오기
   *
   * @returns 인증 타입 ('local' | 'social' | null)
   */
  static async getAuthType(): Promise<'local' | 'social' | null> {
    try {
      const authType = await storage.getItem(STORAGE_KEYS.AUTH_TYPE);
      return authType as 'local' | 'social' | null;
    } catch (error) {
      console.error('Error getting auth type:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 업데이트
   *
   * @param userData - 업데이트할 사용자 정보
   * @returns 성공 여부
   */
  static async updateUserData(userData: Partial<User>): Promise<boolean> {
    try {
      const currentUser = await this.getCurrentUser();

      if (!currentUser) {
        return false;
      }

      const updatedUser = { ...currentUser, ...userData };
      await storage.setObject(STORAGE_KEYS.USER_DATA, updatedUser);

      return true;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  }

  /**
   * 비밀번호 변경
   *
   * @param currentPassword - 현재 비밀번호
   * @param newPassword - 새 비밀번호
   * @returns 성공 여부
   */
  static async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return response;
    } catch (error: any) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message || '비밀번호 변경 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * 비밀번호 재설정 이메일 전송
   *
   * @param email - 이메일 주소
   * @returns 성공 여부
   */
  static async sendPasswordResetEmail(
    email: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await post('/auth/forgot-password', { email });
      return response;
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: error.message || '비밀번호 재설정 이메일 전송 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * 비밀번호 재설정
   *
   * @param token - 재설정 토큰
   * @param newPassword - 새 비밀번호
   * @returns 성공 여부
   */
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await post('/auth/reset-password', {
        token,
        new_password: newPassword,
      });

      return response;
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return {
        success: false,
        error: error.message || '비밀번호 재설정 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Google 소셜 로그인
   *
   * Google OAuth를 사용한 로그인
   *
   * @returns 인증 응답 또는 에러
   *
   * @example
   * ```typescript
   * const result = await AuthService.signInWithGoogle();
   * if (result.success && result.data) {
   *   console.log('Google login successful:', result.data.user);
   * }
   * ```
   */
  static async signInWithGoogle() {
    try {
      console.log('Starting Google sign-in...');

      // 1. Supabase OAuth로 Google 로그인 시작
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'rezom://auth/callback',
          skipBrowserRedirect: true, // 자동 리다이렉트 비활성화
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        throw error;
      }

      if (data?.url) {
        console.log('Opening OAuth URL:', data.url);
        // 2. OAuth 브라우저 세션 열기
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'rezom://auth/callback'
        );

        console.log('WebBrowser result:', result);

        // 3. WebBrowser가 성공적으로 닫혔는지 확인
        if (result.type === 'success' && result.url) {
          // URL fragment에서 토큰 추출 (# 이후의 파라미터들)
          const url = result.url;
          const fragment = url.split('#')[1];

          if (fragment) {
            const params = new URLSearchParams(fragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              console.log('Setting Supabase session with tokens...');

              // Supabase 세션 설정
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (sessionError) {
                console.error('Session set error:', sessionError);
                throw sessionError;
              }

              if (sessionData?.user) {
                console.log('Session set successfully, syncing user...');

                // Supabase auth user를 우리 users 테이블과 동기화
                const authUser = sessionData.user;
                const provider = authUser.app_metadata.provider || 'google';
                const providerId = authUser.id;
                const email = authUser.email;
                const username = authUser.user_metadata.full_name || authUser.user_metadata.name || authUser.email?.split('@')[0];
                const avatarUrl = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;

                // find_or_create_social_user RPC 호출
                const { data: syncData, error: syncError } = await supabase.rpc('find_or_create_social_user', {
                  p_provider: provider,
                  p_provider_user_id: providerId,
                  p_email: email,
                  p_username: username,
                  p_avatar_url: avatarUrl,
                  p_display_name: username,
                });

                if (syncError) {
                  console.error('User sync error:', syncError);
                  throw syncError;
                }

                if (!syncData.success) {
                  throw new Error(syncData.error || '사용자 정보 동기화에 실패했습니다');
                }

                // 인증 데이터 저장
                const authResponse: AuthResponse = {
                  user: syncData.user,
                  access_token: accessToken,
                  refresh_token: refreshToken,
                };

                await this.saveAuthData(authResponse, 'social');

                console.log('✅ Google login successful:', syncData.user.username);

                return {
                  success: true,
                  data: authResponse,
                };
              }
            }
          }

          return { success: false, error: '토큰을 찾을 수 없습니다' };
        } else if (result.type === 'cancel') {
          return { success: false, error: '로그인이 취소되었습니다' };
        }

        return { success: false, error: '로그인을 완료하지 못했습니다' };
      }

      return { success: false, error: 'OAuth URL을 생성할 수 없습니다' };
    } catch (error: any) {
      console.error('Google login error:', error);
      return {
        success: false,
        error: error.message || 'Google 로그인 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * OAuth 콜백 처리 (딥링크에서 호출)
   */
  static async handleOAuthCallback() {
    try {
      console.log('Handling OAuth callback...');

      // 세션에서 사용자 정보 가져오기
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }

      if (sessionData?.session) {
        console.log('Session found, syncing user...');

        // Supabase auth user를 우리 users 테이블과 동기화
        const authUser = sessionData.session.user;
        const provider = authUser.app_metadata.provider || 'google';
        const providerId = authUser.id;
        const email = authUser.email;
        const username = authUser.user_metadata.full_name || authUser.user_metadata.name || authUser.email?.split('@')[0];
        const avatarUrl = authUser.user_metadata.avatar_url || authUser.user_metadata.picture;

        // find_or_create_social_user RPC 호출
        const { data: syncData, error: syncError } = await supabase.rpc('find_or_create_social_user', {
          p_provider: provider,
          p_provider_user_id: providerId,
          p_email: email,
          p_username: username,
          p_avatar_url: avatarUrl,
          p_display_name: username,
        });

        if (syncError) {
          console.error('Sync error:', syncError);
          throw syncError;
        }

        if (!syncData.success) {
          throw new Error(syncData.error || '사용자 정보 동기화에 실패했습니다');
        }

        // AuthResponse 형식으로 변환하여 저장
        const authResponse: AuthResponse = {
          user: syncData.user,
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        };

        await this.saveAuthData(authResponse, 'social');

        console.log('✅ OAuth callback handled successfully');
        return { success: true, data: authResponse };
      }

      console.warn('No session found in callback');
      return { success: false, error: '세션을 찾을 수 없습니다' };
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      return {
        success: false,
        error: error.message || 'OAuth 콜백 처리 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Kakao 소셜 로그인
   *
   * Kakao OAuth를 사용한 로그인
   *
   * @returns 인증 응답 또는 에러
   *
   * @example
   * ```typescript
   * const result = await AuthService.signInWithKakao();
   * if (result.success && result.data) {
   *   console.log('Kakao login successful:', result.data.user);
   * }
   * ```
   */
  static async signInWithKakao() {
    try {
      const kakaoClientId = Constants.expoConfig?.extra?.kakaoClientId ||
                            process.env.EXPO_PUBLIC_KAKAO_CLIENT_ID ||
                            '57450a0289e45de479273c9fc168f4fb';

      if (!kakaoClientId) {
        throw new Error('Kakao Client ID가 설정되지 않았습니다');
      }

      // 1. Kakao OAuth URL 생성
      // Kakao REST API는 웹 형태의 redirect URI만 지원
      // 모바일 앱은 Supabase를 통한 웹 redirect URI 사용
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error('Supabase 설정이 누락되었습니다');
      }

      // Supabase Edge Function이 처리할 웹 형태의 Redirect URI
      const redirectUri = `${supabaseUrl}/functions/v1/kakao-callback`;
      const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;

      console.log('Kakao Auth URL:', kakaoAuthUrl);
      console.log('Kakao Redirect URI:', redirectUri);

      // 2. OAuth 브라우저 세션 열기
      // 앱으로 돌아올 때는 rezom:// 스킴 사용
      const result = await WebBrowser.openAuthSessionAsync(
        kakaoAuthUrl,
        'rezom://'
      );

      console.log('Kakao WebBrowser result:', result);

      if (result.type !== 'success') {
        return { success: false, error: 'Kakao 로그인이 취소되었습니다' };
      }

      // 3. Authorization code 추출
      const url = result.url;
      const code = url.match(/code=([^&]+)/)?.[1];

      if (!code) {
        throw new Error('Authorization code를 찾을 수 없습니다');
      }

      console.log('Kakao code received:', code.substring(0, 20) + '...');

      // 4. Supabase Edge Function으로 토큰 교환 및 사용자 생성
      const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseAnonKey) {
        throw new Error('Supabase Anon Key가 누락되었습니다');
      }

      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/kakao-auth`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: redirectUri,
        }),
      });

      const data = await response.json();

      if (!data.success || !data.data) {
        throw new Error(data.error || 'Kakao 로그인에 실패했습니다');
      }

      // 5. 인증 데이터 저장
      const authResponse: AuthResponse = {
        user: data.data.user,
        access_token: data.data.access_token,
        refresh_token: data.data.refresh_token,
      };

      await this.saveAuthData(authResponse, 'social');

      console.log('✅ Kakao login successful:', authResponse.user.username);
      return { success: true, data: authResponse };
    } catch (error: any) {
      console.error('Kakao login error:', error);
      return {
        success: false,
        error: error.message || 'Kakao 로그인 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Naver 소셜 로그인
   *
   * Naver OAuth를 사용한 로그인
   *
   * @returns 인증 응답 또는 에러
   *
   * @example
   * ```typescript
   * const result = await AuthService.signInWithNaver();
   * if (result.success && result.data) {
   *   console.log('Naver login successful:', result.data.user);
   * }
   * ```
   */
  static async signInWithNaver() {
    try {
      // TODO: Naver Login 구현
      // 1. Naver SDK 사용
      // 2. Access Token 받기
      // 3. 백엔드로 Access Token 전송하여 인증

      const response = await post<AuthResponse>(API_ENDPOINTS.AUTH.SOCIAL_LOGIN, {
        provider: 'naver',
        // token: naverAccessToken, // Naver에서 받은 Access Token
      });

      if (response.success && response.data) {
        await this.saveAuthData(response.data, 'social');
        return response;
      }

      return response;
    } catch (error: any) {
      console.error('Naver login error:', error);
      return {
        success: false,
        error: error.message || 'Naver 로그인 중 오류가 발생했습니다',
      };
    }
  }

  /**
   * Apple 소셜 로그인
   *
   * Apple Sign In을 사용한 로그인
   * - iOS 전용 기능
   * - 이메일 비공개 옵션 지원
   *
   * @returns 인증 응답 또는 에러
   *
   * @example
   * ```typescript
   * const result = await AuthService.signInWithApple();
   * if (result.success && result.data) {
   *   console.log('Apple login successful:', result.data.user);
   * }
   * ```
   */
  static async signInWithApple() {
    try {
      // iOS만 지원
      if (Platform.OS !== 'ios') {
        return {
          success: false,
          error: 'Apple 로그인은 iOS에서만 지원됩니다',
        };
      }

      console.log('Starting Apple sign-in...');

      // 1. Apple 인증 요청
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('Apple credential received:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
      });

      // 2. Identity Token 검증 및 사용자 정보 동기화
      const identityToken = credential.identityToken;
      const authorizationCode = credential.authorizationCode;

      if (!identityToken) {
        throw new Error('Apple Identity Token을 받지 못했습니다');
      }

      // 3. Supabase를 통한 사용자 동기화
      const providerId = credential.user;
      const email = credential.email || `${providerId}@privaterelay.appleid.com`;
      const fullName = credential.fullName;
      const username = fullName?.givenName
        ? `${fullName.givenName}${fullName.familyName || ''}`.trim()
        : email.split('@')[0];

      // find_or_create_social_user RPC 호출
      const { data: syncData, error: syncError } = await supabase.rpc('find_or_create_social_user', {
        p_provider: 'apple',
        p_provider_user_id: providerId,
        p_email: email,
        p_username: username,
        p_avatar_url: null, // Apple은 아바타 제공 안함
        p_display_name: username,
      });

      if (syncError) {
        console.error('User sync error:', syncError);
        throw syncError;
      }

      if (!syncData.success) {
        throw new Error(syncData.error || '사용자 정보 동기화에 실패했습니다');
      }

      // 4. 인증 데이터 저장
      const authResponse: AuthResponse = {
        user: syncData.user,
        access_token: `apple_${identityToken}`,
        refresh_token: authorizationCode || undefined,
      };

      await this.saveAuthData(authResponse, 'social');

      console.log('✅ Apple login successful:', syncData.user.username);

      return {
        success: true,
        data: authResponse,
      };
    } catch (error: any) {
      console.error('Apple login error:', error);

      // 사용자가 취소한 경우
      if (error.code === 'ERR_CANCELED') {
        return {
          success: false,
          error: '로그인이 취소되었습니다',
        };
      }

      return {
        success: false,
        error: error.message || 'Apple 로그인 중 오류가 발생했습니다',
      };
    }
  }
}

// 기본 export
export default AuthService;
