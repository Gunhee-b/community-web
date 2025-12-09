import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAppStore, useAuthStore } from '@/store';
import { theme } from '@/constants/theme';
import { supabase } from '@/services/supabase';

/**
 * SettingsScreen
 *
 * 설정 화면
 * - 테마 설정
 * - 알림 설정
 * - 정보
 */
export default function SettingsScreen() {
  const router = useRouter();
  const { theme: appTheme, setTheme } = useAppStore();
  const { user, logout } = useAuthStore();
  const isDark = appTheme === 'dark';

  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [meetingNotifications, setMeetingNotifications] = useState(true);
  const [questionNotifications, setQuestionNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);

  // Account Deletion States
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
  };

  const handleTermsPress = () => {
    router.push('/terms' as any);
  };

  const handlePrivacyPress = () => {
    router.push('/privacy' as any);
  };

  const handleVersionPress = () => {
    Alert.alert('버전 정보', 'Rezom Community v1.0.0');
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
            // _layout.tsx가 자동으로 로그인 화면으로 이동시킴
          },
        },
      ]
    );
  };

  const handleDeleteAccountPress = () => {
    setDeleteConfirmation('');
    setDeleteModalVisible(true);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== '계정삭제') {
      Alert.alert('오류', "'계정삭제'를 정확히 입력해주세요.");
      return;
    }

    setIsDeleting(true);

    try {
      // Supabase RPC로 계정 삭제 (모든 관련 데이터 삭제)
      const { data, error } = await supabase.rpc('delete_user_account', {
        p_user_id: user?.id,
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || '계정 삭제 중 오류가 발생했습니다');
      }

      // 로그아웃 및 로컬 데이터 삭제
      await logout();

      Alert.alert(
        '계정 삭제 완료',
        '계정이 성공적으로 삭제되었습니다. 그동안 이용해주셔서 감사합니다.',
        [{ text: '확인' }]
      );

      setDeleteModalVisible(false);
    } catch (error: any) {
      console.error('Delete account error:', error);
      Alert.alert('오류', error.message || '계정 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="설정" showBackButton />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            화면 설정
          </Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            {/* Theme */}
            <View style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark, styles.themeSettingItem]}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="moon"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                  테마
                </Text>
              </View>
              <View style={styles.themeButtons}>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    appTheme === 'light' && styles.themeButtonActive,
                    isDark && !( appTheme === 'light') && styles.themeButtonDark,
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Ionicons
                    name="sunny"
                    size={18}
                    color={appTheme === 'light' ? 'white' : isDark ? '#AEAEB2' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      appTheme === 'light' && styles.themeButtonTextActive,
                      isDark && !(appTheme === 'light') && styles.themeButtonTextDark,
                    ]}
                  >
                    라이트
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    appTheme === 'dark' && styles.themeButtonActive,
                    isDark && !(appTheme === 'dark') && styles.themeButtonDark,
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Ionicons
                    name="moon"
                    size={18}
                    color={appTheme === 'dark' ? 'white' : isDark ? '#AEAEB2' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      appTheme === 'dark' && styles.themeButtonTextActive,
                      isDark && !(appTheme === 'dark') && styles.themeButtonTextDark,
                    ]}
                  >
                    다크
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Language */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => console.log('Language settings')}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="globe-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                  언어
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, isDark && styles.settingValueDark]}>
                  한국어
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDark ? '#636366' : '#9CA3AF'}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            알림 설정
          </Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            {/* Push Notifications */}
            <View style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="notifications-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                  푸시 알림
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor="white"
              />
            </View>

            {/* Meeting Notifications */}
            <View style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}>
              <Text style={[styles.settingSubLabel, isDark && styles.settingSubLabelDark]}>
                모임 알림
              </Text>
              <Switch
                value={meetingNotifications}
                onValueChange={setMeetingNotifications}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor="white"
              />
            </View>

            {/* Question Notifications */}
            <View style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}>
              <Text style={[styles.settingSubLabel, isDark && styles.settingSubLabelDark]}>
                질문 알림
              </Text>
              <Switch
                value={questionNotifications}
                onValueChange={setQuestionNotifications}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor="white"
              />
            </View>

            {/* Chat Notifications */}
            <View style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}>
              <Text style={[styles.settingSubLabel, isDark && styles.settingSubLabelDark]}>
                채팅 알림
              </Text>
              <Switch
                value={chatNotifications}
                onValueChange={setChatNotifications}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor="white"
              />
            </View>

            {/* Notification Sound */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons
                  name="volume-high-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                  알림 소리
                </Text>
              </View>
              <Switch
                value={notificationSound}
                onValueChange={setNotificationSound}
                trackColor={{ false: '#D1D5DB', true: theme.colors.primary }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            정보
          </Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            {/* Terms */}
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}
              onPress={handleTermsPress}
            >
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                이용약관
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#636366' : '#9CA3AF'}
              />
            </TouchableOpacity>

            {/* Privacy */}
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}
              onPress={handlePrivacyPress}
            >
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                개인정보처리방침
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#636366' : '#9CA3AF'}
              />
            </TouchableOpacity>

            {/* Version */}
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleVersionPress}
            >
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                버전 정보
              </Text>
              <Text style={[styles.settingValue, isDark && styles.settingValueDark]}>
                1.0.0
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Management Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            계정 관리
          </Text>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <TouchableOpacity
              style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}
              onPress={() => router.push('/blocked-users' as any)}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="person-remove-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>
                  차단 목록
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? '#636366' : '#9CA3AF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleDeleteAccountPress}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.error}
                />
                <Text style={[styles.settingLabel, styles.deleteText]}>
                  계정 삭제
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={[styles.card, isDark && styles.cardDark]}>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={handleLogout}
            >
              <View style={styles.settingLeft}>
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={theme.colors.error}
                />
                <Text style={[styles.settingLabel, styles.logoutText]}>
                  로그아웃
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, isDark && styles.modalDark]}>
            <Ionicons
              name="warning"
              size={48}
              color={theme.colors.error}
              style={styles.modalIcon}
            />
            <Text style={[styles.modalTitle, isDark && styles.modalTitleDark]}>
              계정을 삭제하시겠습니까?
            </Text>
            <Text style={[styles.modalDescription, isDark && styles.modalDescriptionDark]}>
              계정을 삭제하면 다음 데이터가 영구적으로 삭제됩니다:
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• 모든 개인정보</Text>
              <Text style={styles.warningItem}>• 작성한 답변 및 글</Text>
              <Text style={styles.warningItem}>• 90-Day Challenge 기록</Text>
              <Text style={styles.warningItem}>• 모임 참여 기록</Text>
            </View>
            <Text style={[styles.modalWarning, isDark && styles.modalWarningDark]}>
              ⚠️ 이 작업은 되돌릴 수 없습니다
            </Text>
            <Text style={[styles.modalInstruction, isDark && styles.modalInstructionDark]}>
              계속하려면 아래에 '<Text style={styles.boldText}>계정삭제</Text>'를 입력하세요:
            </Text>
            <TextInput
              style={[
                styles.confirmInput,
                isDark && styles.confirmInputDark,
              ]}
              placeholder="계정삭제"
              placeholderTextColor={isDark ? '#8E8E93' : '#9CA3AF'}
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.deleteButton,
                  (isDeleting || deleteConfirmation !== '계정삭제') && styles.deleteButtonDisabled,
                ]}
                onPress={handleDeleteAccount}
                disabled={isDeleting || deleteConfirmation !== '계정삭제'}
              >
                {isDeleting ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.deleteButtonText}>삭제</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },

  // Section
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.md,
  },
  sectionTitleDark: {
    color: '#8E8E93',
  },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },

  // Setting Item
  settingItem: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingItemBorderDark: {
    borderBottomColor: '#2C2C2E',
  },
  themeSettingItem: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  settingLabelDark: {
    color: 'white',
  },
  settingSubLabel: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginLeft: 32,
  },
  settingSubLabelDark: {
    color: '#8E8E93',
  },
  settingValue: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  settingValueDark: {
    color: '#8E8E93',
  },

  // Theme Buttons
  themeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
    backgroundColor: 'white',
  },
  themeButtonDark: {
    borderColor: '#3A3A3C',
    backgroundColor: '#2C2C2E',
  },
  themeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  themeButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: '#6B7280',
  },
  themeButtonTextDark: {
    color: '#AEAEB2',
  },
  themeButtonTextActive: {
    color: 'white',
    fontWeight: '700',
  },

  // Logout & Delete
  logoutText: {
    color: theme.colors.error,
  },
  deleteText: {
    color: theme.colors.error,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalDark: {
    backgroundColor: '#1C1C1E',
  },
  modalIcon: {
    alignSelf: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitleDark: {
    color: 'white',
  },
  modalDescription: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.sm,
  },
  modalDescriptionDark: {
    color: '#8E8E93',
  },
  warningList: {
    marginBottom: theme.spacing.md,
    paddingLeft: theme.spacing.sm,
  },
  warningItem: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginVertical: 2,
  },
  modalWarning: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  modalWarningDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  modalInstruction: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  modalInstructionDark: {
    color: '#8E8E93',
  },
  boldText: {
    fontWeight: '600',
    color: theme.colors.error,
  },
  confirmInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  confirmInputDark: {
    borderColor: '#374151',
    color: 'white',
    backgroundColor: '#2C2C2E',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#6B7280',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});
