import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { Notification } from '../types';

/**
 * 로컬 알림 타입 (인앱 알림용)
 */
export interface LocalNotification {
  id: string | number;
  type: 'chat' | 'meeting' | 'question' | 'vote' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  meetingId?: string;
  messageId?: string;
  questionId?: string;
}

/**
 * 알림 상태 타입
 */
export interface NotificationState {
  // 상태
  notifications: LocalNotification[]; // 로컬 인앱 알림
  dbNotifications: Notification[]; // 데이터베이스 알림
  unreadCount: number;
  isLoadingDb: boolean;

  // Actions
  addNotification: (notification: Omit<LocalNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId: string | number, userId?: string) => Promise<void>;
  markAllAsRead: (userId?: string) => Promise<void>;
  deleteNotification: (notificationId: string | number, userId?: string) => Promise<void>;
  clearAllNotifications: (userId?: string) => Promise<void>;
  loadDbNotifications: (userId: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => () => void;
  getAllNotifications: () => (LocalNotification | Notification)[];
}

/**
 * 알림 관리 스토어
 *
 * @description
 * 앱 내 알림과 데이터베이스 알림을 모두 관리합니다.
 * - 로컬 알림: 실시간 채팅, 모임 등의 인앱 알림
 * - DB 알림: 서버에서 생성된 영구 알림
 *
 * @example
 * ```typescript
 * import { useNotificationStore } from '@/store';
 *
 * function NotificationBell() {
 *   const { unreadCount, getAllNotifications, markAsRead } = useNotificationStore();
 *
 *   const notifications = getAllNotifications();
 *
 *   return (
 *     <View>
 *       <Badge count={unreadCount} />
 *       <FlatList
 *         data={notifications}
 *         renderItem={({ item }) => (
 *           <NotificationItem
 *             notification={item}
 *             onPress={() => markAsRead(item.id)}
 *           />
 *         )}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      notifications: [],
      dbNotifications: [],
      unreadCount: 0,
      isLoadingDb: false,

      /**
       * 로컬 인앱 알림 추가
       *
       * @param notification - 알림 데이터
       *
       * @example
       * ```typescript
       * const { addNotification } = useNotificationStore();
       *
       * addNotification({
       *   type: 'chat',
       *   title: '새 메시지',
       *   message: 'John: 안녕하세요!',
       *   meetingId: '123',
       *   messageId: '456'
       * });
       * ```
       */
      addNotification: (notification) => {
        const state = get();

        // 동일한 메시지에 대한 읽지 않은 알림이 있는지 확인
        if (notification.messageId) {
          const exists = state.notifications.some(
            (n) => n.messageId === notification.messageId && !n.read
          );

          if (exists) {
            console.log('Unread notification already exists for message:', notification.messageId);
            return;
          }
        }

        const newNotification: LocalNotification = {
          ...notification,
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          read: false,
        };

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      /**
       * 알림을 읽음으로 표시
       *
       * @param notificationId - 알림 ID
       * @param userId - 사용자 ID (DB 알림의 경우 필요)
       *
       * @example
       * ```typescript
       * await markAsRead(notification.id, user.id);
       * ```
       */
      markAsRead: async (notificationId, userId) => {
        const state = get();

        // DB 알림인지 확인
        const isDbNotification = state.dbNotifications.some((n) => n.id === notificationId);

        if (isDbNotification && userId) {
          try {
            await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', notificationId)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Error marking notification as read:', error);
          }
        } else {
          // 로컬 알림
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }));
        }
      },

      /**
       * 모든 알림을 읽음으로 표시
       *
       * @param userId - 사용자 ID (DB 알림 포함 시 필요)
       *
       * @example
       * ```typescript
       * await markAllAsRead(user.id);
       * ```
       */
      markAllAsRead: async (userId) => {
        if (userId) {
          try {
            await supabase.rpc('mark_all_notifications_as_read', {
              p_user_id: userId,
            });

            // 로컬 상태 업데이트
            set((state) => ({
              dbNotifications: state.dbNotifications.map((n) => ({ ...n, read: true })),
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
              unreadCount: 0,
            }));
          } catch (error) {
            console.error('Error marking all notifications as read:', error);
          }
        } else {
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }));
        }
      },

      /**
       * 알림 삭제
       *
       * @param notificationId - 알림 ID
       * @param userId - 사용자 ID (DB 알림의 경우 필요)
       */
      deleteNotification: async (notificationId, userId) => {
        const state = get();

        const isDbNotification = state.dbNotifications.some((n) => n.id === notificationId);

        if (isDbNotification && userId) {
          try {
            await supabase
              .from('notifications')
              .delete()
              .eq('id', notificationId)
              .eq('user_id', userId);
          } catch (error) {
            console.error('Error deleting notification:', error);
          }
        } else {
          // 로컬 알림
          set((state) => {
            const notification = state.notifications.find((n) => n.id === notificationId);
            return {
              notifications: state.notifications.filter((n) => n.id !== notificationId),
              unreadCount:
                notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
            };
          });
        }
      },

      /**
       * 모든 알림 삭제
       *
       * @param userId - 사용자 ID (DB 알림 포함 시 필요)
       */
      clearAllNotifications: async (userId) => {
        if (userId) {
          try {
            await supabase.from('notifications').delete().eq('user_id', userId);

            set({ dbNotifications: [], notifications: [], unreadCount: 0 });
          } catch (error) {
            console.error('Error clearing all notifications:', error);
          }
        } else {
          set({ notifications: [], unreadCount: 0 });
        }
      },

      /**
       * 데이터베이스에서 알림 로드
       *
       * @param userId - 사용자 ID
       *
       * @example
       * ```typescript
       * const { loadDbNotifications } = useNotificationStore();
       *
       * useEffect(() => {
       *   if (user) {
       *     loadDbNotifications(user.id);
       *   }
       * }, [user]);
       * ```
       */
      loadDbNotifications: async (userId) => {
        if (!userId) return;

        set({ isLoadingDb: true });

        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;

          const unreadCount = data?.filter((n) => !n.read).length || 0;

          set({
            dbNotifications: (data || []) as Notification[],
            unreadCount,
            isLoadingDb: false,
          });
        } catch (error) {
          console.error('Error loading notifications:', error);
          set({ isLoadingDb: false });
        }
      },

      /**
       * 실시간 알림 구독
       *
       * @param userId - 사용자 ID
       * @returns 구독 해제 함수
       *
       * @example
       * ```typescript
       * useEffect(() => {
       *   if (!user) return;
       *
       *   const unsubscribe = subscribeToNotifications(user.id);
       *   return unsubscribe;
       * }, [user]);
       * ```
       */
      subscribeToNotifications: (userId) => {
        if (!userId) return () => {};

        console.log('Setting up notification subscription for user:', userId);

        const channel = supabase
          .channel(`notifications-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('New notification received:', payload.new);
              const state = get();

              set({
                dbNotifications: [payload.new as Notification, ...state.dbNotifications],
                unreadCount: state.unreadCount + 1,
              });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Notification updated:', payload.new);
              const state = get();

              set({
                dbNotifications: state.dbNotifications.map((n) =>
                  n.id === payload.new.id ? (payload.new as Notification) : n
                ),
              });

              // 읽지 않은 알림 수 재계산
              const unreadCount = state.dbNotifications.filter((n) =>
                n.id === payload.new.id
                  ? (payload.new as Notification).read === false
                  : n.read === false
              ).length;

              set({ unreadCount });
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('Notification deleted:', payload.old);
              const state = get();
              const deletedNotif = state.dbNotifications.find((n) => n.id === payload.old.id);

              set({
                dbNotifications: state.dbNotifications.filter((n) => n.id !== payload.old.id),
                unreadCount:
                  deletedNotif && !deletedNotif.read
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
              });
            }
          )
          .subscribe();

        return () => {
          console.log('Cleaning up notification subscription');
          supabase.removeChannel(channel);
        };
      },

      /**
       * 모든 알림 가져오기 (로컬 + DB)
       *
       * @returns 정렬된 알림 배열
       */
      getAllNotifications: () => {
        const state = get();
        return [...state.dbNotifications, ...state.notifications].sort((a, b) => {
          const timeA = new Date('created_at' in a ? a.created_at : a.timestamp);
          const timeB = new Date('created_at' in b ? b.created_at : b.timestamp);
          return timeB.getTime() - timeA.getTime();
        });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 로컬 알림만 영구 저장
      partialize: (state) => ({
        notifications: state.notifications,
      }),
    }
  )
);

/**
 * Selectors
 */

/**
 * 읽지 않은 알림 수 가져오기
 */
export const selectUnreadCount = (state: NotificationState) => state.unreadCount;

/**
 * 로딩 상태 가져오기
 */
export const selectIsLoadingDb = (state: NotificationState) => state.isLoadingDb;

/**
 * 모든 알림 가져오기
 */
export const selectAllNotifications = (state: NotificationState) => state.getAllNotifications();

/**
 * 로컬 알림만 가져오기
 */
export const selectLocalNotifications = (state: NotificationState) => state.notifications;

/**
 * DB 알림만 가져오기
 */
export const selectDbNotifications = (state: NotificationState) => state.dbNotifications;
