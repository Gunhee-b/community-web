import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';

const { width } = Dimensions.get('window');

/**
 * MeetingsScreen
 *
 * 모임 화면
 * - 탭: 자율 모임 / 정기 모임
 * - 모임 카드 리스트
 * - FAB (모임 만들기)
 */
export default function MeetingsScreen() {
  const router = useRouter();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';
  const [activeTab, setActiveTab] = useState<'casual' | 'regular'>('casual');

  // Mock data - TODO: Replace with API calls
  const casualMeetings = [
    {
      id: 1,
      title: '강남 카페 모임',
      description: '편하게 커피 마시면서 이야기 나눠요',
      date: '11월 9일',
      time: '14:00',
      location: '강남역 스타벅스',
      host: '김민수',
      hostIntro: '카페 투어를 좋아하는 김민수입니다',
      participants: 8,
      maxParticipants: 12,
      hasKakaoChat: true,
      status: 'open',
    },
    {
      id: 2,
      title: '주말 등산',
      description: '북한산 백운대 코스로 가볍게 등산해요',
      date: '11월 10일',
      time: '09:00',
      location: '북한산 백운대 입구',
      host: '박준영',
      hostIntro: '등산을 즐기는 박준영입니다',
      participants: 15,
      maxParticipants: 20,
      hasKakaoChat: true,
      status: 'open',
    },
    {
      id: 3,
      title: '보드게임 카페',
      description: '신나는 보드게임으로 즐거운 시간 보내요',
      date: '11월 11일',
      time: '18:00',
      location: '홍대 보드게임 카페',
      host: '이지은',
      hostIntro: '보드게임 마니아 이지은입니다',
      participants: 10,
      maxParticipants: 10,
      hasKakaoChat: true,
      status: 'full',
    },
  ];

  const regularMeetings = [
    {
      id: 4,
      title: '주간 독서 모임',
      description: '매주 화요일 책을 읽고 토론해요',
      date: '매주 화요일',
      time: '19:00',
      location: '강남 스터디 카페',
      host: '최수진',
      hostIntro: '책을 사랑하는 최수진입니다',
      participants: 8,
      maxParticipants: 15,
      hasKakaoChat: true,
      status: 'open',
    },
    {
      id: 5,
      title: '월간 영화 감상',
      description: '한 달에 한 번 영화관에서 영화 관람',
      date: '매월 첫째 주 토요일',
      time: '14:00',
      location: 'CGV 강남',
      host: '정민호',
      hostIntro: '영화광 정민호입니다',
      participants: 12,
      maxParticipants: 20,
      hasKakaoChat: true,
      status: 'open',
    },
  ];

  const meetings = activeTab === 'casual' ? casualMeetings : regularMeetings;

  const handleMeetingDetail = (id: number) => {
    router.push(`/meetings/${id}`);
  };

  const handleCreateMeeting = () => {
    console.log('Create new meeting');
    // TODO: Navigate to create meeting screen
  };

  const handleJoinMeeting = (id: number) => {
    console.log('Join meeting:', id);
    // TODO: Call join meeting API
  };

  const handleKakaoChat = (id: number) => {
    console.log('Open Kakao chat:', id);
    // TODO: Open Kakao chat link
  };

  const renderMeetingCard = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={() => handleMeetingDetail(item.id)}
      activeOpacity={0.7}
    >
      {/* Meeting Image */}
      <LinearGradient
        colors={['#5AC8FA', '#007AFF', '#5856D6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardImage}
      />

      {/* Meeting Details */}
      <View style={styles.cardContent}>
        {/* Title and Status */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={[styles.cardTitle, isDark && styles.textDark]}>
              {item.title}
            </Text>
            <Text style={[styles.cardDescription, isDark && styles.textSecondaryDark]}>
              {item.description}
            </Text>
          </View>
          {item.status === 'full' && (
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>마감</Text>
            </View>
          )}
        </View>

        {/* Date & Time */}
        <View style={styles.detailRow}>
          <Ionicons
            name="calendar-outline"
            size={16}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.detailText, isDark && styles.textSecondaryDark]}>
            {item.date} {item.time}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.detailRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.detailText, isDark && styles.textSecondaryDark]}>
            {item.location}
          </Text>
        </View>

        {/* Participants */}
        <View style={styles.detailRow}>
          <Ionicons
            name="people-outline"
            size={16}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.detailText, isDark && styles.textSecondaryDark]}>
            {item.participants}/{item.maxParticipants}명 참여
          </Text>
        </View>

        {/* Host Info */}
        <View style={[styles.hostCard, isDark && styles.hostCardDark]}>
          <View style={styles.hostInfo}>
            <LinearGradient
              colors={['#007AFF', '#5856D6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hostAvatar}
            >
              <Text style={styles.hostAvatarText}>{item.host[0]}</Text>
            </LinearGradient>
            <View style={styles.hostDetails}>
              <View style={styles.hostHeader}>
                <Text style={[styles.hostName, isDark && styles.textDark]}>
                  {item.host}
                </Text>
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>호스트</Text>
                </View>
              </View>
              <Text style={[styles.hostIntro, isDark && styles.textSecondaryDark]}>
                {item.hostIntro}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {item.status === 'full' ? (
            <TouchableOpacity
              style={[styles.joinButton, styles.joinButtonDisabled]}
              disabled
            >
              <Text style={styles.joinButtonTextDisabled}>마감됨</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleJoinMeeting(item.id)}
            >
              <Text style={styles.joinButtonText}>참여하기</Text>
            </TouchableOpacity>
          )}
          {item.hasKakaoChat && (
            <TouchableOpacity
              style={styles.kakaoButton}
              onPress={() => handleKakaoChat(item.id)}
            >
              <Ionicons name="chatbubble" size={18} color="#3C1E1E" />
              <Text style={styles.kakaoButtonText}>카카오톡</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="모임" />

      {/* Tabs */}
      <View style={[styles.tabs, isDark && styles.tabsDark]}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('casual')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'casual' && styles.tabTextActive,
              isDark && activeTab !== 'casual' && styles.tabTextDark,
            ]}
          >
            자율 모임
          </Text>
          {activeTab === 'casual' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('regular')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'regular' && styles.tabTextActive,
              isDark && activeTab !== 'regular' && styles.tabTextDark,
            ]}
          >
            정기 모임
          </Text>
          {activeTab === 'regular' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Meetings List */}
      <FlatList
        data={meetings}
        renderItem={renderMeetingCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateMeeting}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
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

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E7',
  },
  tabsDark: {
    backgroundColor: '#1C1C1E',
    borderBottomColor: '#2C2C2E',
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tabTextDark: {
    color: '#8E8E93',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: theme.colors.primary,
  },

  // List
  list: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Space for FAB
  },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },
  cardImage: {
    height: 192,
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  fullBadge: {
    backgroundColor: theme.colors.warning,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullBadgeText: {
    color: 'white',
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },

  // Host
  hostCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.md,
  },
  hostCardDark: {
    backgroundColor: '#2C2C2E',
  },
  hostInfo: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  hostDetails: {
    flex: 1,
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  hostName: {
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  hostBadge: {
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  hostBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  hostIntro: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  joinButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  joinButtonTextDisabled: {
    color: '#9CA3AF',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  kakaoButton: {
    backgroundColor: '#FEE500',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },

  // Dark mode text colors
  textDark: {
    color: 'white',
  },
  textSecondaryDark: {
    color: '#8E8E93',
  },
});
