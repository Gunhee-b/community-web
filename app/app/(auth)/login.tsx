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
 * - 소셜 로그인만 지원 (Google, Kakao, Naver)
 */
export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // 🔧 개발 모드: Mock 로그인 (서버 연결 없이 테스트)
  const handleDevLogin = () => {
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000001', // UUID 형식으로 변경
      username: '테스트유저',
      email: 'test@example.com',
      role: 'user' as const,
      created_at: new Date().toISOString(),
    };
    const mockToken = 'mock-jwt-token-for-testing';

    login(mockUser, mockToken, 'social');
    console.log('✅ Dev Mode: Mock login successful');
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao' | 'naver') => {
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
        </View>

        {/* 🔧 개발 모드: Mock 로그인 버튼 */}
        <TouchableOpacity
          style={styles.devButton}
          onPress={handleDevLogin}
        >
          <Text style={styles.devButtonText}>
            🔧 개발자 모드: 바로 입장하기 (테스트용)
          </Text>
        </TouchableOpacity>
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

  // Dev Mode
  devButton: {
    marginTop: theme.spacing.xxl,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: '#FF9500',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  devButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
