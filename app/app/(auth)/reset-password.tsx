import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { Button, Input, Loading } from '@/components/common';
import { AuthService } from '@/services';
import { useAppStore } from '@/store';
import { validateEmail } from '@/utils';
import { theme } from '@/constants/theme';

/**
 * ResetPasswordScreen
 *
 * 비밀번호 재설정 화면
 * - 이메일 입력
 * - 재설정 링크 전송
 */
export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const handleResetPassword = async () => {
    // 유효성 검사
    const emailValidation = validateEmail(email);

    if (!emailValidation.valid) {
      setEmailError(emailValidation.error || '');
      return;
    }

    setEmailError('');
    setIsLoading(true);

    try {
      // 비밀번호 재설정 API 호출
      const result = await AuthService.requestPasswordReset(email);

      if (result.success) {
        Alert.alert(
          '이메일 전송 완료',
          '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.',
          [
            {
              text: '확인',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('전송 실패', result.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '비밀번호 재설정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="전송 중..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopNavBar title="비밀번호 재설정" showBackButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={[styles.scroll, isDark && styles.scrollDark]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
            <Ionicons name="mail" size={32} color={theme.colors.primary} />
          </View>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            비밀번호를 잊으셨나요?
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            등록된 이메일 주소로 비밀번호 재설정 링크를 보내드립니다
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="이메일 주소"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            type="email"
            error={emailError}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Button
            title="재설정 링크 전송"
            onPress={handleResetPassword}
            variant="primary"
            size="large"
            fullWidth
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={[styles.backButtonText, isDark && styles.backButtonTextDark]}>
              로그인으로 돌아가기
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scrollDark: {
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainerDark: {
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  titleDark: {
    color: 'white',
  },
  subtitle: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  subtitleDark: {
    color: '#8E8E93',
  },

  // Form
  form: {
    gap: theme.spacing.md,
  },

  // Back Button
  backButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  backButtonText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  backButtonTextDark: {
    color: '#8E8E93',
  },
});
