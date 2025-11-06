import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'

function NotificationBell() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const user = useAuthStore((state) => state.user)
  const getAllNotifications = useNotificationStore((state) => state.getAllNotifications)
  const unreadCount = useNotificationStore((state) => state.unreadCount)
  const markAsRead = useNotificationStore((state) => state.markAsRead)
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead)
  const deleteNotification = useNotificationStore((state) => state.deleteNotification)
  const clearAllNotifications = useNotificationStore((state) => state.clearAllNotifications)

  // Get all notifications (both local and DB)
  const allNotifications = getAllNotifications()

  // Filter to show only unread notifications
  const unreadNotifications = allNotifications.filter((n) => !n.read)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNotificationClick = (notification) => {
    // Delete notification (works for both local and DB notifications)
    deleteNotification(notification.id, user?.id)
    setIsOpen(false)

    // Navigate based on notification type
    if (notification.type === 'chat' && (notification.meetingId || notification.meeting_id)) {
      navigate(`/meetings/${notification.meetingId || notification.meeting_id}`)
    } else if (notification.type === 'meeting' && (notification.meetingId || notification.meeting_id)) {
      navigate(`/meetings/${notification.meetingId || notification.meeting_id}`)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'chat':
        return '💬'
      case 'meeting':
        return '📅'
      case 'system':
        return '🔔'
      default:
        return '📢'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="text-lg font-semibold text-gray-900">알림</h3>
            <div className="flex space-x-2">
              {unreadNotifications.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
                      clearAllNotifications(user?.id)
                    }
                  }}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  전체 삭제
                </button>
              )}
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {unreadNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <p>읽지 않은 알림이 없습니다</p>
              </div>
            ) : (
              unreadNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 text-2xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.created_at || notification.timestamp), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id, user?.id)
                      }}
                      className="flex-shrink-0 text-gray-400 hover:text-red-600"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
