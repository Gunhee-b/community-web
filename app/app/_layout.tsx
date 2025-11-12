import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { AuthService } from '@/services';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

/**
 * Root Layout Component
 *
 * Expo Router의 루트 레이아웃
 * - 앱 초기화
 * - 인증 상태 복원
 * - 자동 네비게이션 (로그인/메인)
 */
export default function RootLayout() {
  const { user, initialize, isLoading } = useAuthStore();
  const { theme } = useAppStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // 앱 시작 시 인증 상태 복원
    initializeApp();
  }, []);

  useEffect(() => {
    // 인증 상태에 따라 자동 네비게이션
    if (isLoading) return;

    // segments가 초기화되지 않았으면 대기 (Root Layout 마운트 전)
    if (!segments || segments.length === 0) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // 무한 루프 방지: 이미 올바른 그룹에 있으면 리다이렉트하지 않음
    if (!user && !inAuthGroup) {
      // 로그인 안 되어 있고, 인증 화면이 아니면 로그인 화면으로
      setTimeout(() => {
        router.replace('/(auth)/login');
      }, 0);
    } else if (user && !inTabsGroup && inAuthGroup) {
      // 로그인 되어 있고, 탭 화면이 아니고, 인증 화면에 있으면 메인 화면으로
      setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 0);
    }
  }, [user, isLoading, segments]);

  const initializeApp = async () => {
    try {
      // AuthStore 초기화 (AsyncStorage에서 사용자 정보 로드)
      await initialize();

      // 토큰이 있으면 자동 로그인 시도
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        const currentUser = await AuthService.fetchCurrentUser();
        if (currentUser) {
          console.log('✅ User authenticated:', currentUser.username);
        }
      }
    } catch (error) {
      console.error('❌ Failed to initialize app:', error);
    }
  };

  // isLoading 제거 - Zustand persist가 자동으로 처리
  // 로딩 중에도 레이아웃을 렌더링하여 빈 화면 방지

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: theme === 'dark' ? '#000000' : '#F2F2F7',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
