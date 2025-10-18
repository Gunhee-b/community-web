import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/authStore'
import { formatDate, getDday } from '../../utils/date'
import { uploadImage, validateImageFile } from '../../utils/storage'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'

function VotePage() {
  const user = useAuthStore((state) => state.user)
  const [votingPeriod, setVotingPeriod] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', author: '' })
  const [userVotes, setUserVotes] = useState(new Set()) // Store post IDs that user has voted for
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')

  useEffect(() => {
    fetchVotingData()
  }, [])

  const fetchVotingData = async () => {
    try {
      // Fetch active voting period
      const { data: periodData } = await supabase
        .from('voting_periods')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (periodData) {
        setVotingPeriod(periodData)

        // Fetch posts for this period with vote counts
        const { data: postsData } = await supabase
          .from('posts_nominations')
          .select(`
            *,
            author:users!nominator_id(username),
            votes(count)
          `)
          .eq('voting_period_id', periodData.id)
          .order('created_at', { ascending: false })

        setPosts(postsData || [])

        // Fetch posts that user has voted for (one vote per post)
        const { data: userVotesData } = await supabase
          .from('votes')
          .select('post_id')
          .eq('voting_period_id', periodData.id)
          .eq('user_id', user.id)

        // Create a Set of post IDs that user has voted for
        const votedPostIds = new Set(userVotesData?.map((vote) => vote.post_id) || [])
        setUserVotes(votedPostIds)
      }
    } catch (error) {
      console.error('Error fetching voting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setImageError(validation.error)
      return
    }

    setSelectedImage(file)
    setImageError('')

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
    setImageError('')
  }

  const handleSubmitPost = async (e) => {
    e.preventDefault()

    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.author.trim()) {
      alert('제목, 작성자, 본문을 모두 입력해주세요')
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
          setImageError(uploadResult.error)
          setLoading(false)
          return
        }

        imageUrl = uploadResult.url
      }

      const insertData = {
        title: newPost.title,
        content: newPost.content,
        nominator_id: user.id,
        voting_period_id: votingPeriod.id,
        image_url: imageUrl,
      }

      // Add author_name if the field exists
      if (newPost.author) {
        insertData.author_name = newPost.author
      }

      const { data, error } = await supabase
        .from('posts_nominations')
        .insert([insertData])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Submitted post:', data)
      setShowSubmitModal(false)
      setNewPost({ title: '', content: '', author: '' })
      setSelectedImage(null)
      setImagePreview(null)
      setImageError('')
      fetchVotingData()
      alert('글이 성공적으로 제출되었습니다!')
    } catch (error) {
      console.error('Error submitting post:', error)
      alert(`글 제출 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
      setUploadingImage(false)
    }
  }

  const handleVote = async (postId) => {
    try {
      const hasVoted = userVotes.has(postId)

      if (hasVoted) {
        // Remove vote (cancel)
        const { error } = await supabase
          .from('votes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .eq('voting_period_id', votingPeriod.id)

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        // Update local state
        const newVotes = new Set(userVotes)
        newVotes.delete(postId)
        setUserVotes(newVotes)
      } else {
        // Add vote
        const { error } = await supabase.from('votes').insert([
          {
            user_id: user.id,
            post_id: postId,
            voting_period_id: votingPeriod.id,
          },
        ])

        if (error) {
          console.error('Supabase error:', error)
          throw error
        }

        // Update local state
        const newVotes = new Set(userVotes)
        newVotes.add(postId)
        setUserVotes(newVotes)
      }

      // Refresh data to get updated vote counts
      fetchVotingData()
    } catch (error) {
      console.error('Error voting:', error)
      alert(`추천 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (!votingPeriod) {
    return (
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">
          베스트 글 투표
        </h1>
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              현재 진행 중인 투표가 없습니다
            </p>
            <p className="text-gray-400 text-sm mb-6">
              다음 투표 기간을 기다려주세요
            </p>
            <Link to="/">
              <Button>홈으로 돌아가기</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
          {votingPeriod?.title || '베스트 글 투표'}
        </h1>
        <Button onClick={() => setShowSubmitModal(true)}>글 제출하기</Button>
      </div>

      {/* Submit Post Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">글 제출하기</h2>
            <form onSubmit={handleSubmitPost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  제목 *
                </label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="글 제목을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  작성자 *
                </label>
                <input
                  type="text"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                  placeholder="원작자 이름을 입력하세요 (예: 홍길동, 김철수)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  복사한 글인 경우 원작자 이름을, 본인이 쓴 글인 경우 본인 이름을 입력하세요
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  본문 *
                </label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="통찰력 있는 글을 작성해주세요. 다른 곳에서 복사한 글도 괜찮습니다."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={12}
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

                {imageError && (
                  <p className="mt-1 text-sm text-red-500">{imageError}</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" fullWidth disabled={loading || uploadingImage}>
                  {uploadingImage
                    ? '이미지 업로드 중...'
                    : loading
                    ? '제출 중...'
                    : '제출하기'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowSubmitModal(false)
                    setNewPost({ title: '', content: '', author: '' })
                    setSelectedImage(null)
                    setImagePreview(null)
                    setImageError('')
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Voting Period Info */}
      <Card className="mb-8">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 mb-2">투표 기간</h2>
            {votingPeriod?.description && (
              <p className="text-gray-600 mb-2">{votingPeriod.description}</p>
            )}
            <p className="text-gray-600">
              {formatDate(votingPeriod.start_date, 'yyyy년 MM월 dd일')} -{' '}
              {formatDate(votingPeriod.end_date, 'yyyy년 MM월 dd일')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl md:text-3xl font-bold text-blue-600">
              {getDday(votingPeriod.end_date)}
            </div>
            <p className="text-sm text-gray-500 mt-1">종료까지</p>
          </div>
        </div>
      </Card>

      {/* Posts */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>

                  {/* Display image if exists */}
                  {post.image_url && (
                    <div className="mb-4">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full max-w-2xl h-auto rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}

                  <p className="text-gray-600 mb-4 whitespace-pre-line">{post.content}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>작성자: {post.author_name || post.author?.username}</span>
                    <span>•</span>
                    <span>제출: {post.author?.username}</span>
                    <span>•</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                </div>
                <div className="ml-6 flex flex-col items-center min-w-[100px]">
                  {userVotes.has(post.id) ? (
                    <Button
                      onClick={() => handleVote(post.id)}
                      size="sm"
                      className="mb-2 bg-green-600 hover:bg-green-700"
                    >
                      ✓ 추천함
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleVote(post.id)}
                      size="sm"
                      variant="outline"
                      className="mb-2"
                    >
                      추천하기
                    </Button>
                  )}
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        userVotes.has(post.id) ? 'text-green-600' : 'text-blue-600'
                      }`}
                    >
                      {post.votes?.[0]?.count || 0}
                    </div>
                    <div className="text-xs text-gray-500">추천</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">아직 제출된 글이 없습니다</p>
            <Button onClick={() => setShowSubmitModal(true)}>첫 글을 제출해보세요</Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default VotePage
