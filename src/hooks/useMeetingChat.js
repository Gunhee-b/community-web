import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotificationStore } from '../store/notificationStore'

/**
 * 모임 채팅 기능을 위한 커스텀 훅
 * 실시간 구독, 폴링, 알림 등의 복잡한 로직을 캡슐화
 *
 * @param {string} meetingId - 모임 ID
 * @param {Object} user - 현재 로그인한 사용자 정보
 * @param {boolean} isParticipant - 사용자가 참가자인지 여부
 * @returns {Object} 채팅 관련 상태 및 함수
 */
export const useMeetingChat = (meetingId, user, isParticipant) => {
  const [chats, setChats] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  const addNotification = useNotificationStore((state) => state.addNotification)

  // Ref to avoid stale closure in polling interval
  const chatsRef = useRef(chats)

  // Update ref whenever chats change
  useEffect(() => {
    chatsRef.current = chats
  }, [chats])

  /**
   * 채팅 메시지 가져오기
   */
  const fetchChats = useCallback(async () => {
    if (!meetingId) return

    const { data, error } = await supabase
      .from('meeting_chats')
      .select('*, user:users!user_id(username)')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chats:', error)
    } else {
      console.log('Chats loaded:', data)
    }

    setChats(data || [])
  }, [meetingId])

  /**
   * 새 메시지 확인 및 알림 생성
   */
  const fetchChatsWithNotification = useCallback(async () => {
    if (!meetingId || !user) return

    const { data, error } = await supabase
      .from('meeting_chats')
      .select('*, user:users!user_id(username)')
      .eq('meeting_id', meetingId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chats:', error)
      return
    }

    if (data) {
      // Check for new messages using ref to get latest chats value
      const newMessages = data.filter(
        (newChat) => !chatsRef.current.some((existingChat) => existingChat.id === newChat.id)
      )

      // Send notification for new messages from other users
      newMessages.forEach((message) => {
        if (message.user_id !== user.id) {
          console.log('New message detected via polling, adding notification')
          const senderName = message.user?.username || message.anonymous_name
          addNotification({
            type: 'chat',
            title: `모임 채팅 - 새 메시지`,
            message: `${senderName}: ${message.message}`,
            meetingId: meetingId,
            messageId: message.id,
          })
        }
      })

      setChats(data)
    }
  }, [meetingId, user, addNotification])

  /**
   * 실시간 구독 설정
   */
  const subscribeToChats = useCallback(() => {
    if (!meetingId || !user) return () => {}

    console.log('Setting up realtime subscription for meeting:', meetingId)

    const channel = supabase
      .channel(`meeting-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_chats',
          filter: `meeting_id=eq.${meetingId}`,
        },
        async (payload) => {
          console.log('New message received via realtime:', payload.new)

          // Add notification if message is from someone else
          if (payload.new.user_id !== user.id) {
            console.log('Message from another user, adding notification')

            // Fetch sender's username
            const { data: senderData } = await supabase
              .from('users')
              .select('username')
              .eq('id', payload.new.user_id)
              .single()

            const senderName = senderData?.username || payload.new.anonymous_name

            addNotification({
              type: 'chat',
              title: `모임 채팅 - 새 메시지`,
              message: `${senderName}: ${payload.new.message}`,
              meetingId: meetingId,
              messageId: payload.new.id,
            })
          }

          // Fetch chats to get user information
          fetchChats()
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      console.log('Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [meetingId, user, addNotification, fetchChats])

  /**
   * 메시지 전송
   */
  const sendMessage = useCallback(
    async (message) => {
      if (!message.trim() || !user || !isParticipant) return

      setSending(true)
      try {
        const { error } = await supabase.from('meeting_chats').insert({
          meeting_id: meetingId,
          user_id: user.id,
          message: message.trim(),
        })

        if (error) throw error

        setNewMessage('')
        return true
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      } finally {
        setSending(false)
      }
    },
    [meetingId, user, isParticipant]
  )

  /**
   * 초기 데이터 로드 및 구독 설정
   */
  useEffect(() => {
    if (!user || !isParticipant) return

    fetchChats()

    // Set up realtime subscription
    const cleanup = subscribeToChats()

    // Set up polling as backup (every 5 seconds)
    const pollingInterval = setInterval(() => {
      if (isParticipant) {
        fetchChatsWithNotification()
      }
    }, 5000)

    return () => {
      cleanup()
      clearInterval(pollingInterval)
    }
  }, [meetingId, user, isParticipant, subscribeToChats, fetchChatsWithNotification, fetchChats])

  return {
    chats,
    newMessage,
    setNewMessage,
    sending,
    sendMessage,
    fetchChats,
  }
}
