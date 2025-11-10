import { storage, secureStorage } from '../utils/storage-native';
import { post, get, API_ENDPOINTS } from './api';
import { User } from '../types';

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
      // 서버에 로그아웃 요청 (선택사항)
      await post(API_ENDPOINTS.AUTH.LOGOUT);

      // 로컬 저장소 정리
      await this.clearAuthData();

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      // 에러가 발생해도 로컬 데이터는 삭제
      await this.clearAuthData();
      return false;
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
      const response = await get<User>(API_ENDPOINTS.AUTH.ME);

      if (response.success && response.data) {
        // 로컬에 저장
        await storage.setObject(STORAGE_KEYS.USER_DATA, response.data);
        return response.data;
      }

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
      const refreshToken = await this.getRefreshToken();

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
}

// 기본 export
export default AuthService;
