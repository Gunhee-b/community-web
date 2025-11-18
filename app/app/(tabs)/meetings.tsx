import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import { supabase } from '@/services/supabase';
import { createNotification } from '@/services/notifications';

/**
 * Meeting 타입
 */
interface Meeting {
  id: string;
  title: string;
  description: string;
  meeting_type: 'casual' | 'regular';
  start_datetime: string;
  location: string;
  max_participants: number;
  status: 'recruiting' | 'confirmed' | 'cancelled' | 'completed';
  kakao_openchat_url?: string;
  image_url?: string;
  host_id: string;
  host: {
    username: string;
  };
  participants: Array<{ count: number }>;
  isParticipating?: boolean; // 현재 사용자의 참여 여부
}

/**
 * MeetingsScreen
 *
 * 철학챗(모임) 화면
 * - 탭: 즉흥 모임 / 정기 모임
 * - Supabase 실시간 데이터 연동
 * - 모임 참가/나가기 기능
 */
export default function MeetingsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const [activeTab, setActiveTab] = useState<'casual' | 'regular'>('casual');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 권한 체크
  const canCreateMeeting = user?.role === 'admin' || user?.role === 'meeting_host';

  // 데이터 불러오기
  useEffect(() => {
    fetchMeetings();
  }, [activeTab]);

  /**
   * 모임 목록 가져오기
   */
  const fetchMeetings = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('offline_meetings')
        .select(`
          *,
          host:users!host_id(username),
          participants:meeting_participants(count)
        `)
        .eq('is_template', false); // 템플릿 제외

      // 탭별 필터링
      if (activeTab === 'casual') {
        query = query
          .eq('meeting_type', 'casual')
          .gte('start_datetime', new Date().toISOString())
          .in('status', ['recruiting', 'confirmed']);
      } else if (activeTab === 'regular') {
        query = query
          .eq('meeting_type', 'regular')
          .gte('start_datetime', new Date().toISOString())
          .in('status', ['recruiting', 'confirmed']);
      }

      const { data, error } = await query.order('start_datetime', { ascending: true });

      if (error) throw error;

      // 각 모임에 대해 현재 사용자의 참여 여부 확인
      if (user && data) {
        const meetingsWithParticipation = await Promise.all(
          data.map(async (meeting) => {
            const { data: participation } = await supabase
              .from('meeting_participants')
              .select('id')
              .eq('meeting_id', meeting.id)
              .eq('user_id', user.id)
              .maybeSingle();

            return {
              ...meeting,
              isParticipating: !!participation,
            };
          })
        );
        setMeetings(meetingsWithParticipation);
      } else {
        setMeetings(data || []);
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      Alert.alert('오류', '모임 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 모임 상세로 이동
   */
  const handleMeetingDetail = (id: string) => {
    router.push(`/meetings/${id}`);
  };

  /**
   * 모임 만들기
   */
  const handleCreateMeeting = () => {
    if (!user) {
      Alert.alert('로그인 필요', '로그인 후 이용해주세요.');
      router.push('/login');
      return;
    }

    if (!canCreateMeeting) {
      Alert.alert('권한 없음', '모임 만들기 권한이 없습니다.');
      return;
    }

    // TODO: 모임 만들기 화면으로 이동
    Alert.alert('준비 중', '모임 만들기 기능은 준비 중입니다.');
  };

  /**
   * 모임 참가하기
   */
  const handleJoinMeeting = async (meetingId: string) => {
    if (!user) {
      Alert.alert('로그인 필요', '로그인 후 참여해주세요.');
      router.push('/login');
      return;
    }

    try {
      // 모임 정보 가져오기 (host_id 확인)
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('host_id, title')
        .eq('id', meetingId)
        .single();

      if (meetingError) throw meetingError;

      // 참여자 추가
      const { error } = await supabase
        .from('meeting_participants')
        .insert([
          {
            meeting_id: meetingId,
            user_id: user.id,
          },
        ]);

      if (error) throw error;

      // 모임장에게 알림 전송
      if (meetingData?.host_id && meetingData.host_id !== user.id) {
        await createNotification({
          user_id: meetingData.host_id,
          title: '새로운 참가자',
          message: `${user.username}님이 "${meetingData.title}" 모임에 참여했습니다.`,
          type: 'meeting_join',
          meeting_id: meetingId,
          related_id: meetingId,
        });
      }

      Alert.alert('성공', '모임에 참여했습니다!');
      fetchMeetings(); // 목록 새로고침
    } catch (error: any) {
      console.error('Error joining meeting:', error);
      Alert.alert('오류', error.message || '모임 참여에 실패했습니다.');
    }
  };

  /**
   * 모임 참여 취소
   */
  const handleLeaveMeeting = async (meetingId: string) => {
    if (!user) {
      return;
    }

    Alert.alert(
      '참여 취소',
      '정말 이 모임 참여를 취소하시겠습니까?',
      [
        {
          text: '아니오',
          style: 'cancel',
        },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('meeting_participants')
                .delete()
                .eq('meeting_id', meetingId)
                .eq('user_id', user.id);

              if (error) throw error;

              Alert.alert('완료', '모임 참여가 취소되었습니다.');
              fetchMeetings(); // 목록 새로고침
            } catch (error: any) {
              console.error('Error leaving meeting:', error);
              Alert.alert('오류', error.message || '참여 취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  /**
   * 카카오톡 오픈채팅 열기
   */
  const handleKakaoChat = async (url?: string) => {
    if (!url) {
      Alert.alert('안내', '카카오톡 오픈채팅 링크가 없습니다.');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
      }
    } catch (error) {
      console.error('Error opening Kakao chat:', error);
      Alert.alert('오류', '카카오톡을 열 수 없습니다.');
    }
  };

  /**
   * 날짜 포맷
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    return {
      date: `${month}월 ${day}일`,
      time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
    };
  };

  /**
   * 참가자 수 계산
   */
  const getParticipantCount = (participants: Array<{ count: number }>) => {
    if (!participants || participants.length === 0) return 0;
    return participants[0].count || 0;
  };

  /**
   * 모임 카드 렌더링
   */
  const renderMeetingCard = ({ item }: { item: Meeting }) => {
    const { date, time } = formatDate(item.start_datetime);
    const participantCount = getParticipantCount(item.participants);
    const isFull = participantCount >= item.max_participants;

    return (
      <TouchableOpacity
        style={[styles.card, isDark && styles.cardDark]}
        onPress={() => handleMeetingDetail(item.id)}
        activeOpacity={0.7}
      >
        {/* Meeting Image */}
        {item.image_url ? (
          <Image
            source={{ uri: item.image_url }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <LinearGradient
            colors={['#5AC8FA', '#007AFF', '#5856D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardImage}
          />
        )}

        {/* Meeting Details */}
        <View style={styles.cardContent}>
          {/* Location & Date (상단, 굵은 글씨) */}
          <View style={styles.topInfoSection}>
            <View style={styles.topInfoRow}>
              <Ionicons
                name="location"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={[styles.topInfoText, isDark && styles.textDark]}>
                {item.location}
              </Text>
            </View>
            <View style={styles.topInfoRow}>
              <Ionicons
                name="calendar"
                size={18}
                color={theme.colors.primary}
              />
              <Text style={[styles.topInfoText, isDark && styles.textDark]}>
                {date} {time}
              </Text>
            </View>
          </View>

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
            {isFull && (
              <View style={styles.fullBadge}>
                <Text style={styles.fullBadgeText}>마감</Text>
              </View>
            )}
          </View>

          {/* Participants */}
          <View style={styles.detailRow}>
            <Ionicons
              name="people-outline"
              size={16}
              color={isDark ? '#8E8E93' : '#6B7280'}
            />
            <Text style={[styles.detailText, isDark && styles.textSecondaryDark]}>
              {participantCount}/{item.max_participants}명 참여
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
                <Text style={styles.hostAvatarText}>{item.host.username[0]}</Text>
              </LinearGradient>
              <View style={styles.hostDetails}>
                <View style={styles.hostHeader}>
                  <Text style={[styles.hostName, isDark && styles.textDark]}>
                    {item.host.username}
                  </Text>
                  <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeText}>호스트</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {isFull && !item.isParticipating ? (
              <TouchableOpacity
                style={[styles.joinButton, styles.joinButtonDisabled]}
                disabled
              >
                <Text style={styles.joinButtonTextDisabled}>마감됨</Text>
              </TouchableOpacity>
            ) : item.isParticipating ? (
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={() => handleLeaveMeeting(item.id)}
              >
                <Text style={styles.leaveButtonText}>참여 취소</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={() => handleJoinMeeting(item.id)}
              >
                <Text style={styles.joinButtonText}>참여하기</Text>
              </TouchableOpacity>
            )}
            {item.kakao_openchat_url && (
              <TouchableOpacity
                style={styles.kakaoButton}
                onPress={() => handleKakaoChat(item.kakao_openchat_url)}
              >
                <Ionicons name="chatbubble" size={18} color="#3C1E1E" />
                <Text style={styles.kakaoButtonText}>카카오톡</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="철학챗" />

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
            ⚡ 즉흥 모임
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
            📅 정기 모임
          </Text>
          {activeTab === 'regular' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Meetings List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            모임을 불러오는 중...
          </Text>
        </View>
      ) : meetings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="calendar-outline"
            size={64}
            color={isDark ? '#8E8E93' : '#D1D5DB'}
          />
          <Text style={[styles.emptyText, isDark && styles.textSecondaryDark]}>
            {activeTab === 'casual' ? '즉흥 모임이 없습니다' : '정기 모임이 없습니다'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={meetings}
          renderItem={renderMeetingCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchMeetings();
          }}
        />
      )}

      {/* Floating Action Button */}
      {canCreateMeeting && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreateMeeting}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
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

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: '#6B7280',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: '#6B7280',
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

  // Top Info Section (Location & Date)
  topInfoSection: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  topInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  topInfoText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text.primary,
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
  leaveButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaveButtonText: {
    color: '#6B7280',
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
