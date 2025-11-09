import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      dbNotifications: [], // Notifications from database
      isLoadingDb: false,

      // Load notifications from database for logged-in user
      loadDbNotifications: async (userId) => {
        if (!userId) return

        set({ isLoadingDb: true })

        try {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50)

          if (error) {
            console.error('Error loading notifications:', error)
            // Don't throw, just log the error and continue
            set({
              dbNotifications: [],
              unreadCount: 0,
              isLoadingDb: false
            })
            return
          }

          const unreadCount = data?.filter(n => !n.read).length || 0

          set({
            dbNotifications: data || [],
            unreadCount: unreadCount,
            isLoadingDb: false
          })
        } catch (error) {
          console.error('Error loading notifications:', error)
          set({
            dbNotifications: [],
            unreadCount: 0,
            isLoadingDb: false
          })
        }
      },

      // Subscribe to real-time notifications
      subscribeToNotifications: (userId) => {
        if (!userId) return () => {}

        console.log('Setting up notification subscription for user:', userId)

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
              console.log('New notification received:', payload.new)
              const state = get()

              set({
                dbNotifications: [payload.new, ...state.dbNotifications],
                unreadCount: state.unreadCount + 1
              })
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
              console.log('Notification updated:', payload.new)
              const state = get()

              set({
                dbNotifications: state.dbNotifications.map(n =>
                  n.id === payload.new.id ? payload.new : n
                )
              })

              // Recalculate unread count
              const unreadCount = state.dbNotifications.filter(n =>
                n.id === payload.new.id ? payload.new.read === false : n.read === false
              ).length

              set({ unreadCount })
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
              console.log('Notification deleted:', payload.old)
              const state = get()
              const deletedNotif = state.dbNotifications.find(n => n.id === payload.old.id)

              set({
                dbNotifications: state.dbNotifications.filter(n => n.id !== payload.old.id),
                unreadCount: deletedNotif && !deletedNotif.read
                  ? Math.max(0, state.unreadCount - 1)
                  : state.unreadCount
              })
            }
          )
          .subscribe()

        return () => {
          console.log('Cleaning up notification subscription')
          supabase.removeChannel(channel)
        }
      },

      addNotification: (notification) => {
        const state = get()

        // Check if we already have an UNREAD notification for this message ID
        // This allows the same message to create a new notification if the previous one was read and deleted
        if (notification.messageId) {
          const exists = state.notifications.some(
            (n) => n.messageId === notification.messageId && !n.read
          )
          if (exists) {
            console.log('Unread notification already exists for message:', notification.messageId)
            return
          }
        }

        const newNotification = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toISOString(),
          read: false,
          ...notification,
        }

        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: async (notificationId, userId = null) => {
        const state = get()

        // Check if it's a DB notification
        const isDbNotification = state.dbNotifications.some(n => n.id === notificationId)

        if (isDbNotification && userId) {
          try {
            await supabase
              .from('notifications')
              .update({ read: true })
              .eq('id', notificationId)
              .eq('user_id', userId)
          } catch (error) {
            console.error('Error marking notification as read:', error)
          }
        } else {
          // Local notification
          set((state) => ({
            notifications: state.notifications.map((n) =>
              n.id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          }))
        }
      },

      markAllAsRead: async (userId = null) => {
        if (userId) {
          try {
            await supabase.rpc('mark_all_notifications_as_read', {
              p_user_id: userId
            })

            // Update local state
            set((state) => ({
              dbNotifications: state.dbNotifications.map((n) => ({ ...n, read: true })),
              notifications: state.notifications.map((n) => ({ ...n, read: true })),
              unreadCount: 0,
            }))
          } catch (error) {
            console.error('Error marking all notifications as read:', error)
          }
        } else {
          set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
            unreadCount: 0,
          }))
        }
      },

      deleteNotification: async (notificationId, userId = null) => {
        const state = get()

        // Check if it's a DB notification
        const isDbNotification = state.dbNotifications.some(n => n.id === notificationId)

        if (isDbNotification && userId) {
          try {
            await supabase
              .from('notifications')
              .delete()
              .eq('id', notificationId)
              .eq('user_id', userId)
          } catch (error) {
            console.error('Error deleting notification:', error)
          }
        } else {
          // Local notification
          set((state) => {
            const notification = state.notifications.find((n) => n.id === notificationId)
            return {
              notifications: state.notifications.filter((n) => n.id !== notificationId),
              unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
            }
          })
        }
      },

      clearAllNotifications: async (userId = null) => {
        if (userId) {
          try {
            await supabase
              .from('notifications')
              .delete()
              .eq('user_id', userId)

            set({ dbNotifications: [], notifications: [], unreadCount: 0 })
          } catch (error) {
            console.error('Error clearing all notifications:', error)
          }
        } else {
          set({ notifications: [], unreadCount: 0 })
        }
      },

      // Get all notifications (both local and DB)
      getAllNotifications: () => {
        const state = get()
        return [...state.dbNotifications, ...state.notifications].sort((a, b) => {
          const timeA = new Date(a.created_at || a.timestamp)
          const timeB = new Date(b.created_at || b.timestamp)
          return timeB - timeA
        })
      },
    }),
    {
      name: 'notification-storage',
    }
  )
)
