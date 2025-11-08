import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'
import LocationMapPreview from '../../components/meetings/LocationMapPreview'
import ImageAdjustModal from '../../components/meetings/ImageAdjustModal'
import { getCroppedImg } from '../../utils/imageCrop'

function CreateMeetingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    location: '',
    hostIntroduction: '',
    description: '',
    meetingType: 'casual', // 'regular' or 'casual'
    casualMeetingType: 'hobby', // 'hobby' or 'discussion' (for casual meetings)
    recurrenceDayOfWeek: 1, // 0-6 for Sunday-Saturday (for regular meetings)
    recurrenceTime: '19:00', // HH:MM format (for regular meetings)
    recurrenceEndTime: '21:00', // End time for regular meetings
    meetingDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: 4,
    purpose: 'coffee',
    kakaoOpenchatLink: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)

  // Fixed size and quality
  const imageSize = 1200
  const imageQuality = 85

  // Check if user can create meetings
  const canCreateMeeting = user?.role === 'admin' || user?.role === 'meeting_host'

  // Redirect if user doesn't have permission
  if (!canCreateMeeting) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              권한이 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              모임을 만들려면 '모임장' 또는 '관리자' 권한이 필요합니다.
            </p>
            <Button onClick={() => navigate('/meetings')}>
              모임 목록으로 돌아가기
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드할 수 있습니다')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다')
        return
      }

      setImageFile(file)

      // Create preview and get dimensions
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)

        // Get image dimensions
        const img = new Image()
        img.onload = () => {
          // Suggest optimal size based on image dimensions
          const maxDimension = Math.max(img.width, img.height)
          if (maxDimension > 1200) {
            setImageSize(1200)
          } else if (maxDimension > 800) {
            setImageSize(800)
          } else {
            setImageSize(maxDimension)
          }
        }
        img.src = reader.result
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setCroppedAreaPixels(null)
  }

  const handleImageAdjustConfirm = (cropPixels) => {
    setCroppedAreaPixels(cropPixels)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic field validation
    if (
      !formData.location ||
      !formData.hostIntroduction ||
      !formData.description
    ) {
      setError('모든 필수 필드를 입력해주세요')
      return
    }

    // Validate meeting type specific fields
    if (formData.meetingType === 'casual') {
      if (!formData.meetingDate || !formData.startTime || !formData.endTime) {
        setError('즉흥 모임은 날짜와 시간을 입력해야 합니다')
        return
      }
    }

    // Validate Kakao Open Chat link format (only if provided)
    if (formData.kakaoOpenchatLink && !formData.kakaoOpenchatLink.includes('open.kakao.com')) {
      setError('올바른 카카오톡 오픈채팅 링크를 입력해주세요')
      return
    }

    let startDatetime, endDatetime

    // For casual meetings, validate date/time
    if (formData.meetingType === 'casual') {
      startDatetime = new Date(
        `${formData.meetingDate}T${formData.startTime}:00`
      )
      endDatetime = new Date(
        `${formData.meetingDate}T${formData.endTime}:00`
      )

      if (startDatetime <= new Date()) {
        setError('모임 시작 시간은 현재 시간 이후여야 합니다')
        return
      }

      if (endDatetime <= startDatetime) {
        setError('모임 종료 시간은 시작 시간 이후여야 합니다')
        return
      }
    } else {
      // For regular meetings, create placeholder datetime (will use recurrence info)
      const now = new Date()
      startDatetime = now
      endDatetime = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours later
    }

    // Confirmation dialog
    const purposeText = formData.purpose === 'coffee' ? '☕ 커피' : '🍺 술'
    const meetingTypeText = formData.meetingType === 'regular' ? '📅 정기 모임' : '⚡ 즉흥 모임'
    let detailsText = ''

    if (formData.meetingType === 'regular') {
      const daysOfWeek = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
      const casualTypeText = formData.casualMeetingType === 'hobby' ? '🎨 취미' : '💬 토론'
      detailsText = `${meetingTypeText}\n유형: ${casualTypeText}\n📅 매주 ${daysOfWeek[formData.recurrenceDayOfWeek]}\n⏰ ${formData.recurrenceTime}`
    } else {
      const dateText = new Date(formData.meetingDate).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      const casualTypeText = formData.casualMeetingType === 'hobby' ? '🎨 취미' : '💬 토론'
      detailsText = `${meetingTypeText}\n유형: ${casualTypeText}\n📅 날짜: ${dateText}\n⏰ 시간: ${formData.startTime} - ${formData.endTime}`
    }

    const confirmMessage = `다음 내용으로 모임을 생성하시겠습니까?\n\n📍 장소: ${formData.location}\n${detailsText}\n${purposeText}\n👥 최대 인원: ${formData.maxParticipants}명\n\n※ 장소 정보가 정확한지 다시 한번 확인해주세요!`

    if (!window.confirm(confirmMessage)) {
      return
    }

    setLoading(true)

    try {
      let imageUrl = null

      // Upload image to Supabase Storage if provided
      if (imageFile && imagePreview) {
        let croppedBlob

        // If crop data exists, use it. Otherwise, use original image with resize only
        if (croppedAreaPixels) {
          croppedBlob = await getCroppedImg(
            imagePreview,
            croppedAreaPixels,
            imageSize,
            imageSize,
            imageQuality / 100
          )
        } else {
          // No crop data - convert original image to blob with resize
          const response = await fetch(imagePreview)
          const blob = await response.blob()

          // Create a simple resize without crop
          const img = new Image()
          img.src = imagePreview
          await new Promise((resolve) => { img.onload = resolve })

          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Maintain aspect ratio
          if (width > imageSize || height > imageSize) {
            if (width > height) {
              height = (height * imageSize) / width
              width = imageSize
            } else {
              width = (width * imageSize) / height
              height = imageSize
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          croppedBlob = await new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', imageQuality / 100)
          })
        }

        const fileExt = 'jpg' // Always use jpg for cropped images
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('meeting-images')
          .upload(filePath, croppedBlob, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/jpeg'
          })

        if (uploadError) {
          console.error('Error uploading image:', uploadError)
          throw new Error('이미지 업로드 중 오류가 발생했습니다')
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('meeting-images')
          .getPublicUrl(filePath)

        imageUrl = publicUrl
      }

      // Prepare meeting data based on meeting type
      const meetingData = {
        host_id: user.id,
        location: formData.location,
        host_introduction: formData.hostIntroduction,
        description: formData.description,
        kakao_openchat_link: formData.kakaoOpenchatLink,
        start_datetime: startDatetime.toISOString(),
        end_datetime: endDatetime.toISOString(),
        max_participants: parseInt(formData.maxParticipants),
        purpose: formData.purpose,
        image_url: imageUrl,
        meeting_type: formData.meetingType,
      }

      // Add type-specific fields
      if (formData.meetingType === 'regular') {
        meetingData.recurrence_day_of_week = parseInt(formData.recurrenceDayOfWeek)
        meetingData.recurrence_time = formData.recurrenceTime
        meetingData.recurrence_end_time = formData.recurrenceEndTime
        // Mark regular meetings as templates
        meetingData.is_template = true
      } else {
        meetingData.casual_meeting_type = formData.casualMeetingType
        meetingData.is_template = false
      }

      const { data: insertedMeeting, error: meetingError } = await supabase
        .from('offline_meetings')
        .insert([meetingData])
        .select('*')
        .single()

      if (meetingError) throw meetingError

      // For regular meetings (templates), generate the first week's meeting
      if (formData.meetingType === 'regular') {
        try {
          const { data: firstWeekMeeting, error: generateError } = await supabase
            .rpc('generate_meeting_from_template', {
              p_template_id: insertedMeeting.id,
              p_week_number: 1
            })

          if (generateError) {
            console.error('Error generating first week meeting:', generateError)
            throw new Error('첫 주차 모임 생성 중 오류가 발생했습니다')
          }

          // Auto-join host as participant in the first week's meeting
          if (firstWeekMeeting) {
            await supabase.from('meeting_participants').insert([
              {
                meeting_id: firstWeekMeeting,
                user_id: user.id,
              },
            ])

            // Navigate to the first week's meeting (not the template)
            navigate(`/meetings/${firstWeekMeeting}`)
            return
          }
        } catch (err) {
          console.error('Error generating first week:', err)
          // Fall through to template navigation if generation fails
        }
      } else {
        // Auto-join as host for casual meetings
        await supabase.from('meeting_participants').insert([
          {
            meeting_id: insertedMeeting.id,
            user_id: user.id,
          },
        ])
      }

      navigate(`/meetings/${insertedMeeting.id}`)
    } catch (err) {
      console.error('Error creating meeting:', err)
      setError(err.message || '모임 생성 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">모임 만들기</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="모임 장소"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="예: 강남역 스타벅스"
            required
          />

          {/* Naver Map Preview */}
          <LocationMapPreview location={formData.location} />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임장 소개 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="hostIntroduction"
              value={formData.hostIntroduction}
              onChange={handleChange}
              placeholder="자기소개를 입력해주세요 (예: 안녕하세요! 20대 후반 직장인입니다)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 상세 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="모임에 대해 자유롭게 설명해주세요 (예: 편하게 커피 마시며 이야기 나누는 자리입니다)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카카오톡 오픈채팅 링크 (선택사항)
            </label>
            <input
              type="url"
              name="kakaoOpenchatLink"
              value={formData.kakaoOpenchatLink}
              onChange={handleChange}
              placeholder="https://open.kakao.com/o/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              외부 카카오톡 오픈채팅방을 사용하려면 링크를 입력해주세요. 비워두면 앱 내 채팅만 사용합니다.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 사진 (선택사항)
            </label>
            <div className="mt-1">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="미리보기"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
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
                      <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF (최대 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>

            {/* Image adjustment button - only show when image is selected */}
            {imagePreview && (
              <div className="mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  fullWidth
                  onClick={() => setIsImageModalOpen(true)}
                >
                  🔧 이미지 크기 조정
                </Button>
              </div>
            )}
          </div>

          {/* Meeting Type Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              모임 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.meetingType === 'casual'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="meetingType"
                  value="casual"
                  checked={formData.meetingType === 'casual'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="font-medium">⚡ 즉흥 모임</span>
              </label>
              <label className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                formData.meetingType === 'regular'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  name="meetingType"
                  value="regular"
                  checked={formData.meetingType === 'regular'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="font-medium">📅 정기 모임</span>
              </label>
            </div>

            {/* Casual Meeting Type Selection (only for casual meetings) */}
            {formData.meetingType === 'casual' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  즉흥 모임 세부 유형 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.casualMeetingType === 'hobby'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="casualMeetingType"
                      value="hobby"
                      checked={formData.casualMeetingType === 'hobby'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-medium">🎨 취미 모임</span>
                  </label>
                  <label className={`flex items-center justify-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.casualMeetingType === 'discussion'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="casualMeetingType"
                      value="discussion"
                      checked={formData.casualMeetingType === 'discussion'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-medium">💬 토론 모임</span>
                  </label>
                </div>
              </div>
            )}

            {/* Regular Meeting Recurrence (only for regular meetings) */}
            {formData.meetingType === 'regular' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    매주 반복 요일 <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="recurrenceDayOfWeek"
                    value={formData.recurrenceDayOfWeek}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0}>일요일</option>
                    <option value={1}>월요일</option>
                    <option value={2}>화요일</option>
                    <option value={3}>수요일</option>
                    <option value={4}>목요일</option>
                    <option value={5}>금요일</option>
                    <option value={6}>토요일</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정기 모임 시작 시간 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="recurrenceTime"
                    value={formData.recurrenceTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    매주 정해진 시작 시간
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    정기 모임 종료 시간 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    name="recurrenceEndTime"
                    value={formData.recurrenceEndTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    매주 정해진 종료 시간
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Date and Time (only for casual meetings) */}
          {formData.meetingType === 'casual' && (
            <>
              <Input
                label="날짜"
                name="meetingDate"
                type="date"
                value={formData.meetingDate}
                onChange={handleChange}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="시작 시간"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="종료 시간"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              모임 목적 <span className="text-red-500">*</span>
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="purpose"
                  value="coffee"
                  checked={formData.purpose === 'coffee'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>☕ 커피</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="purpose"
                  value="alcohol"
                  checked={formData.purpose === 'alcohol'}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span>🍺 술</span>
              </label>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 인원 <span className="text-red-500">*</span>
            </label>
            <select
              name="maxParticipants"
              value={formData.maxParticipants}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  {num}명
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">모임 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 모임을 만들면 자동으로 참가자로 등록됩니다</li>
              <li>• 익명 채팅방이 자동으로 생성됩니다</li>
              {formData.meetingType === 'casual' ? (
                <li>• D-1일 기준 최소 인원 미달 시 자동 취소됩니다</li>
              ) : (
                <li>• 정기 모임은 매주 지정된 요일과 시간에 진행됩니다</li>
              )}
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/meetings')}
            >
              취소
            </Button>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? '생성 중...' : '모임 만들기'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Image Adjustment Modal */}
      <ImageAdjustModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        imagePreview={imagePreview}
        onConfirm={handleImageAdjustConfirm}
      />
    </div>
  )
}

export default CreateMeetingPage
