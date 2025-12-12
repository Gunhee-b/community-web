import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store';
import { supabase } from '@/services/supabase';
import { AuthService } from '@/services';

/**
 * ProfileSetupScreen
 *
 * 프로필 설정 화면 (온보딩)
 * - 새로운 소셜 로그인 사용자를 위한 프로필 설정
 * - 사용자명 및 표시 이름 입력
 * - Dark Theme, Rezom 스타일
 */
export default function ProfileSetupScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [username, setUsername] = useState(user?.username || '');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; fullName?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { username?: string; fullName?: string } = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = '사용자명을 입력해주세요';
    } else if (username.length < 2) {
      newErrors.username = '사용자명은 2자 이상이어야 합니다';
    } else if (username.length > 20) {
      newErrors.username = '사용자명은 20자 이하여야 합니다';
    } else if (!/^[a-zA-Z0-9_가-힣]+$/.test(username)) {
      newErrors.username = '사용자명은 영문, 숫자, 한글, 밑줄(_)만 사용할 수 있습니다';
    }

    // Full name validation (optional but if provided)
    if (fullName && fullName.length > 50) {
      newErrors.fullName = '이름은 50자 이하여야 합니다';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user?.id) {
      Alert.alert('오류', '사용자 정보를 찾을 수 없습니다');
      return;
    }

    setLoading(true);

    try {
      // Update profile in database (snake_case)
      const { data, error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          full_name: fullName.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', error);

        // Check for unique constraint violation
        if (error.code === '23505' || error.message.includes('unique')) {
          setErrors({ username: '이미 사용 중인 사용자명입니다' });
          return;
        }

        throw error;
      }

      // Update local auth store
      updateUser({
        username: data.username,
      });

      // Also update AuthService local storage
      await AuthService.updateUserData({
        username: data.username,
      });

      console.log('✅ Profile setup complete:', data.username);

      // Navigate to home
      router.replace('/(tabs)/home');
    } catch (error: any) {
      console.error('Profile setup error:', error);
      Alert.alert(
        '오류',
        error.message || '프로필 설정 중 오류가 발생했습니다. 다시 시도해주세요.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1a1a2e', '#16213e', '#0f0f23']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.logoGradient}
              >
                <Ionicons name="person-add" size={32} color="#fff" />
              </LinearGradient>
            </View>
            <Text style={styles.title}>프로필 설정</Text>
            <Text style={styles.subtitle}>
              Rezom 커뮤니티에서 사용할 프로필을 설정해주세요
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Username Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                사용자명 <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                <Ionicons name="at" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="예: rezom_user"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={(text) => {
                    setUsername(text);
                    if (errors.username) setErrors({ ...errors, username: undefined });
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
              </View>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
              <Text style={styles.helperText}>
                다른 사용자에게 표시되는 고유한 이름입니다
              </Text>
            </View>

            {/* Full Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름 (선택)</Text>
              <View style={[styles.inputWrapper, errors.fullName && styles.inputError]}>
                <Ionicons name="person" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="예: 홍길동"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                  }}
                  maxLength={50}
                />
              </View>
              {errors.fullName && (
                <Text style={styles.errorText}>{errors.fullName}</Text>
              )}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#4a4a6a', '#3a3a5a'] : ['#6366f1', '#8b5cf6']}
                style={styles.submitGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.submitText}>시작하기</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              프로필은 나중에 설정에서 변경할 수 있습니다
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b8b9e',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  required: {
    color: '#ef4444',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#6b6b7e',
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#6b6b7e',
    textAlign: 'center',
  },
});
