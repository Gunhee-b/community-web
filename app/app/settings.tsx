import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAppStore, useAuthStore } from '@/store';
import { theme } from '@/constants/theme';

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
  const { logout } = useAuthStore();
  const isDark = appTheme === 'dark';

  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [meetingNotifications, setMeetingNotifications] = useState(true);
  const [questionNotifications, setQuestionNotifications] = useState(true);
  const [chatNotifications, setChatNotifications] = useState(true);
  const [notificationSound, setNotificationSound] = useState(true);

  const handleThemeChange = (selectedTheme: 'light' | 'dark') => {
    setTheme(selectedTheme);
  };

  const handleTermsPress = () => {
    console.log('Navigate to terms');
    // TODO: Navigate to terms screen
  };

  const handlePrivacyPress = () => {
    console.log('Navigate to privacy');
    // TODO: Navigate to privacy screen
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
            <View style={[styles.settingItem, styles.settingItemBorder, isDark && styles.settingItemBorderDark]}>
              <View style={styles.settingHeader}>
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
                    isDark && styles.themeButtonDark,
                  ]}
                  onPress={() => handleThemeChange('light')}
                >
                  <Ionicons
                    name="sunny"
                    size={18}
                    color={appTheme === 'light' ? theme.colors.primary : isDark ? '#8E8E93' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      appTheme === 'light' && styles.themeButtonTextActive,
                      isDark && styles.themeButtonTextDark,
                    ]}
                  >
                    라이트
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.themeButton,
                    appTheme === 'dark' && styles.themeButtonActive,
                    isDark && styles.themeButtonDark,
                  ]}
                  onPress={() => handleThemeChange('dark')}
                >
                  <Ionicons
                    name="moon"
                    size={18}
                    color={appTheme === 'dark' ? theme.colors.primary : isDark ? '#8E8E93' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.themeButtonText,
                      appTheme === 'dark' && styles.themeButtonTextActive,
                      isDark && styles.themeButtonTextDark,
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
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: theme.spacing.md,
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
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  themeButtonDark: {
    borderColor: '#374151',
  },
  themeButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  themeButtonText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  themeButtonTextDark: {
    color: '#8E8E93',
  },
  themeButtonTextActive: {
    color: theme.colors.primary,
  },

  // Logout
  logoutText: {
    color: theme.colors.error,
  },
});
