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
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAppStore } from '@/store';
import { theme } from '@/constants/theme';

interface Participant {
  id: number;
  name: string;
  role: 'host' | 'member';
  avatar: string;
}

interface ChatMessage {
  id: number;
  user: string;
  avatar: string;
  message: string;
  time: string;
  isOwn: boolean;
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

  const [message, setMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [showChat, setShowChat] = useState(false);

  // Mock data - TODO: Replace with API call
  const meeting = {
    id: Number(id),
    title: '강남 카페 모임',
    description: '편하게 커피 마시면서 이야기 나눠요. 새로운 사람들을 만나고 즐거운 시간을 보내실 수 있습니다.',
    date: '11월 9일',
    time: '14:00',
    dayOfWeek: '토요일',
    location: '강남역 스타벅스 리저브',
    address: '서울 강남구 테헤란로 152',
    host: '김민수',
    hostIntro: '카페 투어를 좋아하는 김민수입니다. 다양한 사람들과 이야기 나누는 것을 좋아합니다!',
    participants: 8,
    maxParticipants: 12,
    hasKakaoChat: true,
  };

  const participants: Participant[] = [
    { id: 1, name: '김민수', role: 'host', avatar: '김' },
    { id: 2, name: '이지은', role: 'member', avatar: '이' },
    { id: 3, name: '박준영', role: 'member', avatar: '박' },
    { id: 4, name: '최수진', role: 'member', avatar: '최' },
    { id: 5, name: '정민호', role: 'member', avatar: '정' },
    { id: 6, name: '강지수', role: 'member', avatar: '강' },
    { id: 7, name: '윤서연', role: 'member', avatar: '윤' },
    { id: 8, name: '한동훈', role: 'member', avatar: '한' },
  ];

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      user: '김민수',
      avatar: '김',
      message: '안녕하세요! 모임에 참여해주셔서 감사합니다.',
      time: '10:30',
      isOwn: false,
    },
    {
      id: 2,
      user: '이지은',
      avatar: '이',
      message: '기대됩니다! 어떤 커피를 주문하시나요?',
      time: '10:35',
      isOwn: false,
    },
    {
      id: 3,
      user: '나',
      avatar: '나',
      message: '저는 아메리카노 좋아해요',
      time: '10:40',
      isOwn: true,
    },
    {
      id: 4,
      user: '박준영',
      avatar: '박',
      message: '날씨가 좋네요. 야외 테라스에서 만날까요?',
      time: '11:00',
      isOwn: false,
    },
  ]);

  useEffect(() => {
    if (showChat) {
      // Scroll to bottom when chat is opened
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [showChat]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        user: '나',
        avatar: '나',
        message: message.trim(),
        time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        isOwn: true,
      };
      setChatMessages([...chatMessages, newMessage]);
      setMessage('');

      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleJoinMeeting = () => {
    setIsJoined(true);
    console.log('Join meeting:', id);
    // TODO: Call join meeting API
  };

  const handleLeaveMeeting = () => {
    setIsJoined(false);
    console.log('Leave meeting:', id);
    // TODO: Call leave meeting API
  };

  const handleKakaoChat = () => {
    console.log('Open Kakao chat');
    // TODO: Open Kakao chat link
  };

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
          <LinearGradient
            colors={['#5AC8FA', '#007AFF', '#5856D6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.meetingImage}
          />

          {/* Meeting Info */}
          <View style={styles.infoSection}>
            {/* Title & Description */}
            <View style={styles.titleSection}>
              <Text style={[styles.title, isDark && styles.titleDark]}>
                {meeting.title}
              </Text>
              <Text style={[styles.description, isDark && styles.descriptionDark]}>
                {meeting.description}
              </Text>
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
                    {meeting.date} {meeting.time}
                  </Text>
                  <Text style={[styles.detailSubtext, isDark && styles.detailSubtextDark]}>
                    {meeting.dayOfWeek}
                  </Text>
                </View>
              </View>

              {/* Location */}
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
                  <Text style={[styles.detailSubtext, isDark && styles.detailSubtextDark]}>
                    {meeting.address}
                  </Text>
                </View>
              </View>

              {/* Participants */}
              <View style={styles.detailRow}>
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B7280'}
                />
                <View style={styles.detailContent}>
                  <Text style={[styles.detailText, isDark && styles.detailTextDark]}>
                    {meeting.participants}/{meeting.maxParticipants}명 참여
                  </Text>
                  <Text style={[styles.detailSubtext, isDark && styles.detailSubtextDark]}>
                    {meeting.maxParticipants - meeting.participants}자리 남음
                  </Text>
                </View>
              </View>
            </View>

            {/* Host Info */}
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
                  <Text style={styles.hostAvatarText}>{meeting.host[0]}</Text>
                </LinearGradient>
                <View style={styles.hostDetails}>
                  <View style={styles.hostHeader}>
                    <Text style={[styles.hostName, isDark && styles.hostNameDark]}>
                      {meeting.host}
                    </Text>
                    <View style={styles.hostBadge}>
                      <Text style={styles.hostBadgeText}>호스트</Text>
                    </View>
                  </View>
                  <Text style={[styles.hostIntro, isDark && styles.hostIntroDark]}>
                    {meeting.hostIntro}
                  </Text>
                </View>
              </View>
            </View>

            {/* Participants List */}
            <View style={[styles.card, isDark && styles.cardDark]}>
              <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>
                참여자 ({participants.length})
              </Text>
              <View style={styles.participantsGrid}>
                {participants.map((participant) => (
                  <View key={participant.id} style={styles.participantItem}>
                    <LinearGradient
                      colors={['#007AFF', '#5856D6']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.participantAvatar}
                    >
                      <Text style={styles.participantAvatarText}>
                        {participant.avatar}
                      </Text>
                    </LinearGradient>
                    <Text
                      style={[styles.participantName, isDark && styles.participantNameDark]}
                      numberOfLines={1}
                    >
                      {participant.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Chat Section */}
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
                <View style={styles.chatBadge}>
                  <Text style={styles.chatBadgeText}>3</Text>
                </View>
              </TouchableOpacity>

              {showChat && (
                <View style={[styles.chatContainer, isDark && styles.chatContainerDark]}>
                  <ScrollView
                    style={styles.chatMessages}
                    showsVerticalScrollIndicator={false}
                  >
                    {chatMessages.map((msg) => (
                      <View
                        key={msg.id}
                        style={[
                          styles.messageRow,
                          msg.isOwn && styles.messageRowOwn,
                        ]}
                      >
                        {!msg.isOwn && (
                          <LinearGradient
                            colors={['#007AFF', '#5856D6']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.messageAvatar}
                          >
                            <Text style={styles.messageAvatarText}>{msg.avatar}</Text>
                          </LinearGradient>
                        )}
                        <View style={[styles.messageContent, msg.isOwn && styles.messageContentOwn]}>
                          {!msg.isOwn && (
                            <Text style={[styles.messageUser, isDark && styles.messageUserDark]}>
                              {msg.user}
                            </Text>
                          )}
                          <View
                            style={[
                              styles.messageBubble,
                              msg.isOwn
                                ? styles.messageBubbleOwn
                                : isDark
                                ? styles.messageBubbleDark
                                : styles.messageBubbleOther,
                            ]}
                          >
                            <Text
                              style={[
                                styles.messageText,
                                msg.isOwn
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
                            {msg.time}
                          </Text>
                        </View>
                      </View>
                    ))}
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

            {/* Bottom spacing for fixed action bar */}
            <View style={styles.bottomSpacing} />
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={[styles.actionBar, isDark && styles.actionBarDark]}>
          {isJoined ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.leaveButton}
                onPress={handleLeaveMeeting}
                activeOpacity={0.7}
              >
                <Text style={styles.leaveButtonText}>참여 취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.kakaoButton}
                onPress={handleKakaoChat}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubbles" size={18} color="#3C1E1E" />
                <Text style={styles.kakaoButtonText}>카카오톡 오픈채팅</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={handleJoinMeeting}
              activeOpacity={0.8}
            >
              <Text style={styles.joinButtonText}>모임 참여하기</Text>
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
