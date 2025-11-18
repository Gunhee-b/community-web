import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import {
  fetchMeetingById,
  joinMeeting as apiJoinMeeting,
  leaveMeeting as apiLeaveMeeting
} from '@/services/api/meetings';
import { AuthService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import { createNotification } from '@/services/notifications';
import type { Meeting } from '@/types';

interface Participant {
  id: number;
  name: string;
  role: 'host' | 'member';
  avatar: string;
}

interface ChatMessage {
  id: string;
  meeting_id: string;
  user_id: string;
  message: string;
  created_at: string;
  user?: {
    username: string;
  };
}

/**
 * MeetingDetailScreen
 *
 * 모임 상세 화면
 * - 모임 정보 (제목, 설명, 날짜, 시간, 장소)
 * - 호스트 정보
 * - 참여자 목록
 * - 실시간 채팅
 * - 참여/취소 버튼
 */
export default function MeetingDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meeting, setMeeting] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [lastReadAt, setLastReadAt] = useState<string | null>(null);

  // Fetch meeting data on mount
  useEffect(() => {
    fetchMeetingData();
    loadCurrentUser();
    fetchChatMessages();
  }, [id]);

  // Set up real-time subscription for chat messages
  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`meeting-chat-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_chats',
          filter: `meeting_id=eq.${id}`,
        },
        (payload) => {
          console.log('New message:', payload);
          fetchChatMessages(); // Refetch messages when new one arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Load current user
  const loadCurrentUser = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  // Fetch meeting and participants data
  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate ID
      if (!id || id === 'NaN' || id === 'undefined' || id === 'null') {
        throw new Error('잘못된 모임 ID입니다');
      }

      // Fetch meeting details
      const { data: meetingData, error: meetingError } = await fetchMeetingById(id as string);

      if (meetingError) {
        throw new Error('모임 정보를 불러올 수 없습니다');
      }

      if (meetingData) {
        setMeeting(meetingData);

        // Extract participants from meeting data
        if (meetingData.participants) {
          setParticipants(meetingData.participants);

          // Check if current user is a participant
          const user = await AuthService.getCurrentUser();
          if (user) {
            const userParticipant = meetingData.participants.find(
              (p: any) => p.user_id === user.id
            );
            setIsJoined(!!userParticipant);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching meeting:', err);
      setError(err.message || '모임 정보를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showChat) {
      // Scroll to bottom when chat is opened
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

      // Mark messages as read when chat is opened
      setLastReadAt(new Date().toISOString());
    }
  }, [showChat]);

  /**
   * Fetch chat messages from database
   */
  const fetchChatMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('meeting_chats')
        .select(`
          *,
          user:users!meeting_chats_user_id_fkey(username)
        `)
        .eq('meeting_id', id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setChatMessages(data || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
    }
  };

  /**
   * Send message to database
   */
  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    try {
      const { error } = await supabase
        .from('meeting_chats')
        .insert([
          {
            meeting_id: id as string,
            user_id: currentUser.id,
            message: message.trim(),
            anonymous_name: currentUser.username, // 익명 이름으로 사용자 이름 사용
          },
        ]);

      if (error) throw error;

      // 모임 참여자들에게 알림 전송 (본인 제외)
      const { data: participants } = await supabase
        .from('meeting_participants')
        .select('user_id')
        .eq('meeting_id', id as string)
        .neq('user_id', currentUser.id);

      if (participants && participants.length > 0 && meeting) {
        // 각 참여자에게 알림 전송
        for (const participant of participants) {
          await createNotification({
            user_id: participant.user_id,
            title: meeting.title,
            message: `${currentUser.username}: ${message.trim().substring(0, 50)}${message.trim().length > 50 ? '...' : ''}`,
            type: 'meeting_chat',
            meeting_id: id as string,
            related_id: id as string,
          });
        }
      }

      setMessage('');

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      Alert.alert('오류', error.message || '메시지 전송에 실패했습니다.');
    }
  };

  const handleJoinMeeting = async () => {
    if (!currentUser) {
      Alert.alert('로그인 필요', '모임에 참여하려면 로그인이 필요합니다.');
      return;
    }

    if (actionLoading) return;

    try {
      setActionLoading(true);

      const { error } = await apiJoinMeeting(id as string, currentUser.id);

      if (error) {
        throw error;
      }

      setIsJoined(true);
      Alert.alert('성공', '모임에 참여했습니다!');

      // Refetch meeting data to update participant list
      await fetchMeetingData();
    } catch (err: any) {
      console.error('Error joining meeting:', err);
      Alert.alert('오류', err.message || '모임 참여 중 오류가 발생했습니다.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveMeeting = async () => {
    if (!currentUser) return;
    if (actionLoading) return;

    Alert.alert(
      '모임 나가기',
      '정말로 모임에서 나가시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '나가기',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);

              const { error } = await apiLeaveMeeting(id as string, currentUser.id);

              if (error) {
                throw error;
              }

              setIsJoined(false);
              Alert.alert('알림', '모임에서 나갔습니다.');

              // Refetch meeting data to update participant list
              await fetchMeetingData();
            } catch (err: any) {
              console.error('Error leaving meeting:', err);
              Alert.alert('오류', err.message || '모임 나가기 중 오류가 발생했습니다.');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleKakaoChat = async () => {
    if (!meeting?.kakao_openchat_link) {
      Alert.alert('알림', '카카오톡 오픈채팅 링크가 없습니다.');
      return;
    }

    try {
      const supported = await Linking.canOpenURL(meeting.kakao_openchat_link);

      if (supported) {
        await Linking.openURL(meeting.kakao_openchat_link);
      } else {
        Alert.alert('오류', '카카오톡 링크를 열 수 없습니다.');
      }
    } catch (err) {
      console.error('Error opening Kakao chat:', err);
      Alert.alert('오류', '카카오톡 오픈채팅을 열 수 없습니다.');
    }
  };

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="모임 상세" showBackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textDark]}>
            모임 정보를 불러오는 중...
          </Text>
        </View>
      </View>
    );
  }

  // Show error state
  if (error || !meeting) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <TopNavBar title="모임 상세" showBackButton />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={isDark ? '#8E8E93' : '#6B7280'}
          />
          <Text style={[styles.errorText, isDark && styles.textDark]}>
            {error || '모임 정보를 찾을 수 없습니다'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchMeetingData}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate unread message count
  const unreadCount = chatMessages.filter(msg => {
    // Don't count own messages as unread
    if (currentUser && msg.user_id === currentUser.id) {
      return false;
    }
    // Count messages created after last read time
    if (lastReadAt) {
      return new Date(msg.created_at) > new Date(lastReadAt);
    }
    // If never read, count all messages from others
    return true;
  }).length;

  // Format meeting date and time
  const meetingDate = new Date(meeting.start_datetime);
  const dateStr = meetingDate.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
  });
  const timeStr = meetingDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const dayOfWeek = meetingDate.toLocaleDateString('ko-KR', { weekday: 'long' });

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar title="모임 상세" showBackButton />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Meeting Image */}
          {meeting.image_url ? (
            <Image
              source={{ uri: meeting.image_url }}
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

          {/* Meeting Info */}
          <View style={styles.infoSection}>
            {/* Title & Description */}
            <View style={styles.titleSection}>
              <Text style={[styles.title, isDark && styles.titleDark]}>
                {meeting.title || meeting.location || '모임'}
              </Text>
              {meeting.description && (
                <Text style={[styles.description, isDark && styles.descriptionDark]}>
                  {meeting.description}
                </Text>
              )}
            </View>

            {/* Details Card */}
            <View style={[styles.card, isDark && styles.cardDark]}>
              {/* Date & Time */}
              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                    {dateStr} {timeStr}
                  </Text>
                  <Text style={[styles.detailSubtext, isDark && styles.detailSubtextDark]}>
                    {dayOfWeek}
                  </Text>
                </View>
              </View>

              {/* Location */}
              {meeting.location && (
                <View style={styles.detailRow}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={isDark ? '#8E8E93' : '#6B7280'}
                  />
                  <View style={styles.detailContent}>
                    <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                      {meeting.location}
                    </Text>
                    {meeting.location_detail && (
                      <Text style={[styles.detailSubtext, isDark && styles.detailSubtextDark]}>
                        {meeting.location_detail}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Participants */}
              <View style={styles.detailRow}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                    {meeting.current_participants || participants.length}/{meeting.max_participants || '∞'}명 참여
                  </Text>
                  {meeting.max_participants && (
                    <Text style={[styles.detailSubtext, isDark && styles.detailSubtextDark]}>
                      {meeting.max_participants - (meeting.current_participants || participants.length)}자리 남음
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Host Info */}
            {meeting.host && (
              <View style={[styles.card, isDark && styles.cardDark]}>
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                  호스트
                </Text>
                <View style={styles.hostInfo}>
                  <LinearGradient
                    colors={['#007AFF', '#5856D6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.hostAvatar}
                  >
                    <Text style={styles.hostAvatarText}>
                      {meeting.host.username?.[0] || meeting.host_name?.[0] || 'H'}
                    </Text>
                  </LinearGradient>
                  <View style={styles.hostDetails}>
                    <View style={styles.hostHeader}>
                      <Text style={[styles.hostName, isDark && styles.hostNameDark]}>
                        {meeting.host.username || meeting.host_name || '호스트'}
                      </Text>
                      <View style={styles.hostBadge}>
                        <Text style={styles.hostBadgeText}>호스트</Text>
                      </View>
                    </View>
                    {meeting.host_introduction && (
                      <Text style={[styles.hostIntro, isDark && styles.hostIntroDark]}>
                        {meeting.host_introduction}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* Participants List */}
            {participants.length > 0 && (
              <View style={[styles.card, isDark && styles.cardDark]}>
                <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                  참여자 ({participants.length})
                </Text>
                <View style={styles.participantsGrid}>
                  {participants.map((participant, index) => {
                    const username = participant.user?.username || participant.username || '참가자';
                    return (
                      <View key={participant.id || index} style={styles.participantItem}>
                        <LinearGradient
                          colors={['#007AFF', '#5856D6']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.participantAvatar}
                        >
                          <Text style={styles.participantAvatarText}>
                            {username[0]}
                          </Text>
                        </LinearGradient>
                        <Text
                          style={[styles.participantName, isDark && styles.participantNameDark]}
                          numberOfLines={1}
                        >
                          {username}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Chat Section - 참여한 사용자만 볼 수 있음 */}
            {isJoined && (
              <View style={[styles.card, isDark && styles.cardDark, styles.chatCard]}>
                <TouchableOpacity
                  style={styles.chatHeader}
                  onPress={() => setShowChat(!showChat)}
                  activeOpacity={0.7}
                >
                <View style={styles.chatHeaderLeft}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={20}
                    color={isDark ? '#8E8E93' : '#6B7280'}
                  />
                  <Text style={[styles.chatHeaderText, isDark && styles.chatHeaderTextDark]}>
                    실시간 채팅
                  </Text>
                </View>
                {unreadCount > 0 && (
                  <View style={styles.chatBadge}>
                    <Text style={styles.chatBadgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>

              {showChat && (
                <View style={[styles.chatContainer, isDark && styles.chatContainerDark]}>
                  <ScrollView
                    style={styles.chatMessages}
                    showsVerticalScrollIndicator={false}
                  >
                    {chatMessages.map((msg) => {
                      const isOwn = currentUser && msg.user_id === currentUser.id;
                      const username = msg.user?.username || '알 수 없음';
                      const messageTime = new Date(msg.created_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <View
                          key={msg.id}
                          style={[
                            styles.messageRow,
                            isOwn && styles.messageRowOwn,
                          ]}
                        >
                          {!isOwn && (
                            <LinearGradient
                              colors={['#007AFF', '#5856D6']}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.messageAvatar}
                            >
                              <Text style={styles.messageAvatarText}>{username[0]}</Text>
                            </LinearGradient>
                          )}
                          <View style={[styles.messageContent, isOwn && styles.messageContentOwn]}>
                            {!isOwn && (
                              <Text style={[styles.messageUser, isDark && styles.messageUserDark]}>
                                {username}
                              </Text>
                            )}
                            <View
                              style={[
                                styles.messageBubble,
                                isOwn
                                  ? styles.messageBubbleOwn
                                  : isDark
                                  ? styles.messageBubbleDark
                                  : styles.messageBubbleOther,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.messageText,
                                  isOwn
                                    ? styles.messageTextOwn
                                    : isDark
                                    ? styles.messageTextDark
                                    : styles.messageTextOther,
                                ]}
                              >
                                {msg.message}
                              </Text>
                            </View>
                            <Text style={[styles.messageTime, isDark && styles.messageTimeDark]}>
                              {messageTime}
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </ScrollView>

                  {/* Message Input */}
                  <View style={[styles.messageInput, isDark && styles.messageInputDark]}>
                    <TouchableOpacity style={styles.imageButton}>
                      <Ionicons
                        name="image-outline"
                        size={20}
                        color={isDark ? '#8E8E93' : '#6B7280'}
                      />
                    </TouchableOpacity>
                    <TextInput
                      style={[styles.textInput, isDark && styles.textInputDark]}
                      value={message}
                      onChangeText={setMessage}
                      placeholder="메시지를 입력하세요..."
                      placeholderTextColor={isDark ? '#636366' : '#9CA3AF'}
                      onSubmitEditing={handleSendMessage}
                      returnKeyType="send"
                    />
                    <TouchableOpacity
                      style={styles.sendButton}
                      onPress={handleSendMessage}
                    >
                      <Ionicons name="send" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              </View>
            )}

            {/* Bottom spacing for fixed action bar */}
            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.actionBar, isDark && styles.actionBarDark]}>
          {isJoined ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.leaveButton, actionLoading && styles.buttonDisabled]}
                onPress={handleLeaveMeeting}
                activeOpacity={0.7}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.error} />
                ) : (
                  <Text style={styles.leaveButtonText}>참여 취소</Text>
                )}
              </TouchableOpacity>
              {meeting.kakao_openchat_link && (
                <TouchableOpacity
                  style={[styles.kakaoButton, actionLoading && styles.buttonDisabled]}
                  onPress={handleKakaoChat}
                  activeOpacity={0.7}
                  disabled={actionLoading}
                >
                  <Ionicons name="chatbubbles" size={18} color="#3C1E1E" />
                  <Text style={styles.kakaoButtonText}>카카오톡 오픈채팅</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.joinButton, actionLoading && styles.buttonDisabled]}
              onPress={handleJoinMeeting}
              activeOpacity={0.8}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.joinButtonText}>모임 참여하기</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    paddingBottom: 100, // Space for action bar
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
  textDark: {
    color: 'white',
  },

  // Button Disabled State
  buttonDisabled: {
    opacity: 0.6,
  },

  // Meeting Image
  meetingImage: {
    height: 256,
  },

  // Info Section
  infoSection: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  titleSection: {
    gap: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  titleDark: {
    color: 'white',
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    lineHeight: 20,
  },
  descriptionDark: {
    color: '#8E8E93',
  },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
  },
  cardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  cardTitleDark: {
    color: 'white',
  },

  // Details
  detailRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: theme.spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    marginBottom: 2,
  },
  detailTextDark: {
    color: 'white',
  },
  detailSubtext: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  detailSubtextDark: {
    color: '#8E8E93',
  },

  // Host
  hostInfo: {
    flexDirection: 'row',
    gap: 12,
  },
  hostAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostAvatarText: {
    color: 'white',
    fontSize: theme.fontSize.lg,
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
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  hostNameDark: {
    color: 'white',
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
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    lineHeight: 20,
  },
  hostIntroDark: {
    color: '#8E8E93',
  },

  // Participants
  participantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  participantItem: {
    width: '22%',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  participantAvatarText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  participantName: {
    fontSize: theme.fontSize.xs,
    color: '#374151',
    textAlign: 'center',
  },
  participantNameDark: {
    color: '#8E8E93',
  },

  // Chat
  chatCard: {
    padding: 0,
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatHeaderText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  chatHeaderTextDark: {
    color: 'white',
  },
  chatBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: 'center',
  },
  chatBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  chatContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  chatContainerDark: {
    borderTopColor: '#2C2C2E',
  },
  chatMessages: {
    height: 256,
    padding: theme.spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  messageRowOwn: {
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  messageContent: {
    flex: 1,
  },
  messageContentOwn: {
    alignItems: 'flex-end',
  },
  messageUser: {
    fontSize: theme.fontSize.xs,
    color: '#6B7280',
    marginBottom: 4,
  },
  messageUserDark: {
    color: '#8E8E93',
  },
  messageBubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 16,
    maxWidth: '80%',
  },
  messageBubbleOwn: {
    backgroundColor: theme.colors.primary,
  },
  messageBubbleOther: {
    backgroundColor: '#F3F4F6',
  },
  messageBubbleDark: {
    backgroundColor: '#2C2C2E',
  },
  messageText: {
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
  messageTextOwn: {
    color: 'white',
  },
  messageTextOther: {
    color: '#111827',
  },
  messageTextDark: {
    color: 'white',
  },
  messageTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  messageTimeDark: {
    color: '#636366',
  },

  // Message Input
  messageInput: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: 'white',
  },
  messageInputDark: {
    borderTopColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
  },
  imageButton: {
    padding: 8,
    borderRadius: theme.borderRadius.md,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: theme.fontSize.sm,
  },
  textInputDark: {
    backgroundColor: '#2C2C2E',
    borderColor: '#374151',
    color: 'white',
  },
  sendButton: {
    padding: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },

  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    padding: theme.spacing.md,
  },
  actionBarDark: {
    backgroundColor: '#1C1C1E',
    borderTopColor: '#2C2C2E',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  joinButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  leaveButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.error,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  kakaoButton: {
    flex: 1,
    backgroundColor: '#FEE500',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  kakaoButtonText: {
    color: '#3C1E1E',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});
