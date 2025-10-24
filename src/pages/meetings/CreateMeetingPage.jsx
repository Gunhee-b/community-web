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
    meetingDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: 4,
    purpose: 'coffee',
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

    if (
      !formData.location ||
      !formData.hostIntroduction ||
      !formData.description ||
      !formData.meetingDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError('모든 필수 필드를 입력해주세요')
      return
    }

    const startDatetime = new Date(
      `${formData.meetingDate}T${formData.startTime}:00`
    )
    const endDatetime = new Date(
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

    // Confirmation dialog
    const purposeText = formData.purpose === 'coffee' ? '☕ 커피' : '🍺 술'
    const dateText = new Date(formData.meetingDate).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    const confirmMessage = `다음 내용으로 모임을 생성하시겠습니까?\n\n📍 장소: ${formData.location}\n📅 날짜: ${dateText}\n⏰ 시간: ${formData.startTime} - ${formData.endTime}\n${purposeText}\n👥 최대 인원: ${formData.maxParticipants}명\n\n※ 장소 정보가 정확한지 다시 한번 확인해주세요!`

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

      const { data: meetingData, error: meetingError } = await supabase
        .from('offline_meetings')
        .insert([
          {
            host_id: user.id,
            location: formData.location,
            host_introduction: formData.hostIntroduction,
            description: formData.description,
            start_datetime: startDatetime.toISOString(),
            end_datetime: endDatetime.toISOString(),
            max_participants: parseInt(formData.maxParticipants),
            purpose: formData.purpose,
            image_url: imageUrl,
          },
        ])
        .select('*')
        .single()

      if (meetingError) throw meetingError

      // Auto-join as host
      await supabase.from('meeting_participants').insert([
        {
          meeting_id: meetingData.id,
          user_id: user.id,
        },
      ])

      navigate(`/meetings/${meetingData.id}`)
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
              <li>• D-1일 기준 최소 인원 미달 시 자동 취소됩니다</li>
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
