import { Stack } from 'expo-router';

/**
 * Auth Group Layout
 *
 * 인증 관련 화면들을 그룹화
 * - Login
 * - Signup
 * - Reset Password
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
