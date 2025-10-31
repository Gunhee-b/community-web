import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'

function QuestionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [question, setQuestion] = useState(null)
  const [loading, setLoading] = useState(true)

  // 공개 답변 관련 상태
  const [publicAnswers, setPublicAnswers] = useState([])
  const [myPublicAnswer, setMyPublicAnswer] = useState(null)

  // 댓글 관련 상태
  const [commentsByAnswer, setCommentsByAnswer] = useState({})
  const [showCommentForm, setShowCommentForm] = useState({})
  const [commentContent, setCommentContent] = useState({})
  const [savingComment, setSavingComment] = useState({})

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

      // 공개 답변 가져오기
      await fetchPublicAnswers()
    } catch (error) {
      console.error('Error fetching question:', error)
      alert('질문을 불러오는데 실패했습니다.')
      navigate('/questions')
    } finally {
      setLoading(false)
    }
  }

  const fetchPublicAnswers = async () => {
    try {
      // 모든 공개 답변 가져오기 (사용자 정보 포함)
      const { data: answers, error } = await supabase
        .from('question_answers')
        .select(`
          *,
          users!question_answers_user_id_fkey (
            id,
            username
          )
        `)
        .eq('question_id', id)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setPublicAnswers(answers || [])

      // 내 답변 찾기
      const myAnswer = answers?.find(a => a.user_id === user.id)
      if (myAnswer) {
        setMyPublicAnswer(myAnswer)

        // 답변이 있는데 체크가 없으면 자동 생성 (보정)
        const { data: existingCheck, error: checkQueryError } = await supabase
          .from('question_checks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', id)
          .maybeSingle()

        console.log('🔍 [QuestionDetailPage] Checking for check record:', {
          questionId: id,
          userId: user.id,
          hasPublicAnswer: true,
          existingCheck,
          checkQueryError
        })

        if (!existingCheck) {
          const { data: newCheck, error: checkError } = await supabase
            .from('question_checks')
            .insert({
              user_id: user.id,
              question_id: id,
              is_checked: true,
              checked_at: myAnswer.created_at
            })
            .select()

          if (checkError) {
            console.error('❌ [QuestionDetailPage] Error creating check:', checkError)
          } else {
            console.log('✅ [QuestionDetailPage] Check record created:', newCheck)
          }
        } else {
          console.log('✓ [QuestionDetailPage] Check already exists')
        }
      }

      // 각 답변의 댓글 가져오기
      if (answers && answers.length > 0) {
        for (const answer of answers) {
          await fetchComments(answer.id)
        }
      }
    } catch (error) {
      console.error('Error fetching public answers:', error)
    }
  }

  const fetchComments = async (answerId) => {
    try {
      const { data: comments, error } = await supabase
        .from('answer_comments')
        .select(`
          *,
          users!answer_comments_user_id_fkey (
            id,
            username
          )
        `)
        .eq('answer_id', answerId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setCommentsByAnswer(prev => ({
        ...prev,
        [answerId]: comments || []
      }))
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleDeletePublicAnswer = async () => {
    if (!confirm('정말 답변을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('question_answers')
        .delete()
        .eq('id', myPublicAnswer.id)

      if (error) throw error

      alert('답변이 삭제되었습니다.')
      setMyPublicAnswer(null)
      await fetchPublicAnswers()
    } catch (error) {
      console.error('Error deleting answer:', error)
      alert('답변 삭제에 실패했습니다.')
    }
  }

  const handleSaveComment = async (answerId) => {
    const content = commentContent[answerId]?.trim()
    if (!content) {
      alert('댓글 내용을 입력해주세요.')
      return
    }

    setSavingComment(prev => ({ ...prev, [answerId]: true }))
    try {
      const { error } = await supabase
        .from('answer_comments')
        .insert({
          answer_id: answerId,
          user_id: user.id,
          content: content
        })

      if (error) throw error

      // 댓글 입력 폼 초기화
      setCommentContent(prev => ({ ...prev, [answerId]: '' }))
      setShowCommentForm(prev => ({ ...prev, [answerId]: false }))

      // 댓글 다시 가져오기
      await fetchComments(answerId)
      alert('댓글이 작성되었습니다!')
    } catch (error) {
      console.error('Error saving comment:', error)
      alert('댓글 저장에 실패했습니다.')
    } finally {
      setSavingComment(prev => ({ ...prev, [answerId]: false }))
    }
  }

  const handleDeleteComment = async (commentId, answerId) => {
    if (!confirm('정말 댓글을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('answer_comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      alert('댓글이 삭제되었습니다.')
      await fetchComments(answerId)
    } catch (error) {
      console.error('Error deleting comment:', error)
      alert('댓글 삭제에 실패했습니다.')
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
          {myPublicAnswer && (
            <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              답변 완료
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
            {question.external_link_text || question.external_link}
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

      {/* 답변 작성 상태 표시 */}
      {myPublicAnswer ? (
        <Card className="mb-6 bg-green-50 border-l-4 border-green-500">
          <h3 className="font-semibold text-gray-900 mb-1">✅ 답변 작성 완료</h3>
          <p className="text-sm text-gray-600">
            {formatDate(myPublicAnswer.created_at, 'yyyy년 MM월 dd일')}에 작성하셨습니다
          </p>
        </Card>
      ) : (
        <Card className="mb-6 bg-gray-50 border-l-4 border-gray-300">
          <h3 className="font-semibold text-gray-900 mb-1">📝 답변 미작성</h3>
          <p className="text-sm text-gray-600">
            공개 답변을 작성하여 90-Day Challenge에 참여하세요
          </p>
        </Card>
      )}

      {/* 공개 답변 섹션 */}
      <div className="border-t-2 border-gray-200 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            커뮤니티 답변 ({publicAnswers.length})
          </h2>
          <Button
            onClick={() => navigate(`/questions/${id}/write-answer`)}
            variant={myPublicAnswer ? 'outline' : 'primary'}
            className="min-h-[44px] md:min-h-[40px] touch-manipulation whitespace-nowrap"
          >
            {myPublicAnswer ? '✏️ 내 답변 수정' : '✍️ 답변 작성하기'}
          </Button>
        </div>

        {/* 답변 목록 */}
        {publicAnswers.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500">아직 작성된 답변이 없습니다.</p>
            <p className="text-gray-400 text-sm mt-2">첫 번째 답변을 작성해보세요!</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {publicAnswers.map((answer) => (
              <Card key={answer.id} className="bg-white">
                {/* 답변 헤더 */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {answer.users?.username || '알 수 없음'}
                    </span>
                    {answer.user_id === user.id && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        나
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(answer.created_at, 'yyyy-MM-dd HH:mm')}
                    </span>
                    {answer.user_id === user.id && (
                      <button
                        onClick={handleDeletePublicAnswer}
                        className="text-red-600 hover:text-red-700 active:text-red-800 text-sm min-h-[24px] px-1 touch-manipulation"
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>

                {/* 답변 이미지 (1~2장) */}
                {(answer.image_url || answer.image_url_2) && (
                  <div className={`mb-4 grid gap-3 ${answer.image_url && answer.image_url_2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                    {answer.image_url && (
                      <img
                        src={answer.image_url}
                        alt="답변 이미지 1"
                        className="w-full rounded-lg border border-gray-200"
                      />
                    )}
                    {answer.image_url_2 && (
                      <img
                        src={answer.image_url_2}
                        alt="답변 이미지 2"
                        className="w-full rounded-lg border border-gray-200"
                      />
                    )}
                  </div>
                )}

                {/* 답변 내용 */}
                {answer.content && (
                  <p className="text-sm md:text-base text-gray-800 whitespace-pre-wrap leading-relaxed mb-4 break-words">
                    {answer.content}
                  </p>
                )}

                {/* 댓글 섹션 */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700">
                      댓글 ({commentsByAnswer[answer.id]?.length || 0})
                    </span>
                    <button
                      onClick={() => setShowCommentForm(prev => ({
                        ...prev,
                        [answer.id]: !prev[answer.id]
                      }))}
                      className="text-sm text-blue-600 hover:text-blue-700 active:text-blue-800 min-h-[32px] md:min-h-0 px-2 md:px-3 touch-manipulation"
                    >
                      {showCommentForm[answer.id] ? '취소' : '댓글 달기'}
                    </button>
                  </div>

                  {/* 댓글 입력 폼 */}
                  {showCommentForm[answer.id] && (
                    <div className="mb-4 bg-gray-50 md:bg-transparent p-3 md:p-4 rounded-lg md:border md:border-gray-200">
                      <textarea
                        value={commentContent[answer.id] || ''}
                        onChange={(e) => setCommentContent(prev => ({
                          ...prev,
                          [answer.id]: e.target.value
                        }))}
                        placeholder="댓글을 입력하세요..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          onClick={() => setShowCommentForm(prev => ({
                            ...prev,
                            [answer.id]: false
                          }))}
                          variant="outline"
                          size="sm"
                          className="min-h-[36px] md:min-h-0 touch-manipulation"
                        >
                          취소
                        </Button>
                        <Button
                          onClick={() => handleSaveComment(answer.id)}
                          disabled={savingComment[answer.id]}
                          size="sm"
                          className="min-h-[36px] md:min-h-0 touch-manipulation"
                        >
                          {savingComment[answer.id] ? '저장 중...' : '댓글 작성'}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* 댓글 목록 */}
                  {commentsByAnswer[answer.id]?.length > 0 && (
                    <div className="space-y-3">
                      {commentsByAnswer[answer.id].map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.users?.username || '알 수 없음'}
                              </span>
                              {comment.user_id === user.id && (
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                  나
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDate(comment.created_at, 'yyyy-MM-dd HH:mm')}
                              </span>
                              {comment.user_id === user.id && (
                                <button
                                  onClick={() => handleDeleteComment(comment.id, answer.id)}
                                  className="text-red-600 hover:text-red-700 active:text-red-800 text-xs min-h-[24px] px-1 touch-manipulation"
                                >
                                  삭제
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-sm md:text-base text-gray-700 whitespace-pre-wrap break-words">
                            {comment.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default QuestionDetailPage
