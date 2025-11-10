import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 앱 테마 타입
 */
export type Theme = 'light' | 'dark' | 'system';

/**
 * 앱 언어 타입
 */
export type Language = 'ko' | 'en';

/**
 * 앱 전역 상태 타입
 */
export interface AppState {
  // 설정
  theme: Theme;
  language: Language;
  fontSize: number;
  enableNotifications: boolean;
  enableSound: boolean;

  // UI 상태
  isLoading: boolean;
  isSidebarOpen: boolean;
  activeScreen: string | null;

  // 네트워크
  isOnline: boolean;
  lastSyncTime: number | null;

  // Actions
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  setFontSize: (size: number) => void;
  setEnableNotifications: (enabled: boolean) => void;
  setEnableSound: (enabled: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  setActiveScreen: (screen: string | null) => void;
  setIsOnline: (online: boolean) => void;
  setLastSyncTime: (time: number) => void;
  resetSettings: () => void;
}

/**
 * 기본 설정 값
 */
const defaultSettings = {
  theme: 'system' as Theme,
  language: 'ko' as Language,
  fontSize: 16,
  enableNotifications: true,
  enableSound: true,
  isLoading: false,
  isSidebarOpen: false,
  activeScreen: null,
  isOnline: true,
  lastSyncTime: null,
};

/**
 * 앱 전역 상태 스토어
 *
 * @description
 * 앱 전체에서 사용되는 설정 및 상태를 관리합니다.
 * AsyncStorage를 사용하여 설정을 영구적으로 저장합니다.
 *
 * @example
 * ```typescript
 * import { useAppStore } from '@/store';
 *
 * function SettingsScreen() {
 *   const { theme, setTheme } = useAppStore();
 *
 *   return (
 *     <View>
 *       <Text>Current theme: {theme}</Text>
 *       <Button onPress={() => setTheme('dark')}>
 *         Dark Mode
 *       </Button>
 *     </View>
 *   );
 * }
 * ```
 */
export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      /**
       * 테마 설정
       * @param theme - 'light' | 'dark' | 'system'
       */
      setTheme: (theme) => set({ theme }),

      /**
       * 언어 설정
       * @param language - 'ko' | 'en'
       */
      setLanguage: (language) => set({ language }),

      /**
       * 폰트 크기 설정
       * @param size - 폰트 크기 (px)
       */
      setFontSize: (size) => set({ fontSize: size }),

      /**
       * 알림 활성화/비활성화
       * @param enabled - 알림 활성화 여부
       */
      setEnableNotifications: (enabled) => set({ enableNotifications: enabled }),

      /**
       * 사운드 활성화/비활성화
       * @param enabled - 사운드 활성화 여부
       */
      setEnableSound: (enabled) => set({ enableSound: enabled }),

      /**
       * 로딩 상태 설정
       * @param loading - 로딩 중 여부
       */
      setIsLoading: (loading) => set({ isLoading: loading }),

      /**
       * 사이드바 열기/닫기
       * @param open - 사이드바 열림 여부
       */
      setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),

      /**
       * 현재 활성 화면 설정
       * @param screen - 화면 이름
       */
      setActiveScreen: (screen) => set({ activeScreen: screen }),

      /**
       * 온라인 상태 설정
       * @param online - 온라인 여부
       */
      setIsOnline: (online) => set({ isOnline: online }),

      /**
       * 마지막 동기화 시간 설정
       * @param time - Unix timestamp
       */
      setLastSyncTime: (time) => set({ lastSyncTime: time }),

      /**
       * 모든 설정을 기본값으로 초기화
       */
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'app-settings',
      storage: createJSONStorage(() => AsyncStorage),
      // 영구 저장할 필드만 선택
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        fontSize: state.fontSize,
        enableNotifications: state.enableNotifications,
        enableSound: state.enableSound,
      }),
    }
  )
);

/**
 * 테마 가져오기 (Selector 예시)
 */
export const selectTheme = (state: AppState) => state.theme;

/**
 * 언어 가져오기 (Selector 예시)
 */
export const selectLanguage = (state: AppState) => state.language;

/**
 * 로딩 상태 가져오기 (Selector 예시)
 */
export const selectIsLoading = (state: AppState) => state.isLoading;

/**
 * 온라인 상태 가져오기 (Selector 예시)
 */
export const selectIsOnline = (state: AppState) => state.isOnline;
