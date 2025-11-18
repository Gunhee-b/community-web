import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Image,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useNotificationStore, useAppStore, useAuthStore } from '@/store';
import { theme } from '@/constants/theme';
import { fetchTodayQuestion } from '@/services/api/questions';
import { fetchMeetings } from '@/services/api/meetings';
import { supabase } from '@/services/supabase';
import type { Question, Meeting, Notification } from '@/types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80; // 양쪽 padding 고려

/**
 * Activity 타입
 */
interface Activity {
  id: string;
  type: 'meeting' | 'question';
  title: string;
  user: string;
  created_at: string;
  avatar: string;
}

/**
 * HomeScreen
 *
 * 홈 화면
 * - 오늘의 질문 배너
 * - 다가오는 모임 캐러셀
 * - 월간 투표 배너
 * - 최근 활동 피드 (모임 생성, 질문 등록)
 */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayQuestion, setTodayQuestion] = useState<Question | null>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [currentVotingPeriod, setCurrentVotingPeriod] = useState<any>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);
  const [toastAnim] = useState(new Animated.Value(0));

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Subscribe to notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications-home-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const notification = payload.new as Notification;

          // 채팅 알림인 경우 토스트 표시
          if (notification.type === 'meeting_chat') {
            showToast(notification.message);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Toast animation effect
  useEffect(() => {
    if (toast) {
      Animated.sequence([
        Animated.timing(toastAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(toastAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast({ message, type: 'info' });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch today's question
      const { data: questionData, error: questionError } = await fetchTodayQuestion();
      if (questionError) {
        console.error('Error fetching today question:', questionError);
      } else if (questionData) {
        setTodayQuestion(questionData);
      }

      // Fetch upcoming meetings (가장 가까운 1개만)
      const { data: meetingsData, error: meetingsError } = await supabase
        .from('offline_meetings')
        .select(`
          *,
          host:users!host_id(username),
          participants:meeting_participants(count)
        `)
        .eq('is_template', false)
        .gte('start_datetime', new Date().toISOString())
        .in('status', ['recruiting', 'confirmed'])
        .order('start_datetime', { ascending: true })
        .limit(1);

      if (meetingsError) {
        console.error('Error fetching meetings:', meetingsError);
      } else if (meetingsData) {
        setUpcomingMeetings(meetingsData as Meeting[]);
      }

      // Fetch recent activities
      await fetchRecentActivities();

      // Fetch current voting period
      await fetchCurrentVotingPeriod();
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || '데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 현재 진행 중인 투표 기간 가져오기
   */
  const fetchCurrentVotingPeriod = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('voting_periods')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching voting period:', error);
      } else if (data) {
        setCurrentVotingPeriod(data);
      }
    } catch (error) {
      console.error('Error fetching voting period:', error);
    }
  };

  /**
   * 최근 활동 가져오기 (모임 생성, 질문 등록)
   */
  const fetchRecentActivities = async () => {
    try {
      const activities: Activity[] = [];

      // 1. 최근 생성된 모임 가져오기 (최대 5개)
      const { data: meetings, error: meetingsError } = await supabase
        .from('offline_meetings')
        .select(`
          id,
          location,
          created_at,
          host:users!host_id(username)
        `)
        .eq('is_template', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (meetingsError) {
        console.error('Error fetching meeting activities:', meetingsError);
      } else if (meetings) {
        meetings.forEach((meeting: any) => {
          activities.push({
            id: `meeting-${meeting.id}`,
            type: 'meeting',
            title: meeting.location || '모임', // location을 제목으로 사용
            user: meeting.host?.username || '익명',
            created_at: meeting.created_at,
            avatar: meeting.host?.username?.[0] || 'M',
          });
        });
      }

      // 2. 최근 등록된 질문 가져오기 (최대 5개)
      const { data: questions, error: questionsError } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (questionsError) {
        console.error('Error fetching question activities:', questionsError);
      } else if (questions) {
        questions.forEach((question: any) => {
          activities.push({
            id: `question-${question.id}`,
            type: 'question',
            title: question.question_text,
            user: '관리자',
            created_at: question.created_at,
            avatar: '관',
          });
        });
      }

      // 3. 생성 시간 기준으로 정렬 (최신순)
      activities.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      // 4. 최대 10개만 표시
      setRecentActivities(activities.slice(0, 10));
    } catch (error) {
      console.error('Error fetching recent activities:', error);
    }
  };

  /**
   * 시간 차이 계산 (예: "5분 전", "1시간 전")
   */
  const getTimeAgo = (dateString: string) => {
    const now = new Date().getTime();
    const created = new Date(dateString).getTime();
    const diffInSeconds = Math.floor((now - created) / 1000);

    if (diffInSeconds < 60) {
      return '방금 전';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}분 전`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}시간 전`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}일 전`;
    }
  };

  const handleQuestionDetail = () => {
    if (todayQuestion) {
      router.push(`/questions/${todayQuestion.id}`);
    }
  };

  const handleMeetingDetail = (id: string) => {
    router.push(`/meetings/${id}`);
  };

  const handleVoting = () => {
    console.log('Navigate to voting');
    // TODO: Navigate to voting screen
  };

  const renderMeetingCard = ({ item }: { item: Meeting }) => {
    // Format date and time from start_datetime
    const startDate = new Date(item.start_datetime);
    const dateStr = startDate.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
    });
    const timeStr = startDate.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    // 참가자 수 계산
    const participantCount = item.participants?.[0]?.count || 0;
    const remainingSeats = item.max_participants ? item.max_participants - participantCount : null;
    const isFull = remainingSeats !== null && remainingSeats <= 0;

    return (
      <TouchableOpacity
        style={[
          styles.meetingCard,
          isDark && styles.meetingCardDark,
        ]}
        onPress={() => handleMeetingDetail(item.id)}
        activeOpacity={0.7}
      >
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.meetingImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#5AC8FA', '#007AFF', '#5856D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.meetingImage}
          />
        )}
        <View style={styles.meetingInfo}>
          <View style={styles.meetingHeader}>
            <Text style={[styles.meetingTitle, isDark && styles.textDark]}>
              {item.title || item.location || '모임'}
            </Text>
            {isFull ? (
              <View style={styles.fullBadge}>
                <Text style={styles.fullBadgeText}>마감</Text>
              </View>
            ) : remainingSeats !== null && (
              <View style={styles.seatsBadge}>
                <Text style={styles.seatsBadgeText}>{remainingSeats}자리 남음</Text>
              </View>
            )}
          </View>
          <View style={styles.meetingDetail}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
            <Text style={[styles.meetingDetailText, isDark && styles.textSecondaryDark]}>
              {dateStr} {timeStr}
            </Text>
          </View>
          <View style={styles.meetingDetail}>
            <Ionicons
              name="people-outline"
              size={14}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
            <Text style={[styles.meetingDetailText, isDark && styles.textSecondaryDark]}>
              {participantCount}/{item.max_participants || '∞'}명 참여
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderActivityItem = ({ item, index }: { item: Activity; index: number }) => {
    const actionText =
      item.type === 'meeting'
        ? `님이 "${item.title}" 모임을 만들었습니다`
        : `님이 새로운 질문을 등록했습니다`;

    return (
      <View
        style={[
          styles.activityItem,
          index !== recentActivities.length - 1 && styles.activityItemBorder,
          isDark && styles.activityItemBorderDark,
        ]}
      >
        <LinearGradient
          colors={item.type === 'meeting' ? ['#5AC8FA', '#007AFF'] : ['#007AFF', '#5856D6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </LinearGradient>
        <View style={styles.activityContent}>
          <Text style={[styles.activityText, isDark && styles.textSecondaryDark]}>
            <Text style={[styles.activityUser, isDark && styles.textDark]}>
              {item.user}
            </Text>
            {actionText}
          </Text>
          {item.type === 'question' && (
            <Text
              style={[styles.activityQuestionText, isDark && styles.textTertiaryDark]}
              numberOfLines={1}
            >
              "{item.title}"
            </Text>
          )}
          <Text style={[styles.activityTime, isDark && styles.textTertiaryDark]}>
            {getTimeAgo(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar
          title="Rezom Community"
          onNotifications={() => router.push('/notifications')}
          notificationCount={unreadCount}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            데이터를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar
          title="Rezom Community"
          onNotifications={() => router.push('/notifications')}
          notificationCount={unreadCount}
        />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.errorText, isDark && styles.textDark]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchData}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar
        title="Rezom Community"
        onNotifications={() => router.push('/notifications')}
        notificationCount={unreadCount}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Question Banner */}
        {todayQuestion && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleQuestionDetail}
          >
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.questionBanner}
            >
              <View style={styles.questionHeader}>
                <Ionicons name="chatbubble-ellipses" size={20} color="white" />
                <Text style={styles.questionBadge}>오늘의 질문</Text>
              </View>
              <Text style={styles.questionText}>{todayQuestion.question_text}</Text>
              <View style={styles.questionFooter}>
                <Text style={styles.questionCount}>
                  답변하기 →
                </Text>
                <View style={styles.questionButton}>
                  <Text style={styles.questionButtonText}>답변하기 →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Upcoming Meeting Section (다가오는 모임) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              다가오는 모임
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/meetings')}>
              <Text style={styles.sectionLink}>전체보기</Text>
            </TouchableOpacity>
          </View>
          {upcomingMeetings.length > 0 ? (
            renderMeetingCard({ item: upcomingMeetings[0] })
          ) : (
            <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
              <Ionicons
                name="calendar-outline"
                size={48}
                color={isDark ? '#636366' : '#9CA3AF'}
              />
              <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                다가오는 모임이 없습니다
              </Text>
            </View>
          )}
        </View>

        {/* Monthly Voting Banner */}
        {currentVotingPeriod ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleVoting}
          >
            <LinearGradient
              colors={['#FF9500', '#FF3B30']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.votingBanner}
            >
              <View style={styles.questionHeader}>
                <Ionicons name="trending-up" size={20} color="white" />
                <Text style={styles.questionBadge}>
                  {new Date(currentVotingPeriod.start_date).getMonth() + 1}월 베스트 투표
                </Text>
              </View>
              <Text style={styles.questionText}>
                이달의 베스트를 선택해주세요!
              </Text>
              <View style={styles.questionFooter}>
                <Text style={styles.questionCount}>
                  마감: {new Date(currentVotingPeriod.end_date).toLocaleDateString('ko-KR', {
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <View style={styles.questionButton}>
                  <Text style={styles.questionButtonText}>투표하기 →</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <View style={[styles.votingBannerEmpty, isDark && styles.votingBannerEmptyDark]}>
            <Ionicons
              name="trophy-outline"
              size={48}
              color={isDark ? '#636366' : '#9CA3AF'}
            />
            <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
              진행 중인 베스트 투표가 없습니다
            </Text>
          </View>
        )}

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="trending-up"
              size={20}
              color={isDark ? 'white' : theme.colors.text.primary}
            />
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              최근 활동
            </Text>
          </View>
          {recentActivities.length > 0 ? (
            <View style={[styles.activityCard, isDark && styles.activityCardDark]}>
              <FlatList
                data={recentActivities}
                renderItem={renderActivityItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={[styles.emptyCard, isDark && styles.emptyCardDark]}>
              <Ionicons
                name="pulse-outline"
                size={48}
                color={isDark ? '#636366' : '#9CA3AF'}
              />
              <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
                최근 활동이 없습니다
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {toast && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              opacity: toastAnim,
              transform: [
                {
                  translateY: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.toast, isDark && styles.toastDark]}>
            <Ionicons name="chatbubble" size={20} color="#007AFF" />
            <Text style={[styles.toastText, isDark && styles.toastTextDark]} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
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

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  loadingText: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },

  // Empty State
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  emptyCardDark: {
    backgroundColor: '#1C1C1E',
  },
  emptyText: {
    fontSize: theme.fontSize.sm,
    color: '#9CA3AF',
  },

  // Question Banner
  questionBanner: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  questionBadge: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.fontSize.sm,
  },
  questionText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
    marginBottom: theme.spacing.md,
    lineHeight: 24,
  },
  questionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: theme.fontSize.sm,
  },
  questionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  questionButtonText: {
    color: 'white',
    fontSize: theme.fontSize.sm,
    fontWeight: '500',
  },

  // Voting Banner
  votingBanner: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  votingBannerEmpty: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.sm,
  },
  votingBannerEmptyDark: {
    backgroundColor: '#1C1C1E',
  },

  // Section
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  sectionLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
  },

  // Meetings List
  meetingsList: {
    gap: 12,
  },
  meetingCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  meetingCardDark: {
    backgroundColor: '#1C1C1E',
  },
  meetingImage: {
    height: 192,
  },
  meetingInfo: {
    padding: theme.spacing.md,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  meetingTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  seatsBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  seatsBadgeText: {
    color: theme.colors.primary,
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  fullBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullBadgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },
  meetingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  meetingDetailText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },

  // Activity Feed
  activityCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  activityCardDark: {
    backgroundColor: '#1C1C1E',
  },
  activityItem: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  activityItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityItemBorderDark: {
    borderBottomColor: '#2C2C2E',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: theme.fontSize.sm,
    color: '#374151',
    lineHeight: 20,
  },
  activityUser: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  activityQuestionText: {
    fontSize: theme.fontSize.xs,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 2,
  },
  activityTime: {
    fontSize: theme.fontSize.xs,
    color: '#9CA3AF',
    marginTop: 4,
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

  // Toast styles
  toastContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  toast: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  toastDark: {
    backgroundColor: '#1C1C1E',
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  toastTextDark: {
    color: 'white',
  },
});
