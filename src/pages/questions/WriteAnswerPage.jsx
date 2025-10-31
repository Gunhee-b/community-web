import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'
import { useImageUpload } from '../../hooks/useImageUpload'
import { useToast } from '../../hooks/useToast'

function WriteAnswerPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const toast = useToast()

  const [question, setQuestion] = useState(null)
  const [myPublicAnswer, setMyPublicAnswer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [publicAnswerContent, setPublicAnswerContent] = useState('')
  const [saving, setSaving] = useState(false)

  // 기존 이미지 URL 저장 (수정 시)
  const [existingImageUrls, setExistingImageUrls] = useState([null, null])

  // 이미지 업로드 훅 사용 (최대 2장)
  const {
    imageFiles,
    imagePreviews,
    uploading,
    error: imageError,
    handleImageSelect,
    removeImage,
    uploadImages,
    hasImages,
  } = useImageUpload({ bucket: 'answer-images', multiple: true, maxImages: 2 })

  useEffect(() => {
    fetchQuestionAndAnswer()
  }, [id])

  const fetchQuestionAndAnswer = async () => {
    try {
      // 질문 정보 가져오기
      const { data: questionData, error: questionError } = await supabase
        .from('daily_questions')
        .select('*')
        .eq('id', id)
        .single()

      if (questionError) throw questionError

      setQuestion(questionData)

      // 내 답변 확인
      const { data: answerData } = await supabase
        .from('question_answers')
        .select('*')
        .eq('question_id', id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (answerData) {
        setMyPublicAnswer(answerData)
        setPublicAnswerContent(answerData.content || '')
        setExistingImageUrls([answerData.image_url || null, answerData.image_url_2 || null])

        // 기존 공개 답변이 있는데 체크 레코드가 없으면 자동 생성 (보정 로직)
        const { data: existingCheck, error: checkQueryError } = await supabase
          .from('question_checks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', id)
          .maybeSingle()

        console.log('🔍 [WriteAnswerPage] Checking existing check:', {
          questionId: id,
          userId: user.id,
          existingCheck,
          checkQueryError
        })

        if (!existingCheck) {
          // 답변 작성일을 기준으로 체크 생성
          const { data: newCheck, error: checkError } = await supabase
            .from('question_checks')
            .insert({
              user_id: user.id,
              question_id: id,
              is_checked: true,
              checked_at: answerData.created_at // 답변 작성일 사용
            })
            .select()

          if (checkError) {
            console.error('❌ [WriteAnswerPage] Error creating check:', checkError)
          } else {
            console.log('✅ [WriteAnswerPage] Check record created:', newCheck)
          }
        } else {
          console.log('✓ [WriteAnswerPage] Check already exists')
        }
      }
    } catch (error) {
      console.error('Error fetching question:', error)
      toast.error('질문을 불러오는데 실패했습니다.')
      navigate('/questions')
    } finally {
      setLoading(false)
    }
  }

  const handleSavePublicAnswer = async () => {
    // 텍스트 또는 이미지 중 최소 하나는 있어야 함
    const hasContent = publicAnswerContent.trim().length >= 10
    const hasExistingOrNewImages =
      hasImages || existingImageUrls[0] || existingImageUrls[1]

    if (!hasContent && !hasExistingOrNewImages) {
      toast.error('최소 10자 이상의 텍스트 또는 이미지를 업로드해주세요.')
      return
    }

    setSaving(true)
    try {
      // 새로운 이미지 업로드
      let uploadedUrls = []
      if (hasImages) {
        uploadedUrls = await uploadImages(user.id)
      }

      // 최종 이미지 URL 결정
      // 새로 업로드된 이미지가 있으면 사용, 없으면 기존 이미지 유지
      const finalImageUrl1 = uploadedUrls[0] || (imageFiles[0] ? null : existingImageUrls[0])
      const finalImageUrl2 = uploadedUrls[1] || (imageFiles[1] ? null : existingImageUrls[1])

      const answerData = {
        content: publicAnswerContent.trim() || null,
        image_url: finalImageUrl1,
        image_url_2: finalImageUrl2,
        updated_at: new Date().toISOString(),
      }

      if (myPublicAnswer) {
        // 수정
        const { error } = await supabase
          .from('question_answers')
          .update(answerData)
          .eq('id', myPublicAnswer.id)

        if (error) throw error

        // 수정 시에도 체크 레코드가 없으면 생성 (보정)
        const { data: existingCheck, error: checkQueryError } = await supabase
          .from('question_checks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', id)
          .maybeSingle()

        console.log('🔍 [WriteAnswerPage - Update] Checking for check record:', {
          questionId: id,
          userId: user.id,
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
              checked_at: myPublicAnswer.created_at // 기존 답변의 작성일 사용
            })
            .select()

          if (checkError) {
            console.error('❌ [WriteAnswerPage - Update] Error creating check:', checkError)
          } else {
            console.log('✅ [WriteAnswerPage - Update] Check record created:', newCheck)
          }
        } else {
          console.log('✓ [WriteAnswerPage - Update] Check already exists')
        }

        toast.success('답변이 수정되었습니다!')
      } else {
        // 새로 작성
        const { error } = await supabase.from('question_answers').insert({
          question_id: id,
          user_id: user.id,
          ...answerData,
          is_public: true,
        })

        if (error) throw error

        // 공개 답변 작성 시 자동으로 체크 (90-Day Challenge 카운트)
        // question_checks 테이블에 레코드가 없으면 생성
        const { data: existingCheck, error: checkQueryError } = await supabase
          .from('question_checks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', id)
          .maybeSingle()

        console.log('🔍 [WriteAnswerPage - New] Checking for check record:', {
          questionId: id,
          userId: user.id,
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
              checked_at: new Date().toISOString()
            })
            .select()

          if (checkError) {
            console.error('❌ [WriteAnswerPage - New] Error creating check:', checkError)
            // 체크 생성 실패해도 답변은 저장되었으므로 에러 무시
          } else {
            console.log('✅ [WriteAnswerPage - New] Check record created:', newCheck)
          }
        } else {
          console.log('✓ [WriteAnswerPage - New] Check already exists')
        }

        toast.success('답변이 작성되었습니다! 90-Day Challenge에 카운트되었습니다.')
      }

      // 질문 상세 페이지로 이동
      navigate(`/questions/${id}`)
    } catch (error) {
      console.error('Error saving public answer:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      toast.error('답변 저장에 실패했습니다: ' + (error.message || JSON.stringify(error)))
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
        <button
          onClick={() => navigate(`/questions/${id}`)}
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← 질문으로 돌아가기
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {myPublicAnswer ? '공개 답변 수정하기' : '공개 답변 작성하기'}
        </h1>
        <p className="text-gray-600">
          다른 사용자들과 생각을 나누고 댓글로 소통할 수 있습니다.
        </p>
      </div>

      {/* 질문 내용 표시 */}
      <Card className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-lg">❓</span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                오늘의 질문
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(question.scheduled_date, 'yyyy년 MM월 dd일')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {question.title}
            </h2>
            <p className="text-gray-700 mb-2 whitespace-pre-wrap">
              {question.short_description}
            </p>
            {question.content && (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-700 font-medium">
                  상세 내용 보기
                </summary>
                <div className="mt-3 text-gray-700 whitespace-pre-wrap text-sm border-t pt-3">
                  {question.content}
                </div>
              </details>
            )}
          </div>
        </div>

        {/* 이미지 */}
        {question.image_url && (
          <div className="mt-4">
            <img
              src={question.image_url}
              alt={question.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* 외부 링크 */}
        {question.external_link && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-1">관련 링크</p>
            <a
              href={question.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline break-all"
            >
              {question.external_link_text || question.external_link}
            </a>
          </div>
        )}

        {/* 참고 문헌 */}
        {references.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-2">참고 문헌</p>
            <ul className="space-y-1">
              {references.map((ref, index) => (
                <li key={index} className="text-sm text-gray-700">
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
          </div>
        )}
      </Card>

      {/* 안내 메시지 */}
      <Card className="mb-6 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">공개 답변 작성 가이드</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• 이 답변은 모든 사용자에게 공개됩니다.</li>
              <li>• 텍스트(최소 10자) 또는 이미지 중 하나는 필수입니다.</li>
              <li>• 이미지는 5MB 이하, JPG/PNG/GIF 형식만 가능합니다.</li>
              <li>• 다른 사용자들과 의견을 나누고 댓글로 소통할 수 있습니다.</li>
              <li>• 한 질문당 하나의 답변만 작성할 수 있습니다.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* 이미지 업로드 (2장) */}
      <Card className="mb-6">
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          이미지 첨부 (선택사항, 최대 2장)
        </label>

        {imageError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {imageError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1].map((index) => (
            <div key={index}>
              <p className="text-sm text-gray-600 mb-2">이미지 {index + 1}</p>
              {imagePreviews[index] || existingImageUrls[index] ? (
                <div className="relative">
                  <img
                    src={imagePreviews[index] || existingImageUrls[index]}
                    alt={`답변 이미지 ${index + 1}`}
                    className="w-full rounded-lg border-2 border-gray-200"
                  />
                  <button
                    onClick={() => {
                      removeImage(index)
                      setExistingImageUrls((prev) => {
                        const newUrls = [...prev]
                        newUrls[index] = null
                        return newUrls
                      })
                    }}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 shadow-lg active:bg-red-800"
                    type="button"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 md:p-8 lg:p-12 text-center hover:border-blue-500 active:border-blue-600 transition-colors cursor-pointer touch-manipulation">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageSelect(e, index)}
                    className="hidden"
                    id={`image-upload-${index}`}
                  />
                  <label htmlFor={`image-upload-${index}`} className="cursor-pointer block">
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 md:w-12 md:h-12 lg:w-14 lg:h-14 text-gray-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-gray-600 font-medium text-sm md:text-base">클릭하여 업로드</span>
                      <span className="text-xs text-gray-500 mt-1">최대 5MB</span>
                    </div>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 답변 작성 폼 */}
      <Card className="mb-6">
        <label className="block text-lg font-semibold text-gray-900 mb-3">
          텍스트 답변 (선택사항)
        </label>
        <textarea
          value={publicAnswerContent}
          onChange={(e) => setPublicAnswerContent(e.target.value)}
          placeholder="이 질문에 대한 당신의 생각을 자유롭게 적어보세요...&#10;&#10;예시:&#10;- 이 질문을 보고 떠오른 생각이나 경험&#10;- 질문에 대한 나만의 해석이나 관점&#10;- 다른 사람들과 나누고 싶은 인사이트&#10;&#10;💡 텍스트 없이 이미지만 업로드할 수도 있습니다!"
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
          rows={12}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3">
          <p className="text-sm text-gray-500">
            {publicAnswerContent.length}자
            {publicAnswerContent.length < 10 &&
              !hasImages &&
              !existingImageUrls[0] &&
              !existingImageUrls[1] &&
              ` (최소 10자 또는 이미지 필수)`}
          </p>
          {myPublicAnswer && (
            <p className="text-xs text-gray-400">
              마지막 수정: {formatDate(myPublicAnswer.updated_at, 'yyyy-MM-dd HH:mm')}
            </p>
          )}
        </div>
      </Card>

      {/* 버튼 */}
      <div className="flex gap-3 sticky bottom-0 bg-white py-4 px-4 -mx-4 md:px-0 md:mx-0 border-t shadow-lg md:shadow-none safe-bottom">
        <Button
          onClick={() => navigate(`/questions/${id}`)}
          variant="outline"
          fullWidth
          className="min-h-[44px] md:min-h-[40px] touch-manipulation"
        >
          취소
        </Button>
        <Button
          onClick={handleSavePublicAnswer}
          disabled={
            saving ||
            uploading ||
            (!publicAnswerContent.trim() && !hasImages && !existingImageUrls[0] && !existingImageUrls[1]) ||
            (publicAnswerContent.trim() && publicAnswerContent.trim().length < 10 && !hasImages && !existingImageUrls[0] && !existingImageUrls[1])
          }
          fullWidth
          className="min-h-[44px] md:min-h-[40px] touch-manipulation"
        >
          {uploading ? '이미지 업로드 중...' : saving ? '저장 중...' : (myPublicAnswer ? '✏️ 수정 완료' : '✍️ 작성 완료')}
        </Button>
      </div>
    </div>
  )
}

export default WriteAnswerPage
