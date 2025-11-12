import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useNotificationStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';

type NotificationType = 'meeting' | 'question' | 'vote' | 'chat';

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

/**
 * NotificationsScreen
 *
 * 알림 화면
 * - 알림 목록
 * - 읽음/읽지 않음 상태
 * - 모두 읽음 처리
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { markAllAsRead } = useNotificationStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  // Mock data - TODO: Replace with API calls
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'meeting',
      title: '모임 참여 확인',
      message: '김민수님이 "강남 카페 모임"에 참여했습니다',
      time: '5분 전',
      isRead: false,
    },
    {
      id: 2,
      type: 'question',
      title: '새로운 질문',
      message: '오늘의 질문이 업데이트되었습니다',
      time: '30분 전',
      isRead: false,
    },
    {
      id: 3,
      type: 'meeting',
      title: '모임 시작 알림',
      message: '"주말 등산" 모임이 1시간 후 시작됩니다',
      time: '1시간 전',
      isRead: false,
    },
    {
      id: 4,
      type: 'vote',
      title: '투표 시작',
      message: '11월 베스트 게시물 투표가 시작되었습니다',
      time: '2시간 전',
      isRead: true,
    },
    {
      id: 5,
      type: 'chat',
      title: '새로운 메시지',
      message: '이지은님이 채팅방에 메시지를 보냈습니다',
      time: '3시간 전',
      isRead: true,
    },
    {
      id: 6,
      type: 'meeting',
      title: '모임 취소',
      message: '"보드게임 카페" 모임이 취소되었습니다',
      time: '어제',
      isRead: true,
    },
    {
      id: 7,
      type: 'question',
      title: '답변 좋아요',
      message: '박준영님이 회원님의 답변을 좋아합니다',
      time: '어제',
      isRead: true,
    },
    {
      id: 8,
      type: 'meeting',
      title: '모임 확정',
      message: '"강남 카페 모임"이 확정되었습니다',
      time: '2일 전',
      isRead: true,
    },
  ];

  const getIconName = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'meeting':
        return 'people';
      case 'question':
        return 'chatbubble-ellipses';
      case 'vote':
        return 'trending-up';
      case 'chat':
        return 'chatbubbles';
      default:
        return 'notifications';
    }
  };

  const getIconBgColor = (type: NotificationType): string => {
    switch (type) {
      case 'meeting':
        return theme.colors.primary;
      case 'question':
        return theme.colors.secondary;
      case 'vote':
        return theme.colors.success;
      case 'chat':
        return theme.colors.warning;
      default:
        return theme.colors.primary;
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    console.log('Mark all notifications as read');
  };

  const handleNotificationPress = (notification: Notification) => {
    console.log('Notification pressed:', notification.id);
    // TODO: Navigate to related screen
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        isDark && styles.notificationCardDark,
        !item.isRead && styles.notificationCardUnread,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.notificationContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: getIconBgColor(item.type) },
          ]}
        >
          <Ionicons name={getIconName(item.type)} size={20} color="white" />
        </View>
        <View style={styles.textContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, isDark && styles.titleDark]}>
              {item.title}
            </Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.message, isDark && styles.messageDark]}>
            {item.message}
          </Text>
          <Text style={[styles.time, isDark && styles.timeDark]}>
            {item.time}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔔</Text>
      <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
        알림이 없습니다
      </Text>
      <Text style={[styles.emptyMessage, isDark && styles.emptyMessageDark]}>
        새로운 알림이 오면 여기에 표시됩니다
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar
        title="알림"
        showBackButton
        rightAction={
          notifications.length > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllButtonText}>모두 읽음</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.list,
          notifications.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
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

  // Mark All Button
  markAllButton: {
    padding: theme.spacing.xs,
    marginHorizontal: -theme.spacing.xs,
  },
  markAllButtonText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '500',
  },

  // List
  list: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  listEmpty: {
    flex: 1,
  },

  // Notification Card
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  notificationCardDark: {
    backgroundColor: '#1C1C1E',
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  titleDark: {
    color: 'white',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
    marginLeft: 8,
  },
  message: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  messageDark: {
    color: '#8E8E93',
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: '#9CA3AF',
  },
  timeDark: {
    color: '#636366',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyTitleDark: {
    color: 'white',
  },
  emptyMessage: {
    fontSize: theme.fontSize.sm,
    color: '#6B7280',
  },
  emptyMessageDark: {
    color: '#8E8E93',
  },
});
