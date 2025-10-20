import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import Card from '../common/Card'

function TodayQuestionBanner() {
  const user = useAuthStore((state) => state.user)
  const [todayQuestion, setTodayQuestion] = useState(null)
  const [isChecked, setIsChecked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodayQuestion()
  }, [])

  const fetchTodayQuestion = async () => {
    try {
      // 오늘의 질문 가져오기
      const { data: questionData, error: questionError } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('scheduled_date', new Date().toISOString().split('T')[0])
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (questionError) throw questionError

      setTodayQuestion(questionData)

      // 체크 여부 확인
      if (questionData) {
        const { data: checkData } = await supabase
          .from('question_checks')
          .select('id')
          .eq('question_id', questionData.id)
          .eq('user_id', user.id)
          .maybeSingle()

        setIsChecked(!!checkData)
      }
    } catch (error) {
      console.error('Error fetching today question:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !todayQuestion) return null

  return (
    <Link to={`/questions/${todayQuestion.id}`}>
      <Card hoverable className="bg-gradient-to-r from-blue-400 to-purple-400 text-white mb-6 relative overflow-hidden">
        {/* 배경 패턴 */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💡</span>
              <h3 className="text-lg md:text-xl font-bold">오늘의 질문</h3>
            </div>
            {isChecked && (
              <span className="inline-flex items-center px-3 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                완료
              </span>
            )}
          </div>

          <h4 className="text-xl md:text-2xl font-bold mb-2 line-clamp-2">
            {todayQuestion.title}
          </h4>

          <p className="text-white text-opacity-90 mb-4 line-clamp-2">
            {todayQuestion.short_description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm text-white text-opacity-80">
              클릭하여 자세히 보기 →
            </span>
            {!isChecked && (
              <span className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all">
                답변하기
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  )
}

export default TodayQuestionBanner
