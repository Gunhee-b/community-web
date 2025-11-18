import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { useAuthStore, useAppStore } from '@/store';
import { AuthService } from '@/services';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { subscribeToNotifications, requestNotificationPermissions } from '@/services/notifications';

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
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // 앱 시작 시 인증 상태 복원
    initializeApp();

    // 딥링크 리스너 설정 (OAuth 콜백 처리)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 앱이 이미 열려있을 때 딥링크 처리
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    // 알림 권한 요청
    requestNotificationPermissions();

    // 알림 리스너 설정
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data;

      // 알림 클릭 시 관련 화면으로 이동
      if (data?.relatedId) {
        if (data.type === 'meeting_join' || data.type === 'meeting_chat') {
          router.push(`/meetings/${data.relatedId}`);
        } else if (data.type === 'new_question') {
          router.push(`/questions/${data.relatedId}`);
        }
      }
    });

    return () => {
      subscription.remove();
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  // 사용자가 로그인했을 때 알림 구독
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToNotifications(user.id, (notification) => {
        console.log('New notification received:', notification);
      });

      return unsubscribe;
    }
  }, [user]);

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

  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log('Deep link received:', url);

    // Kakao OAuth 콜백 URL 처리
    // Kakao OAuth: rezom://auth/callback?code=... (from kakao-callback Edge Function)
    if (url.includes('auth/callback')) {
      console.log('OAuth callback detected, processing...');

      try {
        const parsedUrl = new URL(url);
        const code = parsedUrl.searchParams.get('code');
        const error = parsedUrl.searchParams.get('error');

        // Check for OAuth errors
        if (error) {
          const errorDescription = parsedUrl.searchParams.get('error_description');
          console.error('OAuth error:', error, errorDescription);
          router.replace('/(auth)/login');
          return;
        }

        // Kakao OAuth 콜백 처리 (code 파라미터가 있으면)
        if (code) {
          console.log('Kakao OAuth callback detected with code');
          // Kakao는 signInWithKakao 메서드 내부에서 이미 처리됨
          // WebBrowser.openAuthSessionAsync가 이 URL을 result.url로 반환함
          return;
        }

        // Google OAuth는 signInWithGoogle() 내부에서 직접 처리됨
        console.log('OAuth callback received but no code found, ignoring...');
      } catch (error) {
        console.error('Deep link processing error:', error);
      }
    }
  };

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
