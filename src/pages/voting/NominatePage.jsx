import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { validatePostTitle, validatePostContent } from '../../utils/validation'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'

function NominatePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [votingPeriod, setVotingPeriod] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchVotingPeriod()
  }, [])

  const fetchVotingPeriod = async () => {
    const { data } = await supabase
      .from('voting_periods')
      .select('*')
      .eq('status', 'active')
      .maybeSingle()

    setVotingPeriod(data)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    setErrors({
      ...errors,
      [name]: '',
    })
  }

  const validate = () => {
    const newErrors = {}
    const titleError = validatePostTitle(formData.title)
    if (titleError) newErrors.title = titleError

    const contentError = validatePostContent(formData.content)
    if (contentError) newErrors.content = contentError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    if (!votingPeriod) {
      alert('현재 진행 중인 투표가 없습니다')
      return
    }

    setLoading(true)

    try {
      await supabase.from('posts_nominations').insert([
        {
          title: formData.title,
          content: formData.content,
          nominator_id: user.id,
          voting_period_id: votingPeriod.id,
        },
      ])

      navigate('/vote')
    } catch (error) {
      console.error('Error nominating post:', error)
      alert('글 추천 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (!votingPeriod) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">글 추천하기</h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              현재 진행 중인 투표가 없습니다
            </p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">글 추천하기</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="글 제목"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="통찰을 담은 글의 제목을 입력하세요"
            error={errors.title}
            required
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              글 내용 <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="추천하고 싶은 글의 내용을 입력하세요&#10;(최대 2000자)"
              rows="10"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.content ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-500">{errors.content}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.content.length} / 2000자
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">추천 안내</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• 통찰력 있는 글을 추천해주세요</li>
              <li>• 커뮤니티 회원들이 투표로 베스트 글을 선정합니다</li>
              <li>• 중복 투표가 가능합니다</li>
            </ul>
          </div>

          <div className="flex space-x-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate('/vote')}
            >
              취소
            </Button>
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? '추천 중...' : '글 추천하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default NominatePage
