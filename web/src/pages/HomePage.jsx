import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { formatDate, getDday } from '../utils/date'
import Card from '../components/common/Card'
import Loading from '../components/common/Loading'
import Button from '../components/common/Button'
import TodayQuestionBanner from '../components/questions/TodayQuestionBanner'

function HomePage() {
  const user = useAuthStore((state) => state.user)
  const [votingPeriod, setVotingPeriod] = useState(null)
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  // Check if user is logged in
  const isLoggedIn = !!user

  // Check if user can create meetings
  const canCreateMeeting = user?.role === 'admin' || user?.role === 'meeting_host'

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

      // Fetch upcoming meetings (changed from 'offline_meetings' to 'meetings')
      // Fix: changed (count) to (id) - count doesn't exist in new schema
      const { data: meetingsData } = await supabase
        .from('meetings')
        .select(`
          *,
          host:profiles(username),
          participants:meeting_participants(id)
        `)
        .eq('status', 'recruiting')
        .gte('meeting_datetime', new Date().toISOString())
        .order('meeting_datetime', { ascending: true })
        .limit(6)

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

  // Handle click on protected links
  const handleProtectedLinkClick = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert('로그인 후 이용 부탁드립니다')
      window.location.href = '/login'
    }
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Rezom 커뮤니티</h1>

      {/* 로그인 안내 배너 - 로그인하지 않은 사용자에게만 표시 */}
      {!isLoggedIn && (
        <Card className="mb-6 bg-blue-50 border-2 border-blue-200">
          <div className="text-center py-4">
            <h2 className="text-lg font-bold text-blue-900 mb-2">
              🎉 통찰방 커뮤니티에 오신 것을 환영합니다!
            </h2>
            <p className="text-blue-700 mb-4">
              철학챗은 누구나 볼 수 있지만, 참가 및 다른 기능은 로그인이 필요합니다.
            </p>
            <Link to="/login">
              <Button className="mr-2">로그인</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline">회원가입</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* 오늘의 질문 배너 - 로그인한 사용자에게만 표시 */}
      {isLoggedIn && <TodayQuestionBanner />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Current Voting Period - 로그인한 사용자에게만 표시 */}
        {isLoggedIn && (
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
        )}

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
          <div className="mt-6 pt-4 border-t">
            <a
              href="https://ingk.me/32"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-center font-medium rounded-lg transition-colors"
            >
              🎉 커뮤니티 참가하기
            </a>
          </div>
        </Card>
      </div>

      {/* Upcoming Meetings */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">다가오는 모임</h2>
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
                      {getDday(meeting.meeting_datetime)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {meeting.location}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {formatDate(meeting.meeting_datetime, 'MM월 dd일 HH:mm')}
                  </p>
                  <p className="text-sm text-gray-600">
                    호스트: {meeting.host?.username}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-2">
                    {meeting.participants?.length || 0} /{' '}
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
              {canCreateMeeting && (
                <Link to="/meetings/create">
                  <Button>모임 만들기</Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Quick Links - 로그인한 사용자에게만 표시 */}
      {isLoggedIn && (
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
          {canCreateMeeting && (
            <Card hoverable>
              <Link to="/meetings/create" className="block text-center">
                <div className="text-4xl mb-2">🤝</div>
                <h3 className="font-semibold text-gray-900 mb-1">모임 만들기</h3>
                <p className="text-sm text-gray-600">
                  새로운 철학챗을 만들어보세요
                </p>
              </Link>
            </Card>
          )}
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
      )}

      {/* Footer Quote */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-lg text-gray-600 italic">
          트렌디한 우리는 철학합니다. 철학하는 우리는 트렌디합니다.
        </p>
      </div>
    </div>
  )
}

export default HomePage
