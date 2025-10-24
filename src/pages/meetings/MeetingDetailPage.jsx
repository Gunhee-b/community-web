import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { formatDate, getDday, toLocalDateTimeString } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'
import LocationMapPreview from '../../components/meetings/LocationMapPreview'

function MeetingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const [meeting, setMeeting] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isParticipant, setIsParticipant] = useState(false)
  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const chatEndRef = useRef(null)

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    location: '',
    host_introduction: '',
    description: '',
    host_style: '',
    host_sns_link: '',
    start_datetime: '',
    end_datetime: '',
    max_participants: '',
    purpose: 'coffee'
  })

  useEffect(() => {
    fetchMeetingData()

    // Try Realtime subscription
    const cleanup = subscribeToChats()

    // Also set up polling as backup (every 5 seconds)
    const pollingInterval = setInterval(() => {
      if (isParticipant) {
        fetchChatsWithNotification()
      }
    }, 5000)

    // Listen for localStorage events for cross-tab notifications
    const handleStorageEvent = (e) => {
      if (e.key === 'temp_meeting_notification') {
        const notificationData = JSON.parse(e.newValue)
        if (notificationData && notificationData.hostId === user.id) {
          addNotification({
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            meetingId: notificationData.meetingId,
          })
        }
      }
    }

    window.addEventListener('storage', handleStorageEvent)

    return () => {
      cleanup()
      clearInterval(pollingInterval)
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [id, isParticipant, user.id])

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chats])


  const fetchMeetingData = async () => {
    try {
      // Fetch meeting details
      const { data: meetingData, error: meetingError } = await supabase
        .from('offline_meetings')
        .select('*, host:users!host_id(username)')
        .eq('id', id)
        .single()

      if (meetingError) {
        console.error('Error fetching meeting:', meetingError)
      }

      setMeeting(meetingData)

      // Fetch participants
      const { data: participantsData, error: participantsError } = await supabase
        .from('meeting_participants')
        .select('*, user:users(username)')
        .eq('meeting_id', id)
        .is('cancelled_at', null)

      if (participantsError) {
        console.error('Error fetching participants:', participantsError)
      }

      console.log('Current user ID:', user.id)
      console.log('Participants:', participantsData)

      const isUserParticipant = participantsData?.some((p) => p.user_id === user.id) || false

      console.log('Is participant:', isUserParticipant)

      setParticipants(participantsData || [])
      setIsParticipant(isUserParticipant)

      // Fetch chats if participant
      if (isUserParticipant) {
        console.log('Fetching chats...')
        await fetchChats()
      }
    } catch (error) {
      console.error('Error fetching meeting:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('meeting_chats')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chats:', error)
    } else {
      console.log('Chats loaded:', data)
    }

    setChats(data || [])
  }

  const fetchChatsWithNotification = async () => {
    const { data, error } = await supabase
      .from('meeting_chats')
      .select('*')
      .eq('meeting_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching chats:', error)
      return
    }

    if (data) {
      // Check for new messages
      const newMessages = data.filter(
        (newChat) => !chats.some((existingChat) => existingChat.id === newChat.id)
      )

      // Send notification for new messages from other users
      newMessages.forEach((message) => {
        if (message.user_id !== user.id) {
          console.log('New message detected via polling, adding notification')
          addNotification({
            type: 'chat',
            title: `모임 채팅 - 새 메시지`,
            message: `${message.anonymous_name}: ${message.message}`,
            meetingId: id,
          })
        }
      })

      setChats(data)
    }
  }

  const subscribeToChats = () => {
    console.log('Setting up realtime subscription for meeting:', id)

    const channel = supabase
      .channel(`meeting-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'meeting_chats',
          filter: `meeting_id=eq.${id}`,
        },
        (payload) => {
          console.log('New message received via realtime:', payload.new)

          // Add notification if message is from someone else
          if (payload.new.user_id !== user.id) {
            console.log('Message from another user, adding notification')

            addNotification({
              type: 'chat',
              title: `모임 채팅 - 새 메시지`,
              message: `${payload.new.anonymous_name}: ${payload.new.message}`,
              meetingId: id,
            })
          }

          setChats((prev) => {
            // Avoid duplicates
            const exists = prev.some(chat => chat.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new]
          })
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })

    return () => {
      console.log('Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }

  const handleJoin = async () => {
    // Check if meeting is confirmed
    if (meeting.status === 'confirmed') {
      alert('이미 확정된 모임입니다. 더 이상 참가할 수 없습니다.')
      return
    }

    try {
      // Get anonymous name
      const anonymousName = `참가자${participants.length + 1}`

      await supabase.from('meeting_participants').insert([
        {
          meeting_id: id,
          user_id: user.id,
        },
      ])

      fetchMeetingData()
    } catch (error) {
      console.error('Error joining meeting:', error)
      alert('참가 신청 중 오류가 발생했습니다')
    }
  }

  const handleConfirmMeeting = async () => {
    if (!confirm('모임을 확정하시겠습니까? 확정 후에는 더 이상 새로운 참가자를 받을 수 없습니다.')) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('confirm_meeting', {
        p_meeting_id: id,
        p_user_id: user.id
      })

      if (error) {
        throw new Error(error.message || '모임 확정 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '모임 확정 중 오류가 발생했습니다')
      }

      alert('모임이 확정되었습니다!')
      fetchMeetingData()
    } catch (error) {
      console.error('Error confirming meeting:', error)
      alert(error.message)
    }
  }

  const handleUnconfirmMeeting = async () => {
    if (!confirm('모임 확정을 취소하시겠습니까? 취소하면 다시 새로운 참가자를 받을 수 있습니다.')) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('unconfirm_meeting', {
        p_meeting_id: id,
        p_user_id: user.id
      })

      if (error) {
        throw new Error(error.message || '확정 취소 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '확정 취소 중 오류가 발생했습니다')
      }

      alert('모임 확정이 취소되었습니다. 다시 참가자를 받을 수 있습니다.')
      fetchMeetingData()
    } catch (error) {
      console.error('Error unconfirming meeting:', error)
      alert(error.message)
    }
  }

  const handleLeaveMeeting = async () => {
    if (!confirm('정말로 이 모임에서 나가시겠습니까?\n모임에서 나가면 채팅 기록도 사라집니다.')) {
      return
    }

    try {
      const { data, error } = await supabase.rpc('leave_meeting', {
        p_meeting_id: id,
        p_user_id: user.id
      })

      if (error) {
        throw new Error(error.message || '모임 나가기 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '모임 나가기 중 오류가 발생했습니다')
      }

      // Send notification to host
      if (data.host_id && data.anonymous_name) {
        console.log(`Participant ${data.anonymous_name} left the meeting. Host ID: ${data.host_id}`)

        const notificationEvent = {
          type: 'meeting_leave',
          title: '모임 참가자 퇴장',
          message: `${data.anonymous_name}님이 모임에서 나갔습니다.`,
          meetingId: id,
          timestamp: new Date().toISOString(),
          hostId: data.host_id
        }

        // If current user is the host (unlikely but possible if admin leaves their own meeting)
        // Add notification directly
        if (user.id === data.host_id) {
          addNotification({
            type: notificationEvent.type,
            title: notificationEvent.title,
            message: notificationEvent.message,
            meetingId: notificationEvent.meetingId,
          })
        }

        // Store in localStorage to trigger events in other tabs/sessions
        // This creates a storage event that other tabs can listen to
        localStorage.setItem('temp_meeting_notification', JSON.stringify(notificationEvent))
        localStorage.removeItem('temp_meeting_notification')
      }

      alert('모임에서 나갔습니다.')
      navigate('/meetings')
    } catch (error) {
      console.error('Error leaving meeting:', error)
      alert(error.message)
    }
  }

  const handleEditClick = () => {
    if (!meeting) return

    // Format datetime for input (YYYY-MM-DDTHH:mm) using local timezone
    setEditForm({
      location: meeting.location,
      host_introduction: meeting.host_introduction || '',
      description: meeting.description || '',
      host_style: meeting.host_style || '',
      host_sns_link: meeting.host_sns_link || '',
      start_datetime: toLocalDateTimeString(meeting.start_datetime),
      end_datetime: toLocalDateTimeString(meeting.end_datetime),
      max_participants: meeting.max_participants.toString(),
      purpose: meeting.purpose
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      // Convert datetime-local strings to ISO format (UTC)
      // datetime-local format: YYYY-MM-DDTHH:mm (local time)
      // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ (UTC time)
      const startDatetimeISO = new Date(editForm.start_datetime).toISOString()
      const endDatetimeISO = editForm.end_datetime ? new Date(editForm.end_datetime).toISOString() : null

      console.log('Updating meeting with:', {
        location: editForm.location,
        start_datetime: startDatetimeISO,
        end_datetime: endDatetimeISO,
        max_participants: parseInt(editForm.max_participants),
        purpose: editForm.purpose
      })

      const { data, error } = await supabase
        .from('offline_meetings')
        .update({
          location: editForm.location,
          host_introduction: editForm.host_introduction || null,
          description: editForm.description || null,
          host_style: editForm.host_style || null,
          host_sns_link: editForm.host_sns_link || null,
          start_datetime: startDatetimeISO,
          end_datetime: endDatetimeISO,
          max_participants: parseInt(editForm.max_participants),
          purpose: editForm.purpose
        })
        .eq('id', id)
        .select('*, host:users!host_id(username)')

      console.log('Update result:', { data, error })

      if (error) throw error

      alert('모임 정보가 수정되었습니다')
      setEditModalOpen(false)

      // Fetch updated data to ensure UI is refreshed with latest info
      await fetchMeetingData()
    } catch (error) {
      console.error('Error updating meeting:', error)
      alert(error.message || '모임 수정 중 오류가 발생했습니다')
    }
  }

  const handleDeleteMeeting = async () => {
    if (!window.confirm('정말로 이 모임을 삭제하시겠습니까?')) {
      return
    }

    try {
      console.log('Starting to delete meeting:', id)

      // Step 1: Delete all meeting chats
      const { data: deletedChats, error: chatsError } = await supabase
        .from('meeting_chats')
        .delete()
        .eq('meeting_id', id)
        .select()

      if (chatsError) {
        console.error('Error deleting chats:', chatsError)
        throw new Error(`채팅 삭제 실패: ${chatsError.message}`)
      }
      console.log('Chats deleted successfully:', deletedChats?.length || 0, 'records')

      // Step 2: Delete ALL meeting participants (including cancelled ones)
      const { data: deletedParticipants, error: participantsError } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', id)
        .select()

      if (participantsError) {
        console.error('Error deleting participants:', participantsError)
        throw new Error(`참가자 삭제 실패: ${participantsError.message}`)
      }
      console.log('Participants deleted successfully:', deletedParticipants?.length || 0, 'records')

      // Step 3: Now safe to delete the meeting
      const { data: deletedMeeting, error: meetingError } = await supabase
        .from('offline_meetings')
        .delete()
        .eq('id', id)
        .select()

      if (meetingError) {
        console.error('Error deleting meeting:', meetingError)
        throw new Error(`모임 삭제 실패: ${meetingError.message}`)
      }
      console.log('Meeting deleted successfully:', deletedMeeting)

      alert('모임이 성공적으로 삭제되었습니다')
      navigate('/meetings')
    } catch (error) {
      console.error('Error deleting meeting:', error)
      alert(error.message || '모임 삭제 중 오류가 발생했습니다')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const participantIndex = participants.findIndex(
        (p) => p.user_id === user.id
      )
      const anonymousName = `참가자${participantIndex + 1}`

      console.log('Sending message:', {
        meeting_id: id,
        user_id: user.id,
        message: newMessage,
        anonymous_name: anonymousName,
      })

      const { data, error } = await supabase.from('meeting_chats').insert([
        {
          meeting_id: id,
          user_id: user.id,
          message: newMessage,
          anonymous_name: anonymousName,
        },
      ]).select()

      if (error) {
        console.error('Error sending message:', error)
        alert('메시지 전송 중 오류가 발생했습니다: ' + error.message)
      } else {
        console.log('Message sent successfully:', data)
        setNewMessage('')
        // Manually add the message to the chat list for immediate feedback
        if (data && data.length > 0) {
          setChats((prev) => [...prev, data[0]])
        }
        // Also refresh the chat list from server
        await fetchChats()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('메시지 전송 중 오류가 발생했습니다')
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!meeting) {
    return (
      <div>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">모임을 찾을 수 없습니다</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate('/meetings')}
        className="mb-6"
      >
        ← 목록으로
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meeting Info */}
        <div className="md:col-span-2">
          <Card className="mb-6">
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  meeting.purpose === 'coffee'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {meeting.purpose === 'coffee' ? '☕ 커피' : '🍺 술'}
              </span>
              <span className="ml-3 text-lg font-bold text-blue-600">
                {getDday(meeting.start_datetime)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {meeting.location}
              </h1>
              {isParticipant && meeting.host_id !== user?.id && (
                <button
                  onClick={handleLeaveMeeting}
                  className="text-sm text-red-600 hover:text-red-800 underline ml-4"
                >
                  모임 나가기
                </button>
              )}
            </div>

            {/* Naver Map Link right below location */}
            <LocationMapPreview location={meeting.location} showInDetail={true} />

            {meeting.host_introduction && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">👤 모임장 소개</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{meeting.host_introduction}</p>
              </div>
            )}

            {meeting.description && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">📝 모임 상세</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{meeting.description}</p>
              </div>
            )}

            {meeting.host_style && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">✨ 모임 운영 방식 및 스타일</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{meeting.host_style}</p>
              </div>
            )}

            {meeting.host_sns_link && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">🔗 모임장 SNS</h3>
                <a
                  href={meeting.host_sns_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {meeting.host_sns_link}
                </a>
              </div>
            )}

            <div className="space-y-2 text-gray-600 mb-4">
              <p>
                📅 {formatDate(meeting.start_datetime, 'yyyy년 MM월 dd일 HH:mm')}
                {' - '}
                {formatDate(meeting.end_datetime, 'HH:mm')}
              </p>
              <p>👤 호스트: {meeting.host?.username}</p>
              <p>
                👥 참여 인원: {participants.length} / {meeting.max_participants}명
              </p>
            </div>

            {!isParticipant && meeting.status === 'recruiting' && (
              <Button onClick={handleJoin} fullWidth className="mt-6">
                모임 참가하기
              </Button>
            )}

            {meeting.status === 'closed' && (
              <div className="mt-6 p-3 bg-gray-100 text-gray-600 text-center rounded-lg">
                모집이 마감되었습니다
              </div>
            )}

            {meeting.status === 'confirmed' && (
              <div className="mt-6 p-3 bg-green-100 text-green-700 rounded-lg font-medium">
                <div className="flex items-center justify-between">
                  <span className="flex-1 text-center">✅ 모임이 확정되었습니다</span>
                  {(user?.role === 'admin' || meeting.host_id === user?.id) && (
                    <button
                      onClick={handleUnconfirmMeeting}
                      className="text-xs text-green-600 hover:text-green-800 underline ml-2 whitespace-nowrap"
                    >
                      확정 취소
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Meeting host confirm button (only for recruiting status) */}
            {meeting.host_id === user?.id && meeting.status === 'recruiting' && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleConfirmMeeting}
                  fullWidth
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  ✅ 모임장: 모임 확정 (참가 마감)
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  * 확정 후에는 새로운 참가자를 받을 수 없습니다
                </p>
              </div>
            )}

            {/* Admin/Meeting host edit and delete buttons */}
            {(user?.role === 'admin' || meeting.host_id === user?.id) && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <Button
                  onClick={handleEditClick}
                  variant="outline"
                  className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  ✏️ {user?.role === 'admin' ? '관리자' : '모임장'}: 모임 수정
                </Button>
                <Button
                  onClick={handleDeleteMeeting}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  🗑️ {user?.role === 'admin' ? '관리자' : '모임장'}: 모임 삭제
                </Button>
              </div>
            )}
          </Card>

          {/* Chat (only for participants) */}
          {isParticipant && (
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                익명 채팅방
              </h2>
              <div className="h-96 overflow-y-auto mb-4 border rounded-lg p-4 bg-gray-50">
                {chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <p>아직 메시지가 없습니다. 첫 메시지를 보내보세요!</p>
                  </div>
                ) : (
                  <>
                    {chats.map((chat) => {
                      const isHost = chat.user_id === meeting.host_id
                      return (
                        <div
                          key={chat.id}
                          className={`mb-3 ${
                            chat.user_id === user.id ? 'text-right' : 'text-left'
                          }`}
                        >
                          <div
                            className={`inline-block max-w-xs px-4 py-2 rounded-lg ${
                              chat.user_id === user.id
                                ? 'bg-blue-500 text-white'
                                : isHost
                                ? 'bg-yellow-100 text-gray-900 border-2 border-yellow-400'
                                : 'bg-white text-gray-900'
                            }`}
                          >
                            <div className="text-xs mb-1 opacity-75 font-medium">
                              {isHost && '👑 '}
                              {chat.anonymous_name}
                              {isHost && ' (주최자)'}
                            </div>
                            <div>{chat.message}</div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="메시지를 입력하세요"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit">전송</Button>
              </form>
            </Card>
          )}
        </div>

        {/* Participants */}
        <div>
          <Card>
            <h2 className="text-lg font-bold text-gray-900 mb-4">참가자 목록</h2>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-700">
                    {participant.user?.username}
                  </span>
                  {participant.user_id === meeting.host_id && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      호스트
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Meeting Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="모임 수정"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              장소 *
            </label>
            <input
              type="text"
              required
              value={editForm.location}
              onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="예: 강남역 스타벅스"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임장 소개 *
            </label>
            <textarea
              required
              value={editForm.host_introduction}
              onChange={(e) => setEditForm({ ...editForm, host_introduction: e.target.value })}
              placeholder="자기소개를 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 상세 *
            </label>
            <textarea
              required
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="모임에 대해 자유롭게 설명해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 운영 방식 및 스타일
            </label>
            <textarea
              value={editForm.host_style}
              onChange={(e) => setEditForm({ ...editForm, host_style: e.target.value })}
              placeholder="모임 운영 방식이나 스타일을 설명해주세요 (선택사항)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임장 SNS 링크
            </label>
            <input
              type="url"
              value={editForm.host_sns_link}
              onChange={(e) => setEditForm({ ...editForm, host_sns_link: e.target.value })}
              placeholder="https://instagram.com/your-profile (선택사항)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 시간 *
            </label>
            <input
              type="datetime-local"
              required
              value={editForm.start_datetime}
              onChange={(e) => setEditForm({ ...editForm, start_datetime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 시간
            </label>
            <input
              type="datetime-local"
              value={editForm.end_datetime}
              onChange={(e) => setEditForm({ ...editForm, end_datetime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 인원 *
            </label>
            <input
              type="number"
              required
              min="2"
              value={editForm.max_participants}
              onChange={(e) => setEditForm({ ...editForm, max_participants: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              현재 참가 인원: {participants.length}명
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 목적 *
            </label>
            <select
              required
              value={editForm.purpose}
              onChange={(e) => setEditForm({ ...editForm, purpose: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="coffee">☕ 커피</option>
              <option value="alcohol">🍺 술</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditModalOpen(false)}
            >
              취소
            </Button>
            <Button type="submit">
              수정
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default MeetingDetailPage
