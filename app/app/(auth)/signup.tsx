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
import { useAuthStore, useAppStore } from '@/store';
import { validateEmail, validatePassword, validateUsername } from '@/utils';
import { theme } from '@/constants/theme';

/**
 * SignupScreen
 *
 * 회원가입 화면
 * - 사용자 이름, 이메일, 비밀번호 입력
 * - 초대 코드 입력
 * - 유효성 검사
 */
export default function SignupScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const handleSignup = async () => {
    // 유효성 검사
    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!usernameValidation.valid || !emailValidation.valid || !passwordValidation.valid) {
      setUsernameError(usernameValidation.error || '');
      setEmailError(emailValidation.error || '');
      setPasswordError(passwordValidation.error || '');
      return;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 초대 코드 확인
    if (!inviteCode.trim()) {
      setInviteCodeError('초대 코드를 입력해주세요.');
      return;
    }

    // 에러 초기화
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setInviteCodeError('');
    setIsLoading(true);

    try {
      // 회원가입 API 호출
      const result = await AuthService.signup({
        username,
        email,
        password,
        inviteCode,
      });

      if (result.success && result.data) {
        // AuthStore에 저장
        login(result.data.user, result.data.access_token, 'local');

        Alert.alert('가입 완료', '회원가입이 완료되었습니다!', [
          {
            text: '확인',
            onPress: () => {
              // 자동으로 홈 화면으로 이동됨 (_layout.tsx)
              console.log('✅ Signup successful');
            },
          },
        ]);
      } else {
        Alert.alert('가입 실패', result.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="가입 중..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopNavBar title="회원가입" showBackButton />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={[styles.scroll, isDark && styles.scrollDark]}
      >
        <View style={styles.form}>
          {/* Username */}
          <Input
            label="사용자 이름"
            placeholder="사용자 이름"
            value={username}
            onChangeText={setUsername}
            leftIcon="person-outline"
            error={usernameError}
            autoCapitalize="none"
          />

          {/* Email */}
          <Input
            label="이메일"
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            type="email"
            leftIcon="mail-outline"
            error={emailError}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password */}
          <Input
            label="비밀번호"
            placeholder="8자 이상"
            value={password}
            onChangeText={setPassword}
            type="password"
            leftIcon="lock-closed-outline"
            error={passwordError}
          />

          {/* Confirm Password */}
          <Input
            label="비밀번호 확인"
            placeholder="비밀번호 재입력"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            type="password"
            leftIcon="lock-closed-outline"
            error={confirmPasswordError}
          />

          {/* Invite Code */}
          <Input
            label="초대 코드"
            placeholder="초대 코드 입력"
            value={inviteCode}
            onChangeText={setInviteCode}
            leftIcon="key-outline"
            error={inviteCodeError}
            autoCapitalize="none"
          />

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, isDark && styles.termsTextDark]}>
              가입하면{' '}
              <Text style={styles.termsLink}>이용약관</Text>과{' '}
              <Text style={styles.termsLink}>개인정보처리방침</Text>에 동의하는 것으로 간주됩니다.
            </Text>
          </View>

          {/* Signup Button */}
          <Button
            title="가입하기"
            onPress={handleSignup}
            variant="primary"
            size="large"
            fullWidth
            style={styles.signupButton}
          />
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
    paddingVertical: theme.spacing.lg,
  },

  // Form
  form: {
    gap: theme.spacing.md,
  },

  // Terms
  termsContainer: {
    paddingTop: theme.spacing.sm,
  },
  termsText: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
    lineHeight: 18,
  },
  termsTextDark: {
    color: '#8E8E93',
  },
  termsLink: {
    color: theme.colors.primary,
  },

  // Signup Button
  signupButton: {
    marginTop: theme.spacing.lg,
  },
});
