import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import { supabase } from '@/services/supabase';

/**
 * 사용자 통계 타입
 */
interface UserStats {
  publicAnswersCount: number;
  totalChecks: number;
  currentStreak: number;
  longestStreak: number;
  meetingParticipation: number;
}

/**
 * ProfileScreen
 *
 * 프로필 화면
 * - 프로필 정보
 * - 닉네임 수정 기능
 * - 90-Day Challenge 통계
 * - 활동 통계
 * - 관리자 대시보드 (관리자만)
 * - 로그아웃
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // 상태
  const [stats, setStats] = useState<UserStats>({
    publicAnswersCount: 0,
    totalChecks: 0,
    currentStreak: 0,
    longestStreak: 0,
    meetingParticipation: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // 통계 데이터 불러오기
  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  /**
   * 사용자 통계 데이터 가져오기
   */
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      setStatsLoading(true);

      // 1. 공개 답변 개수
      const { count: answersCount } = await supabase
        .from('question_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_public', true);

      // 2. Question Checks 데이터 (90-Day Challenge)
      const { data: checks, error: checksError } = await supabase
        .from('question_checks')
        .select('checked_at')
        .eq('user_id', user.id)
        .eq('is_checked', true)
        .order('checked_at', { ascending: true });

      if (checksError) throw checksError;

      // 총 체크 수
      const totalChecks = checks?.length || 0;

      // 연속 일수 계산
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      if (checks && checks.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 날짜별로 그룹화 (중복 날짜 제거)
        const uniqueDates = [
          ...new Set(
            checks.map((check) => {
              const date = new Date(check.checked_at);
              date.setHours(0, 0, 0, 0);
              return date.getTime();
            })
          ),
        ].sort((a, b) => a - b);

        // 현재 연속 일수 계산
        let checkDate = today.getTime();
        let foundToday = false;

        for (let i = uniqueDates.length - 1; i >= 0; i--) {
          const date = uniqueDates[i];

          if (date === checkDate) {
            currentStreak++;
            foundToday = true;
            checkDate -= 24 * 60 * 60 * 1000; // 하루 전
          } else if (date === checkDate - 24 * 60 * 60 * 1000 && !foundToday) {
            // 오늘 체크 안했지만 어제 체크한 경우
            currentStreak++;
            checkDate = date - 24 * 60 * 60 * 1000;
          } else {
            break;
          }
        }

        // 최장 연속 일수 계산
        tempStreak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const diff = uniqueDates[i] - uniqueDates[i - 1];
          const daysDiff = diff / (24 * 60 * 60 * 1000);

          if (daysDiff === 1) {
            tempStreak++;
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
      }

      setStats({
        publicAnswersCount: answersCount || 0,
        totalChecks,
        currentStreak,
        longestStreak,
        meetingParticipation: user?.meeting_participation_count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      Alert.alert('오류', '통계 데이터를 불러오는데 실패했습니다.');
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * 닉네임 수정 모달 열기
   */
  const handleEditClick = () => {
    setNewUsername(user?.username || '');
    setUsernameError('');
    setIsEditModalVisible(true);
  };

  /**
   * 닉네임 업데이트
   */
  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setUsernameError('닉네임을 입력해주세요');
      return;
    }

    if (newUsername.length < 2 || newUsername.length > 20) {
      setUsernameError('닉네임은 2-20자 사이여야 합니다');
      return;
    }

    setIsUpdating(true);
    setUsernameError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('update_username', {
        p_user_id: user?.id,
        p_new_username: newUsername.trim(),
      });

      if (rpcError) {
        throw new Error(rpcError.message || '닉네임 변경 중 오류가 발생했습니다');
      }

      if (!data.success) {
        throw new Error(data.error || '닉네임 변경 중 오류가 발생했습니다');
      }

      // 스토어 업데이트
      setUser(data.user);
      setIsEditModalVisible(false);
      Alert.alert('성공', '닉네임이 성공적으로 변경되었습니다');
    } catch (err: any) {
      setUsernameError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * 로그아웃
   */
  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
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
    ]);
  };

  /**
   * 설정 화면으로 이동
   */
  const handleSettings = () => {
    router.push('/settings');
  };

  /**
   * 관리자 대시보드로 이동
   */
  const handleAdminDashboard = () => {
    console.log('Navigate to admin dashboard');
    // TODO: Navigate to admin dashboard
  };

  /**
   * 역할 표시 텍스트
   */
  const getRoleText = (role?: string) => {
    if (role === 'admin') return '관리자';
    if (role === 'meeting_host') return '모임장';
    return '일반 회원';
  };

  /**
   * 역할 배지 색상
   */
  const getRoleBadgeColor = (role?: string) => {
    if (role === 'admin') return theme.colors.error;
    if (role === 'meeting_host') return '#8B5CF6';
    return theme.colors.primary;
  };

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar
        title="프로필"
        rightAction={
          <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={isDark ? 'white' : theme.colors.text.primary} />
          </TouchableOpacity>
        }
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileCard, isDark && styles.profileCardDark]}>
          <LinearGradient colors={['#007AFF', '#5856D6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.username?.[0] || 'U'}</Text>
          </LinearGradient>

          {/* 사용자 정보 */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>닉네임</Text>
              <View style={styles.infoRight}>
                <Text style={[styles.infoValue, isDark && styles.textDark]}>{user?.username}</Text>
                <TouchableOpacity onPress={handleEditClick}>
                  <Text style={styles.editButton}>수정</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowBorder, isDark && styles.infoRowBorderDark]}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>역할</Text>
              <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user?.role) }]}>
                <Text style={styles.roleBadgeText}>{getRoleText(user?.role)}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDark && styles.textSecondaryDark]}>가입일</Text>
              <Text style={[styles.infoValue, isDark && styles.textDark]}>{formatDate(user?.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* 90-Day Challenge */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.textDark]}>📝 90-Day Challenge</Text>
          {statsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, styles.statBoxBlue]}>
                  <Text style={styles.statValue}>{stats.totalChecks}</Text>
                  <Text style={styles.statLabel}>총 체크 수</Text>
                </View>
                <View style={[styles.statBox, styles.statBoxGreen]}>
                  <Text style={styles.statValue}>{stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>연속 체크 일수</Text>
                </View>
              </View>

              {/* Progress Card */}
              <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                  <View>
                    <Text style={styles.progressSubtitle}>90일 달성률</Text>
                    <Text style={styles.progressPercent}>{Math.round((stats.totalChecks / 90) * 100)}%</Text>
                  </View>
                  <View style={styles.progressRight}>
                    <Text style={styles.progressSubtitle}>최장 연속 기록</Text>
                    <Text style={styles.progressDays}>{stats.longestStreak}일</Text>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <LinearGradient
                    colors={['#007AFF', '#10B981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBar, { width: `${Math.min((stats.totalChecks / 90) * 100, 100)}%` }]}
                  />
                </View>

                <Text style={styles.progressMessage}>
                  {90 - stats.totalChecks > 0 ? `목표까지 ${90 - stats.totalChecks}일 남았어요! 💪` : '🎉 90일 챌린지 완료!'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* 활동 통계 */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <Text style={[styles.cardTitle, isDark && styles.textDark]}>활동 통계</Text>
          {statsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <View style={styles.activityGrid}>
              <View style={[styles.activityBox, styles.activityBoxOrange]}>
                <Text style={[styles.activityValue, { color: '#F97316' }]}>{stats.publicAnswersCount}</Text>
                <Text style={[styles.activityLabel, isDark && styles.textSecondaryDark]}>내가 쓴 글</Text>
              </View>
              <View style={[styles.activityBox, styles.activityBoxPurple]}>
                <Text style={[styles.activityValue, { color: '#8B5CF6' }]}>{stats.meetingParticipation}</Text>
                <Text style={[styles.activityLabel, isDark && styles.textSecondaryDark]}>모임 참여</Text>
              </View>
              <View style={[styles.activityBox, styles.activityBoxBlue]}>
                <Text style={[styles.activityValue, { color: '#007AFF' }]}>-</Text>
                <Text style={[styles.activityLabel, isDark && styles.textSecondaryDark]}>투표 참여</Text>
              </View>
              <View style={[styles.activityBox, styles.activityBoxGreen]}>
                <Text style={[styles.activityValue, { color: '#10B981' }]}>-</Text>
                <Text style={[styles.activityLabel, isDark && styles.textSecondaryDark]}>글 추천</Text>
              </View>
            </View>
          )}
        </View>

        {/* Admin Section */}
        {user?.role === 'admin' && (
          <View style={[styles.menuCard, isDark && styles.menuCardDark]}>
            <TouchableOpacity style={styles.adminMenuItem} onPress={handleAdminDashboard} activeOpacity={0.7}>
              <View style={styles.adminIconContainer}>
                <Ionicons name="shield" size={20} color="white" />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuItemTitle, isDark && styles.textDark]}>관리자 대시보드</Text>
                <Text style={[styles.menuItemSubtitle, isDark && styles.textSecondaryDark]}>커뮤니티 관리 및 설정</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutButtonText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 닉네임 수정 모달 */}
      {isEditModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, isDark && styles.modalDark]}>
            <Text style={[styles.modalTitle, isDark && styles.textDark]}>닉네임 수정</Text>

            <TextInput
              style={[styles.input, isDark && styles.inputDark, usernameError ? styles.inputError : null]}
              value={newUsername}
              onChangeText={setNewUsername}
              placeholder="새 닉네임 (2-20자)"
              placeholderTextColor={isDark ? '#8E8E93' : '#9CA3AF'}
              maxLength={20}
            />

            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxTitle}>닉네임 변경 안내</Text>
              <Text style={styles.infoBoxItem}>• 닉네임은 2-20자 사이여야 합니다</Text>
              <Text style={styles.infoBoxItem}>• 한글, 영문, 숫자를 사용할 수 있습니다</Text>
              <Text style={styles.infoBoxItem}>• 중복된 닉네임은 사용할 수 없습니다</Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setIsEditModalVisible(false)}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonTextSecondary}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleUpdateUsername}
                disabled={isUpdating}
              >
                <Text style={styles.modalButtonTextPrimary}>{isUpdating ? '변경 중...' : '변경'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  profileCardDark: {
    backgroundColor: '#1C1C1E',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },

  // Info Section
  infoSection: {
    gap: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoRowBorder: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  infoRowBorderDark: {
    borderColor: '#2C2C2E',
  },
  infoLabel: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
    fontWeight: '500',
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  editButton: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },

  // Loading
  loadingContainer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },

  // Stats Grid (90-Day Challenge)
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  statBox: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  statBoxBlue: {
    backgroundColor: '#DBEAFE',
  },
  statBoxGreen: {
    backgroundColor: '#D1FAE5',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
  },

  // Progress Card
  progressCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  progressRight: {
    alignItems: 'flex-end',
  },
  progressSubtitle: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  progressDays: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'white',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  progressBar: {
    height: '100%',
  },
  progressMessage: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Activity Grid
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  activityBox: {
    width: '48%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  activityBoxOrange: {
    backgroundColor: '#FED7AA',
  },
  activityBoxPurple: {
    backgroundColor: '#DDD6FE',
  },
  activityBoxBlue: {
    backgroundColor: '#DBEAFE',
  },
  activityBoxGreen: {
    backgroundColor: '#D1FAE5',
  },
  activityValue: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  activityLabel: {
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

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalDark: {
    backgroundColor: '#1C1C1E',
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  inputDark: {
    borderColor: '#374151',
    color: 'white',
    backgroundColor: '#2C2C2E',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  infoBox: {
    backgroundColor: '#DBEAFE',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  infoBoxTitle: {
    fontSize: theme.fontSize.sm,
    color: '#1E40AF',
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  infoBoxItem: {
    fontSize: theme.fontSize.xs,
    color: '#1E3A8A',
    marginTop: 4,
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
  },
  modalButtonSecondary: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalButtonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  modalButtonTextSecondary: {
    color: '#6B7280',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  modalButtonTextPrimary: {
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
});
