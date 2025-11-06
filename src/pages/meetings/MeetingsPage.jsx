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
  const [filter, setFilter] = useState('casual') // casual, regular, past

  // Check if user is logged in
  const isLoggedIn = !!user

  // Check if user can create meetings (only when logged in)
  const canCreateMeeting = isLoggedIn && (user.role === 'admin' || user.role === 'meeting_host')

  // Check if user is admin
  const isAdmin = user?.role === 'admin'

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
        .eq('is_template', false)  // Exclude templates - only show actual meeting instances

      if (filter === 'regular') {
        // 정기 모임만 표시
        query = query
          .eq('meeting_type', 'regular')
          .gte('start_datetime', new Date().toISOString())
          .in('status', ['recruiting', 'confirmed'])
      } else if (filter === 'casual') {
        // 즉흥 모임 중 모집 중인 것만
        query = query
          .eq('meeting_type', 'casual')
          .gte('start_datetime', new Date().toISOString())
          .in('status', ['recruiting', 'confirmed'])
      } else if (filter === 'past') {
        // 지난 모임 (관리자 전용) - 모든 타입의 지난 모임
        query = query
          .lt('start_datetime', new Date().toISOString())
      }

      const { data } = await query.order('start_datetime', {
        ascending: filter !== 'past',
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
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">철학챗</h1>
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
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('casual')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'casual'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            ⚡ 즉흥 모임
          </button>
          <button
            onClick={() => setFilter('regular')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'regular'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            📅 정기 모임
          </button>
          {/* 관리자 전용: 지난 모임 탭 */}
          {isAdmin && (
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'past'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              🕐 지난 모임 (관리자)
            </button>
          )}
        </div>
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

                {/* Badges */}
                <div className="mb-3 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {/* Meeting Type Badge */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        meeting.meeting_type === 'regular'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {meeting.meeting_type === 'regular' ? '📅 정기' : '⚡ 즉흥'}
                    </span>

                    {/* Casual Meeting Subtype Badge (only for casual meetings) */}
                    {meeting.meeting_type === 'casual' && meeting.casual_meeting_type && (
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          meeting.casual_meeting_type === 'hobby'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {meeting.casual_meeting_type === 'hobby' ? '🎨 취미' : '💬 토론'}
                      </span>
                    )}

                    {/* Purpose Badge */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        meeting.purpose === 'coffee'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {meeting.purpose === 'coffee' ? '☕ 커피' : '🍺 술'}
                    </span>
                  </div>

                  {/* D-day (only for casual meetings not in past filter) */}
                  {filter !== 'past' && meeting.meeting_type === 'casual' && (
                    <span className="text-sm font-medium text-blue-600">
                      {getDday(meeting.start_datetime)}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {meeting.location}
                </h3>

                {/* DateTime Info */}
                <p className="text-gray-600 mb-4">
                  {meeting.meeting_type === 'regular' ? (
                    <>
                      <span className="font-medium">
                        매주{' '}
                        {
                          ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'][
                            meeting.recurrence_day_of_week
                          ]
                        }
                      </span>
                      {' '}
                      <span>{meeting.recurrence_time}</span>
                    </>
                  ) : (
                    <>
                      {formatDate(meeting.start_datetime, 'yyyy년 MM월 dd일 HH:mm')}
                      {' - '}
                      {formatDate(meeting.end_datetime, 'HH:mm')}
                    </>
                  )}
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
              {filter === 'regular'
                ? '정기 모임이 없습니다'
                : filter === 'casual'
                ? '즉흥 모임이 없습니다'
                : '지난 모임이 없습니다'}
            </p>
            {(filter !== 'past' && canCreateMeeting) && (
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
