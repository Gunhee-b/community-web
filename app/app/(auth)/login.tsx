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
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Input, Loading } from '@/components/common';
import { AuthService } from '@/services';
import { useAuthStore, useAppStore } from '@/store';
import { validateEmail, validatePassword } from '@/utils';
import { theme } from '@/constants/theme';

/**
 * LoginScreen
 *
 * 로그인 화면
 * - 이메일/비밀번호 로그인
 * - 소셜 로그인 (Google, Kakao, Naver)
 * - 회원가입 링크
 * - 비밀번호 재설정 링크
 */
export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const handleLogin = async () => {
    // 유효성 검사
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.valid || !passwordValidation.valid) {
      setEmailError(emailValidation.error || '');
      setPasswordError(passwordValidation.error || '');
      return;
    }

    setEmailError('');
    setPasswordError('');
    setIsLoading(true);

    try {
      // 로그인 API 호출
      const result = await AuthService.login({ email, password });

      if (result.success && result.data) {
        // AuthStore에 저장
        login(result.data.user, result.data.access_token, 'local');

        // 홈 화면으로 이동 (자동으로 처리됨 - _layout.tsx)
        console.log('✅ Login successful');
      } else {
        Alert.alert('로그인 실패', result.error || '알 수 없는 오류가 발생했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
    setIsLoading(true);

    try {
      let result;
      switch (provider) {
        case 'google':
          result = await AuthService.signInWithGoogle();
          break;
        case 'kakao':
          // TODO: Kakao 로그인 구현
          Alert.alert('알림', 'Kakao 로그인은 곧 지원될 예정입니다.');
          setIsLoading(false);
          return;
        case 'naver':
          // TODO: Naver 로그인 구현
          Alert.alert('알림', 'Naver 로그인은 곧 지원될 예정입니다.');
          setIsLoading(false);
          return;
      }

      if (result?.success && result.data) {
        login(result.data.user, result.data.access_token, provider);
        console.log(`✅ ${provider} login successful`);
      } else {
        Alert.alert('로그인 실패', result?.error || '소셜 로그인에 실패했습니다.');
      }
    } catch (error: any) {
      Alert.alert('오류', error.message || '소셜 로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen message="로그인 중..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        style={[styles.scroll, isDark && styles.scrollDark]}
      >
        {/* Logo and Title */}
        <View style={styles.header}>
          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Text style={styles.logoText}>I</Text>
          </LinearGradient>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            INGK Community
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            한국 커뮤니티에 오신 것을 환영합니다
          </Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
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

          <Input
            label="비밀번호"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            type="password"
            leftIcon="lock-closed-outline"
            error={passwordError}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => router.push('/(auth)/reset-password')}
            style={styles.forgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              비밀번호를 잊으셨나요?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <Button
            title="로그인"
            onPress={handleLogin}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
          <Text style={[styles.dividerText, isDark && styles.dividerTextDark]}>
            또는
          </Text>
          <View style={[styles.dividerLine, isDark && styles.dividerLineDark]} />
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          <TouchableOpacity
            style={[styles.socialButton, isDark && styles.socialButtonDark]}
            onPress={() => handleSocialLogin('google')}
          >
            <View style={[styles.socialIcon, { backgroundColor: '#EA4335' }]} />
            <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>
              Google로 계속하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, isDark && styles.socialButtonDark]}
            onPress={() => handleSocialLogin('kakao')}
          >
            <View style={[styles.socialIcon, { backgroundColor: '#FEE500' }]} />
            <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>
              Kakao로 계속하기
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, isDark && styles.socialButtonDark]}
            onPress={() => handleSocialLogin('naver')}
          >
            <View style={[styles.socialIcon, { backgroundColor: '#03C75A' }]} />
            <Text style={[styles.socialButtonText, isDark && styles.socialButtonTextDark]}>
              Naver로 계속하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* Signup Link */}
        <View style={styles.signupContainer}>
          <Text style={[styles.signupText, isDark && styles.signupTextDark]}>
            계정이 없으신가요?{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={styles.signupLink}>회원가입</Text>
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
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  titleDark: {
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  subtitleDark: {
    color: '#8E8E93',
  },

  // Form
  form: {
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: theme.colors.primary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E7',
  },
  dividerLineDark: {
    backgroundColor: '#38383A',
  },
  dividerText: {
    paddingHorizontal: theme.spacing.md,
    fontSize: 14,
    color: '#999999',
  },
  dividerTextDark: {
    color: '#8E8E93',
  },

  // Social Buttons
  socialButtons: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E5E5E7',
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  socialButtonDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#38383A',
  },
  socialIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  socialButtonTextDark: {
    color: 'white',
  },

  // Signup
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  signupTextDark: {
    color: '#8E8E93',
  },
  signupLink: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
