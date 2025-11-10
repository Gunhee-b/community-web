import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useNotificationStore } from '../store/notificationStore'

/**
 * 모임 채팅 기능을 위한 커스텀 훅
 * 실시간 구독, 폴링, 알림, 이미지 전송, 읽음 표시, 입력 중 표시 등의 기능 제공
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
  const [typingUsers, setTypingUsers] = useState([])
  const [readReceipts, setReadReceipts] = useState({})
  const [uploadingImage, setUploadingImage] = useState(false)

  const addNotification = useNotificationStore((state) => state.addNotification)

  // Refs
  const typingTimeoutRef = useRef(null)

  // Ref to avoid stale closure in polling interval
  const chatsRef = useRef(chats)

  // Update ref whenever chats change
  useEffect(() => {
    chatsRef.current = chats
  }, [chats])

  /**
   * 채팅 메시지 가져오기 (읽음 표시 포함)
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
   * 읽음 표시 가져오기
   */
  const fetchReadReceipts = useCallback(async () => {
    if (!meetingId || !user) return

    const { data, error } = await supabase
      .from('meeting_chat_read_receipts')
      .select('chat_id, user_id')
      .in('chat_id', chats.map(chat => chat.id))

    if (error) {
      console.error('Error fetching read receipts:', error)
      return
    }

    // Group read receipts by chat_id
    const receiptsMap = {}
    data?.forEach(receipt => {
      if (!receiptsMap[receipt.chat_id]) {
        receiptsMap[receipt.chat_id] = []
      }
      receiptsMap[receipt.chat_id].push(receipt.user_id)
    })

    setReadReceipts(receiptsMap)
  }, [meetingId, user, chats])

  /**
   * 입력 중 상태 업데이트
   */
  const updateTypingIndicator = useCallback(async () => {
    if (!meetingId || !user || !isParticipant) return

    try {
      const { error } = await supabase
        .from('meeting_typing_indicators')
        .upsert({
          meeting_id: meetingId,
          user_id: user.id,
          username: user.username,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'meeting_id,user_id'
        })

      if (error) {
        console.error('Error updating typing indicator:', error)
      }
    } catch (error) {
      console.error('Error updating typing indicator:', error)
    }
  }, [meetingId, user, isParticipant])

  /**
   * 입력 중 상태 제거
   */
  const removeTypingIndicator = useCallback(async () => {
    if (!meetingId || !user) return

    try {
      await supabase
        .from('meeting_typing_indicators')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id)
    } catch (error) {
      console.error('Error removing typing indicator:', error)
    }
  }, [meetingId, user])

  /**
   * 입력 중 상태 가져오기
   */
  const fetchTypingIndicators = useCallback(async () => {
    if (!meetingId || !user) return

    const { data, error } = await supabase
      .from('meeting_typing_indicators')
      .select('user_id, username')
      .eq('meeting_id', meetingId)
      .neq('user_id', user.id)
      .gte('updated_at', new Date(Date.now() - 10000).toISOString()) // Last 10 seconds

    if (error) {
      console.error('Error fetching typing indicators:', error)
      return
    }

    setTypingUsers(data || [])
  }, [meetingId, user])

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
   * 이미지 업로드
   */
  const uploadImage = useCallback(async (file) => {
    if (!file) return null

    setUploadingImage(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `chat-images/${meetingId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('meeting-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Error uploading image:', uploadError)
        throw new Error('이미지 업로드 중 오류가 발생했습니다')
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('meeting-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }, [meetingId])

  /**
   * 메시지 전송 (텍스트 또는 이미지)
   */
  const sendMessage = useCallback(
    async (message, imageFile = null) => {
      if ((!message.trim() && !imageFile) || !user || !isParticipant) return

      setSending(true)
      try {
        // Upload image if provided
        let imageUrl = null
        if (imageFile) {
          imageUrl = await uploadImage(imageFile)
        }

        const { error } = await supabase.from('meeting_chats').insert({
          meeting_id: meetingId,
          user_id: user.id,
          message: message.trim() || '(사진)',
          image_url: imageUrl,
          anonymous_name: user.username
        })

        if (error) throw error

        // Remove typing indicator
        await removeTypingIndicator()

        setNewMessage('')
        return true
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      } finally {
        setSending(false)
      }
    },
    [meetingId, user, isParticipant, uploadImage, removeTypingIndicator]
  )

  /**
   * 메시지를 읽음으로 표시
   */
  const markMessagesAsRead = useCallback(async () => {
    if (!meetingId || !user || !isParticipant) return

    try {
      await supabase.rpc('mark_meeting_chats_as_read', {
        p_meeting_id: meetingId,
        p_user_id: user.id
      })

      // Refresh read receipts
      await fetchReadReceipts()
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [meetingId, user, isParticipant, fetchReadReceipts])

  /**
   * 입력 중 핸들러
   */
  const handleTyping = useCallback(() => {
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Update typing indicator
    updateTypingIndicator()

    // Set timeout to remove indicator after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      removeTypingIndicator()
    }, 3000)
  }, [updateTypingIndicator, removeTypingIndicator])

  /**
   * 초기 데이터 로드 및 구독 설정
   */
  useEffect(() => {
    if (!user || !isParticipant) return

    fetchChats()

    // Set up realtime subscription for chats
    const chatCleanup = subscribeToChats()

    // Set up realtime subscription for typing indicators
    const typingChannel = supabase
      .channel(`meeting-typing-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_typing_indicators',
          filter: `meeting_id=eq.${meetingId}`,
        },
        () => {
          fetchTypingIndicators()
        }
      )
      .subscribe()

    // Set up realtime subscription for read receipts
    const readReceiptsChannel = supabase
      .channel(`meeting-read-receipts-${meetingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_chat_read_receipts',
        },
        () => {
          fetchReadReceipts()
        }
      )
      .subscribe()

    // Set up polling as backup (every 5 seconds)
    const pollingInterval = setInterval(() => {
      if (isParticipant) {
        fetchChatsWithNotification()
        fetchTypingIndicators()
      }
    }, 5000)

    // Mark messages as read when component mounts
    markMessagesAsRead()

    return () => {
      chatCleanup()
      supabase.removeChannel(typingChannel)
      supabase.removeChannel(readReceiptsChannel)
      clearInterval(pollingInterval)
      removeTypingIndicator()

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [
    meetingId,
    user,
    isParticipant,
    subscribeToChats,
    fetchChatsWithNotification,
    fetchChats,
    fetchTypingIndicators,
    fetchReadReceipts,
    markMessagesAsRead,
    removeTypingIndicator
  ])

  // Fetch read receipts whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      fetchReadReceipts()
    }
  }, [chats, fetchReadReceipts])

  return {
    chats,
    newMessage,
    setNewMessage,
    sending,
    sendMessage,
    fetchChats,
    typingUsers,
    readReceipts,
    handleTyping,
    markMessagesAsRead,
    uploadingImage,
  }
}
