import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'
import LocationMapPreview from '../../components/meetings/LocationMapPreview'

function CreateMeetingPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    location: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    maxParticipants: 4,
    purpose: 'coffee',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      !formData.location ||
      !formData.meetingDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      setError('모든 필드를 입력해주세요')
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
      const { data: meetingData, error: meetingError } = await supabase
        .from('offline_meetings')
        .insert([
          {
            host_id: user.id,
            location: formData.location,
            start_datetime: startDatetime.toISOString(),
            end_datetime: endDatetime.toISOString(),
            max_participants: parseInt(formData.maxParticipants),
            purpose: formData.purpose,
          },
        ])
        .select()
        .maybeSingle()

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
      setError('모임 생성 중 오류가 발생했습니다')
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
    </div>
  )
}

export default CreateMeetingPage
