import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { formatDate, getDday } from '../../utils/date'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import { useAuthStore } from '../../store/authStore'

function AdminMeetingsPage() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, upcoming, past
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    fetchMeetings()
  }, [filter])

  const fetchMeetings = async () => {
    try {
      // Changed from 'offline_meetings' to 'meetings', host:users to host:profiles
      // Fix: changed (count) to (id) - count doesn't exist in new schema
      let query = supabase
        .from('meetings')
        .select(`
          *,
          host:profiles(username),
          participants:meeting_participants(id)
        `)

      if (filter === 'upcoming') {
        query = query.gte('meeting_datetime', new Date().toISOString())
      } else if (filter === 'past') {
        query = query.lt('meeting_datetime', new Date().toISOString())
      }

      const { data, error } = await query.order('meeting_datetime', { ascending: false })

      if (error) throw error

      setMeetings(data || [])
    } catch (error) {
      console.error('Error fetching meetings:', error)
      alert('모임 목록을 불러오는 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (meeting) => {
    setSelectedMeeting(meeting)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedMeeting) return

    try {
      // Delete chats first
      const { error: chatsError } = await supabase
        .from('meeting_chats')
        .delete()
        .eq('meeting_id', selectedMeeting.id)

      if (chatsError) throw chatsError

      // Delete participants
      const { error: participantsError } = await supabase
        .from('meeting_participants')
        .delete()
        .eq('meeting_id', selectedMeeting.id)

      if (participantsError) throw participantsError

      // Delete meeting (changed from 'offline_meetings' to 'meetings')
      const { error: meetingError } = await supabase
        .from('meetings')
        .delete()
        .eq('id', selectedMeeting.id)

      if (meetingError) throw meetingError

      alert('모임이 삭제되었습니다')
      setDeleteModalOpen(false)
      setSelectedMeeting(null)
      fetchMeetings()
    } catch (error) {
      console.error('Error deleting meeting:', error)
      alert(error.message || '모임 삭제 중 오류가 발생했습니다')
    }
  }

  const getStatusBadge = (meeting) => {
    const now = new Date()
    const startDate = new Date(meeting.meeting_datetime)

    if (meeting.status === 'closed') {
      return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">모집 마감</span>
    }

    if (startDate < now) {
      return <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">종료됨</span>
    }

    return <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-700">모집 중</span>
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">모임 관리</h1>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          전체
        </button>
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          예정된 모임
        </button>
        <button
          onClick={() => setFilter('past')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'past'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          지난 모임
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">모임명</th>
                <th className="text-left py-3 px-4">호스트</th>
                <th className="text-left py-3 px-4">일시</th>
                <th className="text-left py-3 px-4">참가 인원</th>
                <th className="text-left py-3 px-4">목적</th>
                <th className="text-left py-3 px-4">상태</th>
                <th className="text-left py-3 px-4">작업</th>
              </tr>
            </thead>
            <tbody>
              {meetings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    모임이 없습니다
                  </td>
                </tr>
              ) : (
                meetings.map((meeting) => (
                  <tr key={meeting.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link
                        to={`/meetings/${meeting.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {meeting.location}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{meeting.host?.username}</td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div>{formatDate(meeting.meeting_datetime, 'yyyy-MM-dd')}</div>
                        <div className="text-gray-500">
                          {formatDate(meeting.meeting_datetime, 'HH:mm')}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${
                        (meeting.participants?.length || 0) >= meeting.max_participants
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}>
                        {meeting.participants?.length || 0} / {meeting.max_participants}명
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        meeting.purpose === 'coffee'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {meeting.purpose === 'coffee' ? '☕ 커피' : '🍺 술'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(meeting)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/meetings/${meeting.id}`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          상세보기
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(meeting)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="모임 삭제 확인"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 <strong>{selectedMeeting?.location}</strong> 모임을 삭제하시겠습니까?
          </p>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ 참가자: {selectedMeeting?.participants?.length || 0}명
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              이 작업은 되돌릴 수 없으며, 모든 채팅 기록도 삭제됩니다.
            </p>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminMeetingsPage
