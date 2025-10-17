import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'

function BestPostsPage() {
  const user = useAuthStore((state) => state.user)
  const isAdmin = user?.role === 'admin'
  const [winnerPeriods, setWinnerPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPostDetailModal, setShowPostDetailModal] = useState(false)

  useEffect(() => {
    fetchWinnerPeriods()
  }, [])

  const fetchWinnerPeriods = async () => {
    try {
      // First, fetch ended voting periods
      const { data: periods, error: periodsError } = await supabase
        .from('voting_periods')
        .select('*')
        .in('status', ['ended', 'published'])
        .not('winner_post_id', 'is', null)
        .order('end_date', { ascending: false })

      if (periodsError) {
        console.error('Error fetching periods:', periodsError)
        throw periodsError
      }

      // For each period, fetch the winner post with details
      const periodsWithWinners = []
      for (const period of periods || []) {
        if (!period.winner_post_id) continue

        const { data: post, error: postError } = await supabase
          .from('posts_nominations')
          .select(`
            *,
            author:users!nominator_id(username),
            votes(count)
          `)
          .eq('id', period.winner_post_id)
          .single()

        if (!postError && post) {
          periodsWithWinners.push({
            ...period,
            winner_post: post
          })
        }
      }

      setWinnerPeriods(periodsWithWinners)
    } catch (error) {
      console.error('Error fetching winner periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostClick = (post) => {
    setSelectedPost(post)
    setShowPostDetailModal(true)
  }

  const handleDeleteWinner = async (period) => {
    const confirmMessage = `"${period.title || '베스트 글 투표'}"의 우승작을 삭제하시겠습니까?\n\n우승작: ${period.winner_post?.title}\n\n⚠️ 이 작업은 되돌릴 수 없으며, 해당 투표 기간의 우승자 정보가 제거됩니다.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      // Remove winner_post_id from voting period
      const { error: updateError } = await supabase
        .from('voting_periods')
        .update({ winner_post_id: null })
        .eq('id', period.id)

      if (updateError) {
        console.error('Error removing winner:', updateError)
        throw updateError
      }

      alert('우승작이 제거되었습니다. 해당 투표는 베스트 글 목록에서 사라집니다.')
      fetchWinnerPeriods()
    } catch (error) {
      console.error('Error deleting winner:', error)
      alert('우승작 제거 중 오류가 발생했습니다: ' + error.message)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">베스트 글</h1>
      <p className="text-gray-600 mb-8">
        역대 투표에서 선정된 베스트 글을 확인하세요
      </p>

      {/* Post Detail Modal */}
      {showPostDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 border-b mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                      🏆 베스트 글
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {selectedPost.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>작성자: {selectedPost.author_name || selectedPost.author?.username}</span>
                    <span>•</span>
                    <span>제출: {selectedPost.author?.username}</span>
                    <span>•</span>
                    <span>{formatDate(selectedPost.created_at)}</span>
                    <span>•</span>
                    <span className="font-semibold text-green-600">
                      추천 {selectedPost.votes?.[0]?.count || 0}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPostDetailModal(false)
                    setSelectedPost(null)
                  }}
                >
                  닫기
                </Button>
              </div>
            </div>

            {/* Image if exists */}
            {selectedPost.image_url && (
              <div className="mb-6">
                <img
                  src={selectedPost.image_url}
                  alt={selectedPost.title}
                  className="w-full max-w-3xl h-auto rounded-lg border border-gray-200 mx-auto"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {selectedPost.content}
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Winner Posts List */}
      {winnerPeriods.length > 0 ? (
        <div className="space-y-6">
          {winnerPeriods.map((period) => {
            const post = period.winner_post
            if (!post) return null

            return (
              <Card key={period.id} className="hover:shadow-lg transition">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="text-4xl">🏆</div>
                  </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {period.title || '베스트 글 투표'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(period.end_date, 'yyyy년 MM월 dd일')} 종료
                      </span>
                    </div>
                    <h3
                      className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 cursor-pointer"
                      onClick={() => handlePostClick(post)}
                    >
                      {post.title}
                    </h3>

                    {/* Image preview if exists */}
                    {post.image_url && (
                      <div className="mb-4">
                        <img
                          src={post.image_url}
                          alt={post.title}
                          className="w-full max-w-md h-auto rounded-lg border border-gray-200 cursor-pointer"
                          onClick={() => handlePostClick(post)}
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                      </div>
                    )}

                    <p className="text-gray-600 mb-4 whitespace-pre-line line-clamp-3">
                      {post.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>작성자: {post.author_name || post.author?.username}</span>
                        <span>•</span>
                        <span>제출: {post.author?.username}</span>
                        <span>•</span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-green-600">
                          {post.votes?.[0]?.count || 0}
                        </span>
                        <span className="text-sm text-gray-500">추천</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePostClick(post)}
                      >
                        전문 보기
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWinner(period)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              아직 선정된 베스트 글이 없습니다
            </p>
            <p className="text-gray-400 text-sm">
              투표가 종료되면 베스트 글이 이곳에 표시됩니다
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

export default BestPostsPage
