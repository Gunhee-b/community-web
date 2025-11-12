import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';

/**
 * ProfileScreen
 *
 * 프로필 화면
 * - 프로필 정보
 * - 활동 통계
 * - 관리자 대시보드 (관리자만)
 * - 메뉴 항목
 * - 로그아웃
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, isAdmin } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // Mock data - TODO: Get from API
  const userProfile = {
    username: user?.username || '김민수',
    email: user?.email || 'minsu.kim@example.com',
    role: isAdmin() ? 'Admin' : 'Member',
    joinDate: '2024년 1월',
    meetingsJoined: 12,
    questionsAnswered: 45,
    votesParticipated: 3,
  };

  const handleLogout = () => {
    logout();
    // _layout.tsx가 자동으로 로그인 화면으로 이동시킴
  };

  const handleSettings = () => {
    console.log('Navigate to settings');
    // TODO: Navigate to settings screen
  };

  const handleAdminDashboard = () => {
    console.log('Navigate to admin dashboard');
    // TODO: Navigate to admin dashboard
  };

  const handleEditProfile = () => {
    console.log('Edit profile');
    // TODO: Open edit profile modal
  };

  const handleMyMeetings = () => {
    console.log('Navigate to my meetings');
    // TODO: Navigate to my meetings
  };

  const handleMyAnswers = () => {
    console.log('Navigate to my answers');
    // TODO: Navigate to my answers
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar
        title="프로필"
        rightAction={
          <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={isDark ? 'white' : theme.colors.text.primary}
            />
          </TouchableOpacity>
        }
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
          <LinearGradient
            colors={['#007AFF', '#5856D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{userProfile.username[0]}</Text>
          </LinearGradient>
          <Text style={[styles.username, isDark && styles.textDark]}>
            {userProfile.username}
          </Text>
          <Text style={[styles.email, isDark && styles.textSecondaryDark]}>
            {userProfile.email}
          </Text>
          <View style={styles.badges}>
            <View
              style={[
                styles.roleBadge,
                isAdmin() ? styles.adminBadge : styles.memberBadge,
              ]}
            >
              <Text style={styles.roleBadgeText}>{userProfile.role}</Text>
            </View>
            <Text style={[styles.joinDate, isDark && styles.textTertiaryDark]}>
              {userProfile.joinDate} 가입
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>프로필 수정</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, isDark && styles.statsCardDark]}>
          <Text style={[styles.statsTitle, isDark && styles.textDark]}>
            활동 통계
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {userProfile.meetingsJoined}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>
                참여한 모임
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {userProfile.questionsAnswered}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>
                답변한 질문
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.success }]}>
                {userProfile.votesParticipated}
              </Text>
              <Text style={[styles.statLabel, isDark && styles.textSecondaryDark]}>
                투표 참여
              </Text>
            </View>
          </View>
        </View>

        {/* Admin Section */}
        {isAdmin() && (
          <View style={[styles.menuCard, isDark && styles.menuCardDark]}>
            <TouchableOpacity
              style={styles.adminMenuItem}
              onPress={handleAdminDashboard}
              activeOpacity={0.7}
            >
              <View style={styles.adminIconContainer}>
                <Ionicons name="shield" size={20} color="white" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, isDark && styles.textDark]}>
                  관리자 대시보드
                </Text>
                <Text style={[styles.menuItemSubtitle, isDark && styles.textSecondaryDark]}>
                  커뮤니티 관리 및 설정
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={[styles.menuCard, isDark && styles.menuCardDark]}>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder, isDark && styles.menuItemBorderDark]}
            onPress={handleMyMeetings}
            activeOpacity={0.7}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
            <Text style={[styles.menuItemText, isDark && styles.textDark]}>
              내가 참여한 모임
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder, isDark && styles.menuItemBorderDark]}
            onPress={handleMyAnswers}
            activeOpacity={0.7}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
            <Text style={[styles.menuItemText, isDark && styles.textDark]}>
              내 답변 모아보기
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleSettings}
            activeOpacity={0.7}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
            <Text style={[styles.menuItemText, isDark && styles.textDark]}>
              설정
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
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

  // Settings Button
  settingsButton: {
    padding: theme.spacing.xs,
    marginHorizontal: -theme.spacing.xs,
  },

  // Profile Card
  profileCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  profileCardDark: {
    backgroundColor: '#1C1C1E',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  username: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  email: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.md,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminBadge: {
    backgroundColor: theme.colors.error,
  },
  memberBadge: {
    backgroundColor: theme.colors.primary,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  joinDate: {
    fontSize: theme.fontSize.xs,
    color: '#9CA3AF',
  },
  editButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
  },
  editButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },

  // Stats Card
  statsCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  statsCardDark: {
    backgroundColor: '#1C1C1E',
  },
  statsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
  },

  // Menu Card
  menuCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  menuCardDark: {
    backgroundColor: '#1C1C1E',
  },

  // Admin Menu Item
  adminMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  adminIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: theme.colors.error,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
  menuItemSubtitle: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemBorderDark: {
    borderBottomColor: '#2C2C2E',
  },
  menuItemText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },

  // Logout Button
  logoutButton: {
    backgroundColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.xl,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },

  // Dark mode text colors
  textDark: {
    color: 'white',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
  textTertiaryDark: {
    color: '#636366',
  },
});
