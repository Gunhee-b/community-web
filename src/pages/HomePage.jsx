import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatDate, getDday } from '../utils/date'
import Card from '../components/common/Card'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'

function HomePage() {
  const [votingPeriod, setVotingPeriod] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch active voting period
      const { data: votingData } = await supabase
        .from('voting_periods')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setVotingPeriod(votingData)

      // Fetch upcoming meetings
      const { data: meetingsData } = await supabase
        .from('offline_meetings')
        .select(`
          *,
          host:users!host_id(username),
          participants:meeting_participants(count)
        `)
        .eq('status', 'recruiting')
        .gte('start_datetime', new Date().toISOString())
        .order('start_datetime', { ascending: true })
        .limit(3)

      setMeetings(meetingsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">통찰방 커뮤니티</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Voting Period */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            현재 진행 중인 투표
          </h2>
          {votingPeriod ? (
            <div>
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-2">
                  투표 진행중
                </span>
                <p className="text-sm text-gray-600">
                  시작: {formatDate(votingPeriod.start_date)}
                </p>
                <p className="text-sm text-gray-600">
                  종료: {formatDate(votingPeriod.end_date)}
                </p>
                <p className="text-lg font-semibold text-blue-600 mt-2">
                  {getDday(votingPeriod.end_date)}
                </p>
              </div>
              <Link to="/vote">
                <Button fullWidth>투표하러 가기</Button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                현재 진행 중인 투표가 없습니다
              </p>
            </div>
          )}
        </Card>

        {/* Quick Stats */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">커뮤니티 현황</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">활성 회원</span>
              <span className="text-2xl font-bold text-blue-600">250명</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">진행 중인 투표</span>
              <span className="text-2xl font-bold text-green-600">
                {votingPeriod ? '1개' : '0개'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">모집 중인 모임</span>
              <span className="text-2xl font-bold text-purple-600">
                {meetings.length}개
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">다가오는 모임</h2>
          <Link to="/meetings">
            <Button variant="outline" size="sm">
              전체 보기
            </Button>
          </Link>
        </div>

        {meetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {meetings.map((meeting) => (
              <Card key={meeting.id} hoverable>
                <Link to={`/meetings/${meeting.id}`}>
                  <div className="mb-2">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        meeting.purpose === 'coffee'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {meeting.purpose === 'coffee' ? '☕ 커피' : '🍺 술'}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      {getDday(meeting.start_datetime)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {meeting.location}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(meeting.start_datetime, 'MM월 dd일 HH:mm')}
                  </p>
                  <p className="text-sm text-gray-600">
                    호스트: {meeting.host?.username}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    {meeting.participants?.[0]?.count || 0} /{' '}
                    {meeting.max_participants}명 참여
                  </p>
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                다가오는 모임이 없습니다
              </p>
              <Link to="/meetings/create">
                <Button>모임 만들기</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hoverable>
          <Link to="/vote/nominate" className="block text-center">
            <div className="text-4xl mb-2">📝</div>
            <h3 className="font-semibold text-gray-900 mb-1">글 추천하기</h3>
            <p className="text-sm text-gray-600">
              베스트 글을 추천해보세요
            </p>
          </Link>
        </Card>
        <Card hoverable>
          <Link to="/meetings/create" className="block text-center">
            <div className="text-4xl mb-2">🤝</div>
            <h3 className="font-semibold text-gray-900 mb-1">모임 만들기</h3>
            <p className="text-sm text-gray-600">
              새로운 오프라인 모임을 만들어보세요
            </p>
          </Link>
        </Card>
        <Card hoverable>
          <Link to="/profile" className="block text-center">
            <div className="text-4xl mb-2">👤</div>
            <h3 className="font-semibold text-gray-900 mb-1">내 프로필</h3>
            <p className="text-sm text-gray-600">
              내 활동 내역을 확인하세요
            </p>
          </Link>
        </Card>
      </div>
    </div>
  )
}

export default HomePage
