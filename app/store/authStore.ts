import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User } from '../types';
import AuthService from '../services/auth';

/**
 * Web-compatible storage adapter
 */
const storage = Platform.OS === 'web'
  ? {
      getItem: async (name: string) => {
        const value = localStorage.getItem(name);
        return value ?? null;
      },
      setItem: async (name: string, value: string) => {
        localStorage.setItem(name, value);
      },
      removeItem: async (name: string) => {
        localStorage.removeItem(name);
      },
    }
  : AsyncStorage;

/**
 * 세션 타입
 */
export interface Session {
  user: { id: string };
  access_token: string;
  expires_at: number;
}

/**
 * 인증 타입
 */
export type AuthType = 'local' | 'social';

/**
 * 인증 상태 타입
 */
export interface AuthState {
  // 상태
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  authType: AuthType | null;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setError: (error: string | null) => void;
  login: (user: User, token: string, authType: AuthType) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  isAuthenticated: () => boolean;
  updateUser: (updates: Partial<User>) => void;
}

/**
 * 인증 상태 스토어
 *
 * @description
 * 사용자 인증 및 세션 관리를 담당하는 전역 상태 스토어입니다.
 * AsyncStorage를 사용하여 인증 상태를 영구적으로 저장합니다.
 *
 * @example
 * ```typescript
 * import { useAuthStore } from '@/store';
 *
 * function LoginScreen() {
 *   const { login, user, isLoading } = useAuthStore();
 *
 *   const handleLogin = async () => {
 *     const result = await AuthService.login(credentials);
 *     if (result.success && result.data) {
 *       login(result.data.user, result.data.access_token, 'local');
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       {user ? (
 *         <Text>Welcome, {user.username}!</Text>
 *       ) : (
 *         <Button onPress={handleLogin}>Login</Button>
 *       )}
 *     </View>
 *   );
 * }
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      user: null,
      session: null,
      isLoading: false,
      authType: null,
      error: null,

      /**
       * 사용자 정보 설정
       * @param user - 사용자 객체
       */
      setUser: (user) => set({ user, error: null }),

      /**
       * 세션 정보 설정
       * @param session - 세션 객체
       */
      setSession: (session) => set({ session }),

      /**
       * 에러 메시지 설정
       * @param error - 에러 메시지
       */
      setError: (error) => set({ error }),

      /**
       * 로그인 처리
       *
       * @param user - 로그인한 사용자 정보
       * @param token - 액세스 토큰
       * @param authType - 인증 타입 ('local' | 'social')
       *
       * @example
       * ```typescript
       * const { login } = useAuthStore();
       * login(userData, 'token123', 'local');
       * ```
       */
      login: (user, token, authType) => {
        const session: Session = {
          user: { id: user.id },
          access_token: token,
          expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        };

        set({
          user,
          session,
          authType,
          isLoading: false,
          error: null,
        });
      },

      /**
       * 로그아웃 처리
       *
       * @example
       * ```typescript
       * const { logout } = useAuthStore();
       * await logout();
       * ```
       */
      logout: async () => {
        set({ isLoading: true });

        try {
          // AuthService를 통해 로그아웃
          await AuthService.logout();

          // 상태 초기화
          set({
            user: null,
            session: null,
            authType: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          // 에러가 발생해도 상태는 초기화
          set({
            user: null,
            session: null,
            authType: null,
            isLoading: false,
            error: '로그아웃 중 오류가 발생했습니다',
          });
        }
      },

      /**
       * 앱 시작 시 인증 상태 초기화
       *
       * @description
       * AsyncStorage에 저장된 인증 정보를 확인하고
       * 유효한 세션이 있으면 자동 로그인합니다.
       *
       * @example
       * ```typescript
       * const { initialize } = useAuthStore();
       *
       * useEffect(() => {
       *   initialize();
       * }, []);
       * ```
       */
      initialize: async () => {
        set({ isLoading: true });

        try {
          // AuthService에서 현재 사용자 정보 가져오기
          const user = await AuthService.getCurrentUser();
          const token = await AuthService.getAccessToken();
          const authType = await AuthService.getAuthType();

          if (user && token) {
            // 토큰 만료 확인
            const isExpired = AuthService.isTokenExpired(token);

            if (!isExpired) {
              // 유효한 세션
              const session: Session = {
                user: { id: user.id },
                access_token: token,
                expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
              };

              set({
                user,
                session,
                authType,
                isLoading: false,
                error: null,
              });
              return;
            }

            // 토큰 만료 시 리프레시 시도
            const newTokens = await AuthService.refreshTokens();

            if (newTokens) {
              const session: Session = {
                user: { id: user.id },
                access_token: newTokens.accessToken,
                expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000,
              };

              set({
                user,
                session,
                authType,
                isLoading: false,
                error: null,
              });
              return;
            }
          }

          // 유효한 세션 없음
          set({
            user: null,
            session: null,
            authType: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({
            user: null,
            session: null,
            authType: null,
            isLoading: false,
            error: '인증 초기화 중 오류가 발생했습니다',
          });
        }
      },

      /**
       * 인증 상태 확인
       *
       * @returns 인증 여부
       *
       * @example
       * ```typescript
       * const { isAuthenticated } = useAuthStore();
       *
       * if (!isAuthenticated()) {
       *   // 로그인 화면으로 리다이렉트
       * }
       * ```
       */
      isAuthenticated: () => {
        const { user, session } = get();

        if (!user || !session) {
          return false;
        }

        // 세션 만료 확인
        return session.expires_at > Date.now();
      },

      /**
       * 사용자 정보 업데이트
       *
       * @param updates - 업데이트할 필드
       *
       * @example
       * ```typescript
       * const { updateUser } = useAuthStore();
       * updateUser({ username: 'new_username' });
       * ```
       */
      updateUser: (updates) => {
        const { user } = get();

        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      // 영구 저장할 필드만 선택
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        authType: state.authType,
      }),
    }
  )
);

/**
 * Selectors - 최적화된 상태 선택
 */

/**
 * 현재 사용자 가져오기
 */
export const selectUser = (state: AuthState) => state.user;

/**
 * 로딩 상태 가져오기
 */
export const selectIsLoading = (state: AuthState) => state.isLoading;

/**
 * 인증 여부 가져오기
 */
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated();

/**
 * 에러 메시지 가져오기
 */
export const selectError = (state: AuthState) => state.error;

/**
 * 인증 타입 가져오기
 */
export const selectAuthType = (state: AuthState) => state.authType;

/**
 * 사용자 역할 확인
 */
export const selectUserRole = (state: AuthState) => state.user?.role;

/**
 * 관리자 여부 확인
 */
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';

/**
 * 호스트 여부 확인
 */
export const selectIsHost = (state: AuthState) =>
  state.user?.role === 'admin' || state.user?.role === 'host';
