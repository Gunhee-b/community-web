import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TopNavBar } from '@/components/navigation';
import { useAuthStore, useAppStore } from '@/store';
import { theme } from '@/constants/theme';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/services/notifications';
import type { Notification } from '@/types';

/**
 * NotificationsScreen
 *
 * 알림 화면
 * - 모임 참여 알림
 * - 채팅 메시지 알림
 * - 새로운 질문 알림
 * - 답변 댓글 알림
 */
export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { theme: appTheme } = useAppStore();
  const isDark = appTheme === 'dark';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  /**
   * 알림 목록 불러오기
   */
  const loadNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await fetchNotifications(user.id);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('오류', '알림을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * 알림 타입별 아이콘
   */
  const getIconName = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'meeting_join':
        return 'people';
      case 'meeting_chat':
        return 'chatbubbles';
      case 'new_question':
        return 'help-circle';
      case 'answer_comment':
        return 'chatbox';
      default:
        return 'notifications';
    }
  };

  const getIconBgColor = (type: Notification['type']): string => {
    switch (type) {
      case 'meeting_join':
      case 'meeting_chat':
        return theme.colors.primary;
      case 'new_question':
        return theme.colors.secondary;
      case 'answer_comment':
        return theme.colors.success;
      default:
        return theme.colors.primary;
    }
  };

  /**
   * 시간 포맷
   */
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;

    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * 모두 읽음 처리
   */
  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await markAllNotificationsAsRead(user.id);
      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      Alert.alert('완료', '모든 알림을 읽음 처리했습니다.');
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('오류', '읽음 처리에 실패했습니다.');
    }
  };

  /**
   * 알림 클릭 처리
   */
  const handleNotificationPress = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }

    // 관련 페이지로 이동
    if (notification.type === 'meeting_join' || notification.type === 'meeting_chat') {
      if (notification.meeting_id) {
        router.push(`/meetings/${notification.meeting_id}`);
      } else if (notification.related_id) {
        router.push(`/meetings/${notification.related_id}`);
      }
    } else if (notification.type === 'new_question' && notification.related_id) {
      router.push(`/questions/${notification.related_id}`);
    } else if (notification.type === 'answer_comment' && notification.related_id) {
      router.push(`/answers/${notification.related_id}`);
    }
  };

  /**
   * 알림 삭제
   */
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const { error } = await deleteNotification(notificationId);
      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
      Alert.alert('오류', '알림 삭제에 실패했습니다.');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        isDark && styles.notificationCardDark,
        !item.read && styles.notificationCardUnread,
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
            {!item.read && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.message, isDark && styles.messageDark]}>
            {item.message}
          </Text>
          <Text style={[styles.time, isDark && styles.timeDark]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDeleteNotification(item.id);
        }}
      >
        <Ionicons name="close-circle" size={20} color="#8E8E93" />
      </TouchableOpacity>
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

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <TopNavBar
        title="알림"
        showBackButton
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              onPress={handleMarkAllAsRead}
              style={styles.markAllButton}
            >
              <Text style={styles.markAllButtonText}>모두 읽음</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, isDark && styles.textSecondaryDark]}>
            알림을 불러오는 중...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            notifications.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            loadNotifications();
          }}
        />
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
  textSecondaryDark: {
    color: '#8E8E93',
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
  deleteButton: {
    padding: 4,
    marginLeft: theme.spacing.xs,
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
