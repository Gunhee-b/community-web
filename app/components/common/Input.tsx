import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { useAppStore } from '@/store';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  type?: 'text' | 'password' | 'email' | 'number';
}

/**
 * Input Component
 *
 * 재사용 가능한 입력 필드 컴포넌트
 *
 * @example
 * ```tsx
 * <Input
 *   label="이메일"
 *   placeholder="이메일을 입력하세요"
 *   value={email}
 *   onChangeText={setEmail}
 *   type="email"
 *   leftIcon="mail-outline"
 *   error={emailError}
 * />
 * ```
 */
export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  type = 'text',
  ...props
}: InputProps) {
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // 타입에 따른 설정
  const getInputProps = () => {
    switch (type) {
      case 'password':
        return {
          secureTextEntry: !isPasswordVisible,
          rightIcon: isPasswordVisible ? 'eye-off-outline' : 'eye-outline',
          onRightIconPress: () => setIsPasswordVisible(!isPasswordVisible),
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        };
      case 'email':
        return {
          keyboardType: 'email-address' as const,
          autoCapitalize: 'none' as const,
          autoCorrect: false,
        };
      case 'number':
        return {
          keyboardType: 'numeric' as const,
        };
      default:
        return {};
    }
  };

  const inputProps = getInputProps();
  const finalRightIcon = inputProps.rightIcon || rightIcon;
  const finalOnRightIconPress = inputProps.onRightIconPress || onRightIconPress;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>
      )}
      <View
        style={[
          styles.inputContainer,
          isDark && styles.inputContainerDark,
          error && styles.inputContainerError,
        ]}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={20}
            color={isDark ? '#8E8E93' : '#999999'}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
            leftIcon && styles.inputWithLeftIcon,
            finalRightIcon && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={isDark ? '#8E8E93' : '#999999'}
          {...inputProps}
          {...props}
        />
        {finalRightIcon && (
          <TouchableOpacity
            onPress={finalOnRightIconPress}
            style={styles.rightIcon}
            disabled={!finalOnRightIconPress}
          >
            <Ionicons
              name={finalRightIcon}
              size={20}
              color={isDark ? '#8E8E93' : '#999999'}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  labelDark: {
    color: '#FFFFFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    paddingHorizontal: theme.spacing.md,
  },
  inputContainerDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.sm,
  },
  inputDark: {
    color: '#FFFFFF',
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginRight: theme.spacing.xs,
  },
  rightIcon: {
    marginLeft: theme.spacing.xs,
    padding: theme.spacing.xs,
  },
  error: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});
