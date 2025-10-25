import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,

      addNotification: (notification) => {
        const state = get()

        // Check if we already have a notification for this message ID
        if (notification.messageId) {
          const exists = state.notifications.some(
            (n) => n.messageId === notification.messageId
          )
          if (exists) {
            console.log('Notification already exists for message:', notification.messageId)
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

      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      deleteNotification: (notificationId) => {
        set((state) => {
          const notification = state.notifications.find((n) => n.id === notificationId)
          return {
            notifications: state.notifications.filter((n) => n.id !== notificationId),
            unreadCount: notification && !notification.read ? state.unreadCount - 1 : state.unreadCount,
          }
        })
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },
    }),
    {
      name: 'notification-storage',
    }
  )
)
