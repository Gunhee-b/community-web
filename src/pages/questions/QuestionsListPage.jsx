import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'

function QuestionsListPage() {
  const user = useAuthStore((state) => state.user)
  const [questions, setQuestions] = useState([])
  const [checkedQuestions, setCheckedQuestions] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, checked, unchecked
  const [challengeStats, setChallengeStats] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 모든 발행된 질문 가져오기
      const { data: questionsData, error: questionsError } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('is_published', true)
        .lte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: false })

      if (questionsError) throw questionsError
      setQuestions(questionsData || [])

      // 체크한 질문 ID 목록 가져오기
      const { data: checksData } = await supabase
        .from('question_checks')
        .select('question_id')
        .eq('user_id', user.id)

      const checkedSet = new Set(checksData?.map(c => c.question_id) || [])
      setCheckedQuestions(checkedSet)

      // 챌린지 통계 가져오기
      const { data: statsData } = await supabase
        .from('challenge_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      setChallengeStats(statsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredQuestions = questions.filter(q => {
    if (filter === 'checked') return checkedQuestions.has(q.id)
    if (filter === 'unchecked') return !checkedQuestions.has(q.id)
    return true
  })

  const totalChecked = checkedQuestions.size
  const progressPercentage = Math.min((totalChecked / 90) * 100, 100)

  if (loading) return <Loading />

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">ING:K 질문 모음</h1>
        <p className="text-gray-600">스스로 정의하고, 표현하는 철학을 구축하기를 바랍니다.</p>
      </div>

      {/* 90-Day Challenge 진행 상황 */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Onetence Note 90-Day Challenge</h2>
            <p className="text-sm text-gray-600">90개의 질문을 스스로 정의하고 답변하는 챌린지</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{totalChecked}/90</div>
            <div className="text-sm text-gray-500">완료</div>
          </div>
        </div>

        {/* 진행 바 */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-400 to-purple-400 h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-xs text-white font-medium">
                  {progressPercentage.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {challengeStats?.current_streak || 0}
            </div>
            <div className="text-xs text-gray-600">연속 일수</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {challengeStats?.longest_streak || 0}
            </div>
            <div className="text-xs text-gray-600">최장 연속</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {challengeStats?.completed_at ? (
                <span className="text-green-600">완료</span>
              ) : (
                `D-${90 - totalChecked}`
              )}
            </div>
            <div className="text-xs text-gray-600">
              {challengeStats?.completed_at ? '챌린지 완료!' : '남은 질문'}
            </div>
          </div>
        </div>

        {challengeStats?.completed_at && (
          <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
            <p className="text-green-800 font-medium">
              🎉 축하합니다! 90-Day Challenge를 완료했습니다!
            </p>
            <p className="text-sm text-green-700 mt-1">
              완료일: {formatDate(challengeStats.completed_at, 'yyyy-MM-dd')}
            </p>
            {challengeStats.started_at && (
              <p className="text-sm text-green-700">
                소요 기간: {Math.ceil((new Date(challengeStats.completed_at) - new Date(challengeStats.started_at)) / (1000 * 60 * 60 * 24))}일
              </p>
            )}
          </div>
        )}
      </Card>

      {/* 필터 */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          전체 ({questions.length})
        </Button>
        <Button
          variant={filter === 'checked' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('checked')}
        >
          완료 ({totalChecked})
        </Button>
        <Button
          variant={filter === 'unchecked' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('unchecked')}
        >
          미완료 ({questions.length - totalChecked})
        </Button>
      </div>

      {/* 질문 목록 */}
      {filteredQuestions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuestions.map((question) => {
            const isChecked = checkedQuestions.has(question.id)
            const isToday = question.scheduled_date === new Date().toISOString().split('T')[0]

            return (
              <Link key={question.id} to={`/questions/${question.id}`}>
                <Card hoverable className={`h-full relative ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                  {/* 상태 배지 */}
                  <div className="flex items-center justify-between mb-3">
                    {isToday && (
                      <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        오늘의 질문
                      </span>
                    )}
                    <span className={`ml-auto inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      isChecked
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isChecked ? (
                        <>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          완료
                        </>
                      ) : '미완료'}
                    </span>
                  </div>

                  {/* 이미지 */}
                  {question.image_url && (
                    <div className="mb-3">
                      <img
                        src={question.image_url}
                        alt={question.title}
                        className="w-full h-32 object-cover rounded"
                      />
                    </div>
                  )}

                  {/* 제목 */}
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {question.title}
                  </h3>

                  {/* 설명 */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {question.short_description}
                  </p>

                  {/* 날짜 */}
                  <p className="text-xs text-gray-500">
                    {formatDate(question.scheduled_date, 'yyyy년 MM월 dd일')}
                  </p>
                </Card>
              </Link>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-2">
              {filter === 'checked' && '아직 완료한 질문이 없습니다.'}
              {filter === 'unchecked' && '모든 질문을 완료했습니다!'}
              {filter === 'all' && '질문이 없습니다.'}
            </p>
            {filter !== 'all' && (
              <Button onClick={() => setFilter('all')} variant="outline" size="sm">
                전체 질문 보기
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default QuestionsListPage
