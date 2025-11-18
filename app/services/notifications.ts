import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';
import { Notification } from '@/types';

/**
 * Configure notification behavior
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async () => {
  try {
    if (!Device.isDevice) {
      // 시뮬레이터나 Expo Go에서는 푸시 알림이 제한됨 - 조용히 반환
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      // 권한이 거부되었을 때만 로그 출력
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('✅ Push token registered:', token);

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token;
  } catch (error) {
    // Expo Go에서는 푸시 알림 토큰 생성이 실패할 수 있음 - 조용히 처리
    return null;
  }
};

/**
 * Create notification in database
 */
export const createNotification = async (notificationData: {
  user_id: string;
  title: string;
  message: string;
  type: Notification['type'];
  meeting_id?: string;
  related_id?: string;
}) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: notificationData.user_id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          meeting_id: notificationData.meeting_id,
          related_id: notificationData.related_id,
          read: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { data: null, error };
  }
};

/**
 * Fetch user notifications
 */
export const fetchNotifications = async (userId: string, unreadOnly: boolean = false) => {
  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { data: data as Notification[], error: null };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { data: null, error };
  }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { error };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { error };
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return { error };
  }
};

/**
 * Send local notification
 */
export const sendLocalNotification = async (title: string, body: string, data?: any) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error sending local notification:', error);
  }
};

/**
 * Subscribe to notification updates
 */
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: Notification) => void
) => {
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
        const notification = payload.new as Notification;
        callback(notification);

        // Send local notification
        sendLocalNotification(notification.title, notification.message, {
          notificationId: notification.id,
          type: notification.type,
          relatedId: notification.related_id,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
