import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

/**
 * Card Component
 *
 * 재사용 가능한 카드 컴포넌트
 *
 * @example
 * ```tsx
 * <Card>
 *   <Text>Card Content</Text>
 * </Card>
 * ```
 */
export default function Card({ children, style, noPadding = false }: CardProps) {
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  return (
    <View
      style={[
        styles.card,
        isDark && styles.cardDark,
        !noPadding && styles.cardPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },
  cardPadding: {
    padding: theme.spacing.md,
  },
});
