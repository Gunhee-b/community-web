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
  ViewStyle,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Loading } from '@/components/common';
import { AuthService } from '@/services';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';

/**
 * LoginScreen
 *
 * 로그인 화면
 * - 소셜 로그인만 지원 (Apple, Google, Kakao)
 */
export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver' | 'apple') => {
    setIsLoading(true);

    try {
      let result: any;
      switch (provider) {
        case 'google':
          result = await AuthService.signInWithGoogle();
          break;
        case 'kakao':
          result = await AuthService.signInWithKakao();
          break;
        case 'naver':
          result = await AuthService.signInWithNaver();
          break;
        case 'apple':
          result = await AuthService.signInWithApple();
          break;
      }

      if (result?.success && result?.data) {
        login(result.data.user, result.data.access_token, 'social');
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
            <Text style={styles.logoText}>R</Text>
          </LinearGradient>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Rezom Community
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
            한국 커뮤니티에 오신 것을 환영합니다
          </Text>
          <Text style={[styles.subtitle, isDark && styles.subtitleDark, { marginTop: 16 }]}>
            소셜 계정으로 로그인하세요
          </Text>
        </View>

        {/* Social Login Buttons */}
        <View style={styles.socialButtons}>
          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={() => handleSocialLogin('apple')}
            >
              <View style={[styles.socialIcon, { backgroundColor: '#000000' }]} />
              <Text style={[styles.socialButtonText, styles.appleButtonText]}>
                Apple로 계속하기
              </Text>
            </TouchableOpacity>
          )}

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
            style={[styles.socialButton, styles.kakaoButton]}
            onPress={() => handleSocialLogin('kakao')}
          >
            <View style={[styles.socialIcon, { backgroundColor: '#3C1E1E' }]} />
            <Text style={[styles.socialButtonText, styles.kakaoButtonText]}>
              Kakao로 계속하기
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
            로그인 시 서비스 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  scroll: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  } as ViewStyle,
  scrollDark: {
    backgroundColor: '#000000',
  } as ViewStyle,
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  } as ViewStyle,

  // Header
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  } as ViewStyle,
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  } as ViewStyle,
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

  // Social Buttons
  socialButtons: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
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
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  appleButtonText: {
    color: 'white',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    borderColor: '#FEE500',
  },
  kakaoButtonText: {
    color: '#3C1E1E',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerTextDark: {
    color: '#8E8E93',
  },
});
