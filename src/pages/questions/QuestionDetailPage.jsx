import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'

function QuestionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [question, setQuestion] = useState(null)
  const [checkData, setCheckData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAnswerModal, setShowAnswerModal] = useState(false)
  const [userAnswer, setUserAnswer] = useState('')
  const [userNote, setUserNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchQuestionDetail()
  }, [id])

  const fetchQuestionDetail = async () => {
    try {
      // 질문 정보 가져오기
      const { data: questionData, error: questionError } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('id', id)
        .single()

      if (questionError) throw questionError

      setQuestion(questionData)

      // 체크 정보 가져오기
      const { data: checkData } = await supabase
        .from('question_checks')
        .select('*')
        .eq('question_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (checkData) {
        setCheckData(checkData)
        setUserAnswer(checkData.user_answer || '')
        setUserNote(checkData.user_note || '')
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      alert('질문을 불러오는데 실패했습니다.')
      navigate('/questions')
    } finally {
      setLoading(false)
    }
  }

  const handleCheck = async () => {
    if (!checkData) {
      // 체크가 없으면 모달 열기
      setShowAnswerModal(true)
    } else {
      // 이미 체크했으면 체크 취소
      try {
        const { error } = await supabase
          .from('question_checks')
          .delete()
          .eq('id', checkData.id)

        if (error) throw error

        setCheckData(null)
        setUserAnswer('')
        setUserNote('')
        alert('체크를 취소했습니다.')
        fetchQuestionDetail()
      } catch (error) {
        console.error('Error unchecking:', error)
        alert('체크 취소에 실패했습니다.')
      }
    }
  }

  const handleSaveAnswer = async () => {
    setSaving(true)
    try {
      if (checkData) {
        // 업데이트
        const { error } = await supabase
          .from('question_checks')
          .update({
            user_answer: userAnswer,
            user_note: userNote,
            updated_at: new Date().toISOString()
          })
          .eq('id', checkData.id)

        if (error) throw error
      } else {
        // 생성
        const { data, error } = await supabase
          .from('question_checks')
          .insert({
            user_id: user.id,
            question_id: id,
            user_answer: userAnswer,
            user_note: userNote,
            is_checked: true
          })
          .select()
          .single()

        if (error) throw error
        setCheckData(data)
      }

      setShowAnswerModal(false)
      alert('저장되었습니다!')
      fetchQuestionDetail()
    } catch (error) {
      console.error('Error saving answer:', error)
      alert('저장에 실패했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const parseReferences = (referencesString) => {
    if (!referencesString) return []
    try {
      return JSON.parse(referencesString)
    } catch {
      return []
    }
  }

  if (loading) return <Loading />
  if (!question) return null

  const references = parseReferences(question.reference_links)

  return (
    <div className="max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <Link to="/questions" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← 질문 모음으로 돌아가기
        </Link>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">
            {formatDate(question.scheduled_date, 'yyyy년 MM월 dd일')}
          </span>
          {checkData && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              완료
            </span>
          )}
        </div>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
          {question.title}
        </h1>
      </div>

      {/* 이미지 */}
      {question.image_url && (
        <div className="mb-6">
          <img
            src={question.image_url}
            alt={question.title}
            className="w-full rounded-lg shadow-md"
          />
        </div>
      )}

      {/* 본문 */}
      <Card className="mb-6">
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-4 whitespace-pre-wrap">
            {question.short_description}
          </p>
          <div className="border-t pt-4 mt-4">
            <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {question.content}
            </div>
          </div>
        </div>
      </Card>

      {/* 외부 링크 */}
      {question.external_link && (
        <Card className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">관련 링크</h3>
          <a
            href={question.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline break-all"
          >
            {question.external_link}
          </a>
        </Card>
      )}

      {/* 참고 문헌 */}
      {references.length > 0 && (
        <Card className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">참고 문헌</h3>
          <ul className="space-y-2">
            {references.map((ref, index) => (
              <li key={index} className="text-gray-700">
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    {ref.title}
                  </a>
                ) : (
                  <span>{ref.title}</span>
                )}
                {ref.author && <span className="text-gray-500 ml-2">- {ref.author}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 내 답변 */}
      {checkData && checkData.user_answer && (
        <Card className="mb-6 bg-blue-50 border-l-4 border-blue-500">
          <h3 className="font-semibold text-gray-900 mb-2">내 답변</h3>
          <p className="text-gray-700 whitespace-pre-wrap mb-3">{checkData.user_answer}</p>
          {checkData.user_note && (
            <>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm">메모</h4>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{checkData.user_note}</p>
            </>
          )}
          <p className="text-xs text-gray-500 mt-3">
            작성일: {formatDate(checkData.checked_at, 'yyyy-MM-dd HH:mm')}
          </p>
        </Card>
      )}

      {/* 체크 버튼 */}
      <div className="flex gap-3">
        <Button
          onClick={handleCheck}
          variant={checkData ? 'outline' : 'primary'}
          fullWidth
          className={checkData ? 'border-red-500 text-red-600 hover:bg-red-50' : ''}
        >
          {checkData ? '체크 취소' : '✓ 체크하기'}
        </Button>
        {checkData && (
          <Button onClick={() => setShowAnswerModal(true)} fullWidth>
            답변 수정
          </Button>
        )}
      </div>

      {/* 답변 입력 모달 */}
      <Modal
        isOpen={showAnswerModal}
        onClose={() => setShowAnswerModal(false)}
        title={checkData ? "답변 수정" : "이 질문에 답변하기"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              나의 답변 (선택사항)
            </label>
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="이 질문에 대한 당신의 생각을 자유롭게 적어보세요..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              메모 (선택사항)
            </label>
            <textarea
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="개인적인 메모나 추가 생각..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowAnswerModal(false)}
              variant="outline"
              fullWidth
            >
              취소
            </Button>
            <Button
              onClick={handleSaveAnswer}
              disabled={saving}
              fullWidth
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default QuestionDetailPage
