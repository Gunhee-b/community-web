import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate, getDday } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'

function MeetingsPage() {
  const user = useAuthStore((state) => state.user)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('upcoming') // upcoming, past

  // Check if user is logged in
  const isLoggedIn = !!user

  // Check if user can create meetings (only when logged in)
  const canCreateMeeting = isLoggedIn && (user.role === 'admin' || user.role === 'meeting_host')

  useEffect(() => {
    fetchMeetings()
  }, [filter])

  const fetchMeetings = async () => {
    try {
      let query = supabase
        .from('offline_meetings')
        .select(`
          *,
          host:users!host_id(username),
          participants:meeting_participants(count)
        `)

      if (filter === 'upcoming') {
        query = query
          .gte('start_datetime', new Date().toISOString())
          .in('status', ['recruiting', 'confirmed'])
      } else {
        query = query.lt('start_datetime', new Date().toISOString())
      }

      const { data } = await query.order('start_datetime', {
        ascending: filter === 'upcoming',
      })

      setMeetings(data || [])
    } catch (error) {
      console.error('Error fetching meetings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">오프라인 모임</h1>
        {isLoggedIn ? (
          canCreateMeeting && (
            <Link to="/meetings/create">
              <Button>모임 만들기</Button>
            </Link>
          )
        ) : (
          <Link to="/login">
            <Button variant="outline">로그인</Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('upcoming')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'upcoming'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          모집 중
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

      {/* Meetings List */}
      {meetings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {meetings.map((meeting) => (
            <Card key={meeting.id} hoverable>
              <Link to={`/meetings/${meeting.id}`}>
                {/* Image */}
                {meeting.image_url && (
                  <img
                    src={meeting.image_url}
                    alt={meeting.location}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      meeting.purpose === 'coffee'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {meeting.purpose === 'coffee' ? '☕ 커피' : '🍺 술'}
                  </span>
                  {filter === 'upcoming' && (
                    <span className="text-sm font-medium text-blue-600">
                      {getDday(meeting.start_datetime)}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {meeting.location}
                </h3>

                <p className="text-gray-600 mb-4">
                  {formatDate(meeting.start_datetime, 'yyyy년 MM월 dd일 HH:mm')}
                  {' - '}
                  {formatDate(meeting.end_datetime, 'HH:mm')}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    호스트: {meeting.host?.username}
                  </span>
                  <span className="font-medium text-blue-600">
                    {meeting.participants?.[0]?.count || 0} /{' '}
                    {meeting.max_participants}명
                  </span>
                </div>

                {meeting.status === 'closed' && (
                  <div className="mt-3 px-3 py-1 bg-gray-100 text-gray-600 text-center rounded">
                    모집 마감
                  </div>
                )}

                {meeting.status === 'confirmed' && (
                  <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-center rounded font-medium">
                    ✅ 모임 확정
                  </div>
                )}
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              {filter === 'upcoming'
                ? '모집 중인 모임이 없습니다'
                : '지난 모임이 없습니다'}
            </p>
            {filter === 'upcoming' && canCreateMeeting && (
              <Link to="/meetings/create">
                <Button>첫 모임을 만들어보세요</Button>
              </Link>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default MeetingsPage
