import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { formatDate, getDday, toLocalDateTimeString } from '../../utils/date'
import { formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import { getCroppedImg } from '../../utils/imageCrop'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'
import LocationMapPreview from '../../components/meetings/LocationMapPreview'
import ImageAdjustModal from '../../components/meetings/ImageAdjustModal'
import { useMeetingChat } from '../../hooks/useMeetingChat'
import { useMeetingParticipants } from '../../hooks/useMeetingParticipants'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useModal } from '../../hooks/useModal'
import { useToast } from '../../hooks/useToast'

function MeetingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const toast = useToast()

  const [meeting, setMeeting] = useState(null)
  const [participants, setParticipants] = useState([])
  const [isParticipant, setIsParticipant] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showAttendanceCheck, setShowAttendanceCheck] = useState(false)

  // Check if user is logged in
  const isLoggedIn = !!user

  // Check if meeting has ended (using meeting_datetime since end_datetime removed)
  const hasMeetingEnded = meeting ? new Date(meeting.meeting_datetime) < new Date() : false

  // Check if user is the host
  const isHost = isLoggedIn && meeting && user.id === meeting.host_id

  // Edit modal state
  const { isOpen: editModalOpen, open: openEditModal, close: closeEditModal } = useModal(false)
  const { isOpen: isEditImageModalOpen, open: openEditImageModal, close: closeEditImageModal } = useModal(false)
  // Updated editForm to match new schema columns
  const [editForm, setEditForm] = useState({
    title: '',
    location: '',
    location_detail: '',
    description: '',
    kakao_openchat_link: '',
    meeting_datetime: '',
    max_participants: '',
    purpose: 'coffee'
  })

  // Image upload hook for edit modal
  const {
    imageFile: editImageFile,
    imagePreview: editImagePreview,
    uploading: editImageUploading,
    error: editImageError,
    handleImageSelect: handleEditImageSelect,
    removeImage: removeEditImage,
    uploadImage: uploadEditImage,
    reset: resetEditImage,
  } = useImageUpload({ bucket: 'meeting-images', maxSize: 5 * 1024 * 1024 })

  const [editCroppedAreaPixels, setEditCroppedAreaPixels] = useState(null)
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false) // Track if user wants to delete image

  // Fixed size and quality
  const editImageSize = 1200
  const editImageQuality = 85

  // Fetch meeting data - memoized to prevent infinite loops
  const fetchMeetingData = useCallback(async () => {
    try {
      // Fetch meeting details (changed from 'offline_meetings' to 'meetings')
      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*, host:profiles(username)')
        .eq('id', id)
        .single()

      if (meetingError) {
        console.error('Error fetching meeting:', meetingError)
      }

      setMeeting(meetingData)

      // Fetch participants (changed user:users to user:profiles)
      const { data: participantsData, error: participantsError } = await supabase
        .from('meeting_participants')
        .select('*, user:profiles(username)')
        .eq('meeting_id', id)
        .is('cancelled_at', null)

      if (participantsError) {
        console.error('Error fetching participants:', participantsError)
      }

      // Only check participant status if user is logged in
      if (isLoggedIn) {
        const isUserParticipant = participantsData?.some((p) => p.user_id === user?.id) || false

        setParticipants(participantsData || [])
        setIsParticipant(isUserParticipant)
      } else {
        setParticipants(participantsData || [])
        setIsParticipant(false)
      }
    } catch (error) {
      console.error('Error fetching meeting:', error)
    } finally {
      setLoading(false)
    }
  }, [id, isLoggedIn, user?.id])

  // Refetch meeting data function for refetching (memoized)
  const refetchMeetingData = useCallback(async () => {
    await fetchMeetingData()
  }, [fetchMeetingData])

  // Use custom hooks for chat and participants
  const {
    chats,
    newMessage,
    setNewMessage,
    sending,
    sendMessage,
    typingUsers,
    readReceipts,
    handleTyping,
    markMessagesAsRead,
    uploadingImage
  } = useMeetingChat(id, user, isParticipant)

  // Chat UI state
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const chatContainerRef = useRef(null)
  const fileInputRef = useRef(null)

  const { joinMeeting, confirmMeeting, unconfirmMeeting, leaveMeeting, markAttendance } =
    useMeetingParticipants(id, meeting, participants, user, refetchMeetingData)

  useEffect(() => {
    fetchMeetingData()

    // Listen for localStorage events for cross-tab notifications
    const handleStorageEvent = (e) => {
      if (e.key === 'temp_meeting_notification') {
        const notificationData = JSON.parse(e.newValue)
        if (notificationData && notificationData.hostId === user?.id) {
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
      window.removeEventListener('storage', handleStorageEvent)
    }
  }, [id, user?.id, addNotification])

  const handleJoin = async () => {
    const result = await joinMeeting()

    if (result.redirectToLogin) {
      navigate('/login')
      return
    }

    // Redirect to Kakao Open Chat if link exists
    if (result.success && result.kakaoOpenchatLink) {
      window.open(result.kakaoOpenchatLink, '_blank')
    }
  }

  const handleConfirmMeeting = async () => {
    if (!window.confirm('모임을 확정하시겠습니까? 확정 후에는 더 이상 새로운 참가자를 받을 수 없습니다.')) {
      return
    }
    await confirmMeeting()
  }

  const handleUnconfirmMeeting = async () => {
    if (!window.confirm('모임 확정을 취소하시겠습니까? 취소하면 다시 새로운 참가자를 받을 수 있습니다.')) {
      return
    }
    await unconfirmMeeting()
  }

  const handleLeaveMeeting = async () => {
    if (!window.confirm('정말로 이 모임에서 나가시겠습니까?\n모임에서 나가면 채팅 기록도 사라집니다.')) {
      return
    }
    const result = await leaveMeeting()
    if (result.success) {
      navigate('/meetings')
    }
  }

  const handleEditImageChange = (e) => {
    handleEditImageSelect(e)
    setShouldDeleteImage(false) // Reset delete flag when new image is selected
  }

  const handleEditImageAdjustConfirm = (cropPixels) => {
    setEditCroppedAreaPixels(cropPixels)
  }

  const handleEditClick = () => {
    if (!meeting) return

    // Format datetime for input (YYYY-MM-DDTHH:mm) using local timezone
    // Updated to match new schema columns
    setEditForm({
      title: meeting.title || '',
      location: meeting.location,
      location_detail: meeting.location_detail || '',
      description: meeting.description || '',
      kakao_openchat_link: meeting.kakao_openchat_link || '',
      meeting_datetime: toLocalDateTimeString(meeting.meeting_datetime),
      max_participants: meeting.max_participants.toString(),
      purpose: meeting.purpose
    })

    // Reset image state for edit modal
    resetEditImage()
    setShouldDeleteImage(false) // Reset delete flag when opening modal
    // Note: We'll handle existing image preview in the modal render

    openEditModal()
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()

    try {
      // Convert datetime-local string to ISO format (UTC)
      const meetingDatetimeISO = new Date(editForm.meeting_datetime).toISOString()

      let imageUrl = meeting.image_url // Keep existing image URL by default

      // Upload new image if provided
      if (editImageFile && editImagePreview) {
        let croppedBlob

        // If crop data exists, use it. Otherwise, use original image with resize only
        if (editCroppedAreaPixels) {
          croppedBlob = await getCroppedImg(
            editImagePreview,
            editCroppedAreaPixels,
            editImageSize,
            editImageSize,
            editImageQuality / 100
          )
        } else {
          console.log('Using original image without crop for edit')

          // Create a simple resize without crop
          const img = new Image()
          img.src = editImagePreview

          // Wait for image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve
            img.onerror = reject
          })

          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          console.log('Original image dimensions:', width, 'x', height)

          // Maintain aspect ratio
          if (width > editImageSize || height > editImageSize) {
            if (width > height) {
              height = (height * editImageSize) / width
              width = editImageSize
            } else {
              width = (width * editImageSize) / height
              height = editImageSize
            }
          }

          // Round to integers to avoid canvas rendering issues
          width = Math.floor(width)
          height = Math.floor(height)

          console.log('Resized image dimensions:', width, 'x', height)

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // Convert canvas to DataURL then to Blob
          const dataUrl = canvas.toDataURL('image/jpeg', editImageQuality / 100)

          // Convert DataURL to Blob
          const response = await fetch(dataUrl)
          croppedBlob = await response.blob()

          console.log('Edit: Canvas to blob conversion complete')
        }

        console.log('Edit: Blob created, size:', croppedBlob?.size, 'bytes, type:', croppedBlob?.type)

        if (!croppedBlob || croppedBlob.size === 0) {
          throw new Error('이미지 처리 중 오류가 발생했습니다 (빈 파일)')
        }

        const fileExt = 'jpg' // Always use jpg for cropped images
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        console.log('Edit: Attempting to upload to Supabase Storage...')
        console.log('Edit: Blob size:', croppedBlob.size, 'bytes')

        // Convert Blob to File for better compatibility
        const file = new File([croppedBlob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now()
        })

        console.log('Edit: Converted to File:', file.name, file.size, 'bytes')

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('meeting-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          })

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          throw new Error('이미지 업로드 중 오류가 발생했습니다: ' + uploadError.message)
        }

        console.log('Upload successful, file path:', uploadData?.path || filePath)

        // Get public URL
        const { data } = supabase.storage
          .from('meeting-images')
          .getPublicUrl(filePath)

        imageUrl = data.publicUrl
        console.log('Generated public URL:', imageUrl)

        // Verify the URL is valid
        if (!imageUrl || !imageUrl.includes('meeting-images')) {
          console.error('Invalid public URL generated:', imageUrl)
          throw new Error('이미지 URL 생성에 실패했습니다')
        }

        // Delete old image if exists
        if (meeting.image_url) {
          const oldImagePath = meeting.image_url.split('/').pop()
          await supabase.storage
            .from('meeting-images')
            .remove([oldImagePath])
        }
      } else if (shouldDeleteImage && meeting.image_url) {
        // If user explicitly deleted the image
        const oldImagePath = meeting.image_url.split('/').pop()
        await supabase.storage
          .from('meeting-images')
          .remove([oldImagePath])
        imageUrl = null
        console.log('Old image deleted from storage')
      }

      console.log('Updating meeting with:', {
        title: editForm.title,
        location: editForm.location,
        location_detail: editForm.location_detail,
        meeting_datetime: meetingDatetimeISO,
        max_participants: parseInt(editForm.max_participants),
        purpose: editForm.purpose,
        image_url: imageUrl
      })

      // Update meeting with new schema columns
      const { data, error } = await supabase
        .from('meetings')
        .update({
          title: editForm.title || editForm.location,
          location: editForm.location,
          location_detail: editForm.location_detail || null,
          description: editForm.description || null,
          kakao_openchat_link: editForm.kakao_openchat_link || null,
          meeting_datetime: meetingDatetimeISO,
          max_participants: parseInt(editForm.max_participants),
          purpose: editForm.purpose,
          image_url: imageUrl
        })
        .eq('id', id)
        .select('*, host:profiles(username)')

      console.log('Update result:', { data, error })

      if (error) throw error

      toast.success('모임 정보가 수정되었습니다')
      closeEditModal()

      // Fetch updated data to ensure UI is refreshed with latest info
      await fetchMeetingData()
    } catch (error) {
      console.error('Error updating meeting:', error)
      toast.error(error.message || '모임 수정 중 오류가 발생했습니다')
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

      // Step 3: Now safe to delete the meeting (changed from 'offline_meetings' to 'meetings')
      const { data: deletedMeeting, error: meetingError } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id)
        .select()

      if (meetingError) {
        console.error('Error deleting meeting:', meetingError)
        throw new Error(`모임 삭제 실패: ${meetingError.message}`)
      }
      console.log('Meeting deleted successfully:', deletedMeeting)

      toast.success('모임이 성공적으로 삭제되었습니다')
      navigate('/meetings')
    } catch (error) {
      console.error('Error deleting meeting:', error)
      toast.error(error.message || '모임 삭제 중 오류가 발생했습니다')
    }
  }

  const handleAttendanceMark = async (participantId, attendanceStatus) => {
    try {
      const { data, error } = await supabase.rpc('mark_attendance', {
        p_participant_id: participantId,
        p_host_id: user.id,
      })

      if (error) throw error

      if (!data.success) {
        throw new Error(data.error || '참석 체크 중 오류가 발생했습니다')
      }

      toast.success(data.attended ? '참석 처리되었습니다' : '출석이 취소되었습니다')
      await refetchMeetingData()
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error(error.message || '참석 체크 중 오류가 발생했습니다')
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chats])

  // Mark messages as read when viewing chat
  useEffect(() => {
    if (isParticipant && chats.length > 0) {
      // Debounce marking as read
      const timeoutId = setTimeout(() => {
        markMessagesAsRead()
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [chats.length, isParticipant, markMessagesAsRead]) // Use chats.length to avoid re-running on every message change

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !selectedImage) return

    await sendMessage(newMessage, selectedImage)
    handleRemoveImage()
  }

  const handleMessageInputChange = (e) => {
    setNewMessage(e.target.value)
    handleTyping()
  }

  // Group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {}
    messages.forEach(chat => {
      const date = new Date(chat.created_at).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(chat)
    })
    return groups
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
            {/* Meeting Image */}
            {meeting.image_url && (
              <img
                src={meeting.image_url}
                alt={meeting.location}
                className="w-full h-64 object-cover rounded-lg mb-4"
                onError={(e) => {
                  console.error('Failed to load meeting image:', meeting.image_url)
                  e.target.style.display = 'none'
                }}
                onLoad={() => {
                  console.log('Meeting image loaded successfully:', meeting.image_url)
                }}
              />
            )}

            {/* Meeting Badges */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              {/* Meeting Type Badge */}
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  meeting.meeting_type === 'regular'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {meeting.meeting_type === 'regular' ? '📅 정기 모임' : '⚡ 즉흥 모임'}
              </span>

              {/* Casual Meeting Subtype Badge */}
              {meeting.meeting_type === 'casual' && meeting.casual_meeting_type && (
                <span
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    meeting.casual_meeting_type === 'hobby'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {meeting.casual_meeting_type === 'hobby' ? '🎨 취미 모임' : '💬 토론 모임'}
                </span>
              )}

              {/* Purpose Badge */}
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                  meeting.purpose === 'coffee'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {meeting.purpose === 'coffee' ? '☕ 커피' : '🍺 술'}
              </span>

              {/* D-day (only for casual meetings) */}
              {meeting.meeting_type === 'casual' && (
                <span className="ml-auto text-lg font-bold text-blue-600">
                  {getDday(meeting.start_datetime)}
                </span>
              )}
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

            {meeting.kakao_openchat_link && (
              <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-1">💬 카카오톡 오픈채팅</h3>
                <a
                  href={meeting.kakao_openchat_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all font-medium"
                >
                  오픈채팅방 입장하기 →
                </a>
                <p className="text-xs text-gray-500 mt-1">
                  모임 참가 후 오픈채팅방에 입장해주세요
                </p>
              </div>
            )}

            <div className="space-y-2 text-gray-600 mb-4">
              {/* DateTime - Different display for regular vs casual meetings */}
              <p>
                {meeting.meeting_type === 'regular' ? (
                  <>
                    📅 <span className="font-medium">매주{' '}
                    {['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][meeting.recurrence_day_of_week]}
                    </span>
                    {' '}⏰ {meeting.recurrence_time}
                  </>
                ) : (
                  <>
                    📅 {formatDate(meeting.start_datetime, 'yyyy년 MM월 dd일 HH:mm')}
                    {' - '}
                    {formatDate(meeting.end_datetime, 'HH:mm')}
                  </>
                )}
              </p>
              <p>👤 호스트: {meeting.host?.username}</p>
              <p>
                👥 참여 인원: {participants.length} / {meeting.max_participants}명
              </p>
            </div>

            {/* 로그인하지 않은 사용자에게 로그인 버튼 표시 */}
            {!isLoggedIn && meeting.status === 'recruiting' && (
              <div className="mt-6">
                <p className="text-center text-gray-600 mb-3">
                  모임에 참가하려면 로그인이 필요합니다
                </p>
                <Button onClick={() => navigate('/login')} fullWidth>
                  로그인하고 참가하기
                </Button>
              </div>
            )}

            {/* 로그인했지만 참가하지 않은 사용자에게 참가 버튼 표시 */}
            {isLoggedIn && !isParticipant && meeting.status === 'recruiting' && (
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

            {/* Admin/Meeting host edit and delete buttons (only for logged in users) */}
            {isLoggedIn && (user.role === 'admin' || meeting.host_id === user.id) && (
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

          {/* Chat (only for logged in participants) */}
          {isLoggedIn && isParticipant && (
            <Card className="flex flex-col h-[600px]">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>💬 모임 채팅방</span>
                <span className="text-sm font-normal text-gray-500">
                  {participants.length}명 참여중
                </span>
              </h2>

              {/* Chat messages container */}
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto mb-4 p-4 bg-gradient-to-b from-blue-50 to-gray-50 rounded-lg space-y-1"
              >
                {chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <p className="text-lg mb-2">💬</p>
                      <p>아직 메시지가 없습니다.</p>
                      <p className="text-sm">첫 메시지를 보내보세요!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {Object.entries(groupMessagesByDate(chats)).map(([date, messages]) => (
                      <div key={date}>
                        {/* Date separator */}
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-600 bg-opacity-70 text-white text-xs px-3 py-1 rounded-full">
                            {date}
                          </div>
                        </div>

                        {/* Messages for this date */}
                        {messages.map((chat, index) => {
                          const isHost = chat.user_id === meeting.host_id
                          const isOwnMessage = chat.user_id === user.id
                          const showUsername = index === 0 || messages[index - 1].user_id !== chat.user_id
                          const readCount = readReceipts[chat.id]?.filter(userId => userId !== chat.user_id).length || 0
                          const totalParticipants = participants.length
                          const unreadCount = !isOwnMessage ? 0 : Math.max(0, totalParticipants - readCount - 1)

                          return (
                            <div
                              key={chat.id}
                              className={`mb-2 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[70%] gap-2`}>
                                {/* Message bubble */}
                                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                                  {/* Username (only for others' messages and when sender changes) */}
                                  {!isOwnMessage && showUsername && (
                                    <div className="text-xs font-medium text-gray-700 mb-1 px-1 flex items-center gap-1">
                                      {isHost && <span className="text-yellow-500">👑</span>}
                                      {chat.user?.username || chat.anonymous_name}
                                    </div>
                                  )}

                                  <div
                                    className={`px-4 py-2 rounded-2xl break-words ${
                                      isOwnMessage
                                        ? 'bg-yellow-300 text-gray-900 rounded-br-md'
                                        : isHost
                                        ? 'bg-white text-gray-900 border-2 border-yellow-300 rounded-bl-md'
                                        : 'bg-white text-gray-900 rounded-bl-md'
                                    } shadow-sm`}
                                  >
                                    {/* Image if present */}
                                    {chat.image_url && (
                                      <img
                                        src={chat.image_url}
                                        alt="첨부 이미지"
                                        className="max-w-full rounded-lg mb-2 cursor-pointer hover:opacity-90"
                                        onClick={() => window.open(chat.image_url, '_blank')}
                                      />
                                    )}

                                    {/* Message text */}
                                    {chat.message && chat.message !== '(사진)' && (
                                      <div className="whitespace-pre-wrap">{chat.message}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Time and read count */}
                                <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} justify-end pb-1`}>
                                  <div className="text-xs text-gray-500 whitespace-nowrap">
                                    {new Date(chat.created_at).toLocaleTimeString('ko-KR', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: true
                                    })}
                                  </div>
                                  {isOwnMessage && unreadCount > 0 && (
                                    <div className="text-xs font-semibold text-yellow-600">
                                      {unreadCount}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 text-gray-500 text-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span>{typingUsers.map(u => u.username).join(', ')}님이 입력 중...</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="mb-2 p-2 bg-gray-100 rounded-lg relative">
                  <img src={imagePreview} alt="미리보기" className="h-20 rounded" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                {/* Image upload button */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  title="이미지 첨부"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Text input */}
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleMessageInputChange}
                  placeholder="메시지를 입력하세요..."
                  disabled={sending || uploadingImage}
                  className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-full focus:outline-none focus:border-yellow-400 transition-colors"
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={sending || uploadingImage || (!newMessage.trim() && !selectedImage)}
                  className={`p-3 rounded-full transition-all ${
                    (!newMessage.trim() && !selectedImage) || sending || uploadingImage
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 active:scale-95'
                  }`}
                  title="전송"
                >
                  {sending || uploadingImage ? (
                    <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  )}
                </button>
              </form>
            </Card>
          )}
        </div>

        {/* Participants */}
        <div>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">참가자 목록</h2>
              {/* Attendance check toggle for host after meeting ends */}
              {isHost && hasMeetingEnded && (
                <button
                  onClick={() => setShowAttendanceCheck(!showAttendanceCheck)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    showAttendanceCheck
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  {showAttendanceCheck ? '✓ 참석 체크 중' : '📝 참석 체크'}
                </button>
              )}
            </div>

            {/* Show attendance info for host */}
            {isHost && hasMeetingEnded && showAttendanceCheck && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-medium mb-1">참석 체크 안내</p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• 실제로 참석/불참한 참가자를 체크해주세요</li>
                  <li>• 참석 체크 시 '모임 참여' 횟수가 증가합니다</li>
                  <li>• 불참 체크 시 '모임 참여' 횟수가 감소합니다</li>
                  <li>• 변경이 필요한 경우 다시 버튼을 클릭하여 수정할 수 있습니다</li>
                </ul>
              </div>
            )}

            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg gap-2"
                >
                  {/* User info */}
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 font-medium">
                      {participant.user?.username}
                    </span>
                    {participant.user_id === meeting.host_id && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        호스트
                      </span>
                    )}
                  </div>

                  {/* Attendance status/buttons */}
                  <div className="flex items-center gap-2">
                    {/* Show attendance status */}
                    {hasMeetingEnded && participant.attended !== null && !showAttendanceCheck && (
                      <span
                        className={`text-xs sm:text-sm px-3 py-1.5 rounded-lg font-medium ${
                          participant.attended
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {participant.attended ? '✓ 참석' : '✗ 불참'}
                      </span>
                    )}

                    {/* Attendance check buttons (only for host, after meeting ends, not for host themselves) */}
                    {isHost && hasMeetingEnded && showAttendanceCheck && participant.user_id !== meeting.host_id && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleAttendanceMark(participant.user_id, true)}
                          className={`flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                            participant.attended === true
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 active:bg-green-300 border border-green-300'
                          }`}
                        >
                          {participant.attended === true ? '✓ 참석됨' : '참석'}
                        </button>
                        <button
                          onClick={() => handleAttendanceMark(participant.user_id, false)}
                          className={`flex-1 sm:flex-none text-xs sm:text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
                            participant.attended === false
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-red-100 text-red-700 hover:bg-red-200 active:bg-red-300 border border-red-300'
                          }`}
                        >
                          {participant.attended === false ? '✗ 불참됨' : '불참'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Meeting Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={closeEditModal}
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
              카카오톡 오픈채팅 링크
            </label>
            <input
              type="url"
              value={editForm.kakao_openchat_link}
              onChange={(e) => setEditForm({ ...editForm, kakao_openchat_link: e.target.value })}
              placeholder="https://open.kakao.com/o/... (선택사항)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              모임 참가자들이 입장할 카카오톡 오픈채팅방 링크
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 사진 (선택사항)
            </label>
            <div className="mt-1">
              {/* Show image only if there's a new preview OR (existing image exists AND not marked for deletion) */}
              {editImagePreview || (meeting.image_url && !shouldDeleteImage) ? (
                <div className="relative">
                  <img
                    src={editImagePreview || meeting.image_url}
                    alt="미리보기"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Delete image button clicked')
                      console.log('Current state - editImagePreview:', !!editImagePreview, 'editImageFile:', !!editImageFile, 'shouldDeleteImage:', shouldDeleteImage, 'meeting.image_url:', !!meeting.image_url)

                      if (editImagePreview) {
                        // If there's a new image selected, just remove the preview
                        console.log('Removing newly selected image preview')
                        removeEditImage()
                      }

                      if (meeting.image_url && !editImagePreview) {
                        // If showing existing image (not a new preview), mark for deletion
                        console.log('Marking existing image for deletion')
                        setShouldDeleteImage(true)
                      }

                      console.log('After - shouldDeleteImage:', true)
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">클릭하여 업로드</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                </label>
              )}
            </div>

            {/* Image adjustment button - only show when new image is selected */}
            {editImageFile && editImagePreview && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={openEditImageModal}
                >
                  🔧 이미지 크기 조정
                </Button>
              </div>
            )}
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
              onClick={closeEditModal}
            >
              취소
            </Button>
            <Button type="submit">
              수정
            </Button>
          </div>
        </form>
      </Modal>

      {/* Image Adjustment Modal for Edit */}
      <ImageAdjustModal
        isOpen={isEditImageModalOpen}
        onClose={closeEditImageModal}
        imagePreview={editImagePreview}
        onConfirm={handleEditImageAdjustConfirm}
      />
    </div>
  )
}

export default MeetingDetailPage
