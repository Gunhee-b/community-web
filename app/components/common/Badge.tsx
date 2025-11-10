import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Badge Component
 *
 * 재사용 가능한 배지 컴포넌트
 *
 * @example
 * ```tsx
 * <Badge variant="primary">Admin</Badge>
 * <Badge variant="success">완료</Badge>
 * ```
 */
export default function Badge({
  children,
  variant = 'primary',
  size = 'medium',
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], styles[size], style]}>
      <Text style={[styles.text, styles[`${size}Text`], textStyle]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  success: {
    backgroundColor: theme.colors.success,
  },
  warning: {
    backgroundColor: theme.colors.warning,
  },
  error: {
    backgroundColor: theme.colors.error,
  },
  info: {
    backgroundColor: theme.colors.info,
  },

  // Sizes
  small: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },

  // Text
  text: {
    color: 'white',
    fontWeight: '600',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
});
