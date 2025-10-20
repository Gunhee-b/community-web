import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'

function AdminQuestionsPage() {
  const user = useAuthStore((state) => state.user)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    content: '',
    image_url: '',
    external_link: '',
    reference_links: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    is_published: false
  })

  useEffect(() => {
    fetchQuestions()
  }, [])

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase
        .from('daily_questions')
        .select('*')
        .order('scheduled_date', { ascending: false })

      if (error) throw error
      setQuestions(data || [])
    } catch (error) {
      console.error('Error fetching questions:', error)
      alert('질문을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question)
      setFormData({
        title: question.title || '',
        short_description: question.short_description || '',
        content: question.content || '',
        image_url: question.image_url || '',
        external_link: question.external_link || '',
        reference_links: question.reference_links || '',
        scheduled_date: question.scheduled_date || new Date().toISOString().split('T')[0],
        is_published: question.is_published || false
      })
    } else {
      setEditingQuestion(null)
      setFormData({
        title: '',
        short_description: '',
        content: '',
        image_url: '',
        external_link: '',
        reference_links: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        is_published: false
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingQuestion(null)
    setFormData({
      title: '',
      short_description: '',
      content: '',
      image_url: '',
      external_link: '',
      reference_links: '',
      scheduled_date: new Date().toISOString().split('T')[0],
      is_published: false
    })
  }

  const handleSave = async () => {
    // 유효성 검사
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.')
      return
    }
    if (!formData.short_description.trim()) {
      alert('짧은 설명을 입력해주세요.')
      return
    }
    if (!formData.content.trim()) {
      alert('상세 내용을 입력해주세요.')
      return
    }
    if (!formData.scheduled_date) {
      alert('예약 날짜를 선택해주세요.')
      return
    }

    setSaving(true)
    try {
      if (editingQuestion) {
        // 수정
        const { error } = await supabase
          .from('daily_questions')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingQuestion.id)

        if (error) throw error
        alert('질문이 수정되었습니다.')
      } else {
        // 생성
        const { error } = await supabase
          .from('daily_questions')
          .insert({
            ...formData,
            created_by: user.id
          })

        if (error) throw error
        alert('질문이 생성되었습니다.')
      }

      handleCloseModal()
      fetchQuestions()
    } catch (error) {
      console.error('Error saving question:', error)
      alert('저장에 실패했습니다: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (questionId) => {
    if (!confirm('정말 이 질문을 삭제하시겠습니까?')) return

    try {
      const { error } = await supabase
        .from('daily_questions')
        .delete()
        .eq('id', questionId)

      if (error) throw error
      alert('질문이 삭제되었습니다.')
      fetchQuestions()
    } catch (error) {
      console.error('Error deleting question:', error)
      alert('삭제에 실패했습니다.')
    }
  }

  const handleTogglePublish = async (question) => {
    try {
      const { error } = await supabase
        .from('daily_questions')
        .update({
          is_published: !question.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', question.id)

      if (error) throw error
      fetchQuestions()
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert('상태 변경에 실패했습니다.')
    }
  }

  if (loading) return <Loading />

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">질문 관리</h1>
          <p className="text-gray-600">오늘의 질문을 생성하고 관리합니다</p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          + 새 질문 만들기
        </Button>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{questions.length}</div>
            <div className="text-sm text-gray-600 mt-1">전체 질문</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {questions.filter(q => q.is_published).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">발행됨</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600">
              {questions.filter(q => !q.is_published).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">미발행</div>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {questions.filter(q =>
                q.scheduled_date === new Date().toISOString().split('T')[0]
              ).length}
            </div>
            <div className="text-sm text-gray-600 mt-1">오늘의 질문</div>
          </div>
        </Card>
      </div>

      {/* 질문 목록 */}
      {questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((question) => {
            const isToday = question.scheduled_date === new Date().toISOString().split('T')[0]
            const isFuture = question.scheduled_date > new Date().toISOString().split('T')[0]

            return (
              <Card key={question.id} className={isToday ? 'ring-2 ring-blue-500' : ''}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {isToday && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          오늘의 질문
                        </span>
                      )}
                      {isFuture && (
                        <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                          예약됨
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        question.is_published
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {question.is_published ? '발행됨' : '미발행'}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {question.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {question.short_description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>예약일: {formatDate(question.scheduled_date, 'yyyy-MM-dd')}</span>
                      <span>생성일: {formatDate(question.created_at, 'yyyy-MM-dd HH:mm')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant={question.is_published ? 'outline' : 'primary'}
                      onClick={() => handleTogglePublish(question)}
                    >
                      {question.is_published ? '숨김' : '발행'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenModal(question)}
                    >
                      수정
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(question.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">생성된 질문이 없습니다</p>
            <Button onClick={() => handleOpenModal()}>첫 질문 만들기</Button>
          </div>
        </Card>
      )}

      {/* 질문 생성/수정 모달 */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingQuestion ? '질문 수정' : '새 질문 만들기'}
        size="large"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="질문의 제목을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              짧은 설명 (배너용) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.short_description}
              onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
              placeholder="배너에 표시될 짧은 설명 (100자 이내 권장)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.short_description.length}/200자
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상세 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="질문의 상세 내용을 입력하세요 (마크다운 지원)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이미지 URL
            </label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              외부 링크
            </label>
            <Input
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://example.com"
              type="url"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              참고 문헌 (JSON 형식)
            </label>
            <textarea
              value={formData.reference_links}
              onChange={(e) => setFormData({ ...formData, reference_links: e.target.value })}
              placeholder='[{"title": "참고 자료 1", "author": "저자명", "url": "https://..."}]'
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON 배열 형식으로 입력하세요. 예: {`[{"title": "제목", "author": "저자", "url": "링크"}]`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                예약 날짜 <span className="text-red-500">*</span>
              </label>
              <Input
                type="date"
                value={formData.scheduled_date}
                onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                발행 상태
              </label>
              <label className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="mr-2 h-4 w-4 text-blue-600"
                />
                <span className="text-sm text-gray-700">발행하기</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleCloseModal} variant="outline" fullWidth>
              취소
            </Button>
            <Button onClick={handleSave} disabled={saving} fullWidth>
              {saving ? '저장 중...' : editingQuestion ? '수정' : '생성'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminQuestionsPage
