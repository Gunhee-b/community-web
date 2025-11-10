import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

/**
 * Index Route
 *
 * Root route that redirects to the appropriate screen.
 * The actual navigation logic is handled by _layout.tsx
 */
export default function Index() {
  const { user } = useAuthStore();

  // Simple redirect based on current auth state
  // The _layout.tsx will handle the actual navigation
  if (user) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
