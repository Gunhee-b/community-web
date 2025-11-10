import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Loading Component
 *
 * 로딩 스피너 컴포넌트
 *
 * @example
 * ```tsx
 * <Loading message="데이터를 불러오는 중..." />
 * <Loading fullScreen />
 * ```
 */
export default function Loading({ message, fullScreen = false }: LoadingProps) {
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const content = (
    <>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && (
        <Text style={[styles.message, isDark && styles.messageDark]}>
          {message}
        </Text>
      )}
    </>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, isDark && styles.fullScreenDark]}>
        {content}
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
  },
  fullScreenDark: {
    backgroundColor: '#000000',
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  messageDark: {
    color: '#FFFFFF',
  },
});
