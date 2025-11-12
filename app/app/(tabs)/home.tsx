import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useNotificationStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 80; // 양쪽 padding 고려

/**
 * HomeScreen
 *
 * 홈 화면
 * - 오늘의 질문 배너
 * - 다가오는 모임 캐러셀
 * - 월간 투표 배너
 * - 최근 활동 피드
 */
export default function HomeScreen() {
  const router = useRouter();
  const { unreadCount } = useNotificationStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // Mock data - TODO: Replace with API calls
  const todayQuestion = {
    id: 1,
    question: '오늘 가장 기억에 남는 순간은 무엇인가요?',
    answerCount: 24,
  };

  const upcomingMeetings = [
    {
      id: 1,
      title: '강남 카페 모임',
      date: '11월 9일',
      time: '14:00',
      participants: 8,
      maxParticipants: 12,
    },
    {
      id: 2,
      title: '주말 등산',
      date: '11월 10일',
      time: '09:00',
      participants: 15,
      maxParticipants: 20,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      user: '김민수',
      action: '님이 "강남 카페 모임"에 참여했습니다',
      time: '5분 전',
      avatar: '김',
    },
    {
      id: 2,
      user: '이지은',
      action: '님이 오늘의 질문에 답변했습니다',
      time: '15분 전',
      avatar: '이',
    },
    {
      id: 3,
      user: '박준영',
      action: '님이 "주말 등산"을 만들었습니다',
      time: '1시간 전',
      avatar: '박',
    },
    {
      id: 4,
      user: '최수진',
      action: '님이 "정기 모임" 투표를 시작했습니다',
      time: '2시간 전',
      avatar: '최',
    },
  ];

  const handleQuestionDetail = () => {
    router.push(`/questions/${todayQuestion.id}`);
  };

  const handleMeetingDetail = (id: number) => {
    router.push(`/meetings/${id}`);
  };

  const handleVoting = () => {
    console.log('Navigate to voting');
    // TODO: Navigate to voting screen
  };

  const renderMeetingCard = ({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.meetingCard,
        isDark && styles.meetingCardDark,
      ]}
      onPress={() => handleMeetingDetail(item.id)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={['#5AC8FA', '#007AFF', '#5856D6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.meetingImage}
      />
      <View style={styles.meetingInfo}>
        <Text style={[styles.meetingTitle, isDark && styles.textDark]}>
          {item.title}
        </Text>
        <View style={styles.meetingDetail}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.meetingDetailText, isDark && styles.textSecondaryDark]}>
            {item.date} {item.time}
          </Text>
        </View>
        <View style={styles.meetingDetail}>
          <Ionicons
            name="people-outline"
            size={14}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.meetingDetailText, isDark && styles.textSecondaryDark]}>
            {item.participants}/{item.maxParticipants}명 참여
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderActivityItem = ({ item, index }: any) => (
    <View
      style={[
        styles.activityItem,
        index !== recentActivities.length - 1 && styles.activityItemBorder,
        isDark && styles.activityItemBorderDark,
      ]}
    >
      <LinearGradient
        colors={['#007AFF', '#5856D6']}
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
          {item.action}
        </Text>
        <Text style={[styles.activityTime, isDark && styles.textTertiaryDark]}>
          {item.time}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar
        title="INGK Community"
        onNotifications={() => router.push('/(tabs)/notifications' as any)}
        notificationCount={unreadCount}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Question Banner */}
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
            <Text style={styles.questionText}>{todayQuestion.question}</Text>
            <View style={styles.questionFooter}>
              <Text style={styles.questionCount}>
                {todayQuestion.answerCount}개의 답변
              </Text>
              <View style={styles.questionButton}>
                <Text style={styles.questionButtonText}>답변하기 →</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Upcoming Meetings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDark && styles.textDark]}>
              다가오는 모임
            </Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/meetings')}>
              <Text style={styles.sectionLink}>전체보기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={upcomingMeetings}
            renderItem={renderMeetingCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.meetingsList}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
          />
        </View>

        {/* Monthly Voting Banner */}
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
              <Text style={styles.questionBadge}>11월 베스트 투표</Text>
            </View>
            <Text style={styles.questionText}>
              이달의 베스트를 선택해주세요!
            </Text>
            <View style={styles.questionFooter}>
              <Text style={styles.questionCount}>마감: 11월 15일</Text>
              <View style={styles.questionButton}>
                <Text style={styles.questionButtonText}>투표하기 →</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

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
          <View style={[styles.activityCard, isDark && styles.activityCardDark]}>
            <FlatList
              data={recentActivities}
              renderItem={renderActivityItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
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
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  meetingCardDark: {
    backgroundColor: '#1C1C1E',
  },
  meetingImage: {
    height: 128,
  },
  meetingInfo: {
    padding: theme.spacing.md,
  },
  meetingTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
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
});
