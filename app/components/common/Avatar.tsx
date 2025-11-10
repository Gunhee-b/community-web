import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/constants/theme';

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

/**
 * Avatar Component
 *
 * 사용자 아바타 컴포넌트
 * - 이미지가 있으면 이미지 표시
 * - 이미지가 없으면 이름의 첫 글자 표시
 *
 * @example
 * ```tsx
 * <Avatar name="김민수" size="medium" />
 * <Avatar imageUrl="https://..." size="large" />
 * ```
 */
export default function Avatar({
  name,
  imageUrl,
  size = 'medium',
  style,
}: AvatarProps) {
  const sizeValue = sizes[size];
  const fontSize = fontSizes[size];
  const initial = name ? name.charAt(0).toUpperCase() : '?';

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.avatar,
          {
            width: sizeValue,
            height: sizeValue,
            borderRadius: sizeValue / 2,
          },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.avatarPlaceholder,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
        },
        style,
      ]}
    >
      <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
    </View>
  );
}

const sizes = {
  small: 32,
  medium: 48,
  large: 96,
};

const fontSizes = {
  small: 14,
  medium: 18,
  large: 36,
};

const styles = StyleSheet.create({
  avatar: {
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: 'white',
    fontWeight: '600',
  },
});
