import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { validatePostTitle, validatePostContent } from '../../utils/validation'
import { uploadImage, validateImageFile } from '../../utils/storage'
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
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

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

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setErrors({ ...errors, image: validation.error })
      return
    }

    setSelectedImage(file)
    setErrors({ ...errors, image: '' })

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setErrors({ ...errors, image: '' })
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
      let imageUrl = null

      // Upload image if selected
      if (selectedImage) {
        setUploadingImage(true)
        const uploadResult = await uploadImage(selectedImage, user.id)
        setUploadingImage(false)

        if (!uploadResult.success) {
          setErrors({ ...errors, image: uploadResult.error })
          setLoading(false)
          return
        }

        imageUrl = uploadResult.url
      }

      // Insert post with image URL
      await supabase.from('posts_nominations').insert([
        {
          title: formData.title,
          content: formData.content,
          nominator_id: user.id,
          voting_period_id: votingPeriod.id,
          image_url: imageUrl,
        },
      ])

      navigate('/vote')
    } catch (error) {
      console.error('Error nominating post:', error)
      alert('글 추천 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
      setUploadingImage(false)
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

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이미지 첨부 (선택)
            </label>

            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer block"
                >
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="mx-auto h-12 w-12"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">
                    클릭하여 이미지 선택
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP (최대 5MB)
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative border border-gray-300 rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-auto max-h-96 object-contain bg-gray-50"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-lg"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            )}

            {errors.image && (
              <p className="mt-1 text-sm text-red-500">{errors.image}</p>
            )}
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
            <Button type="submit" fullWidth disabled={loading || uploadingImage}>
              {uploadingImage
                ? '이미지 업로드 중...'
                : loading
                ? '추천 중...'
                : '글 추천하기'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default NominatePage
