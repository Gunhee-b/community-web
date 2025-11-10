import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Loading from '../../components/common/Loading'

function AdminVotesPage() {
  const [votingPeriods, setVotingPeriods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPeriodPosts, setSelectedPeriodPosts] = useState(null)
  const [showPostsModal, setShowPostsModal] = useState(false)
  const [newPeriodData, setNewPeriodData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
  })
  const [selectedPost, setSelectedPost] = useState(null)
  const [showPostDetailModal, setShowPostDetailModal] = useState(false)

  useEffect(() => {
    fetchVotingPeriods()
  }, [])

  useEffect(() => {
    // Auto-fill dates with 2-week period
    if (showCreateModal && !newPeriodData.startDate) {
      const today = new Date()
      const twoWeeksLater = new Date()
      twoWeeksLater.setDate(today.getDate() + 14)

      setNewPeriodData({
        title: `Rezom ${today.getMonth() + 1}월-${Math.ceil(today.getDate() / 15)} 베스트 글 투표`,
        description: '가장 통찰력 있는 글에 투표해주세요!',
        startDate: today.toISOString().split('T')[0],
        endDate: twoWeeksLater.toISOString().split('T')[0],
      })
    }
  }, [showCreateModal])

  const fetchVotingPeriods = async () => {
    try {
      const { data } = await supabase
        .from('voting_periods')
        .select('*, winner:posts_nominations(title), posts:posts_nominations(count)')
        .order('created_at', { ascending: false })

      setVotingPeriods(data || [])
    } catch (error) {
      console.error('Error fetching voting periods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePeriod = async (e) => {
    e.preventDefault()

    if (!newPeriodData.title.trim()) {
      alert('제목을 입력해주세요')
      return
    }

    try {
      const startDate = new Date(newPeriodData.startDate + 'T00:00:00+09:00')
      const endDate = new Date(newPeriodData.endDate + 'T23:59:59+09:00')

      // Try to insert with title and description first
      let insertData = {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
      }

      // Try with title and description
      if (newPeriodData.title) {
        insertData.title = newPeriodData.title
      }
      if (newPeriodData.description) {
        insertData.description = newPeriodData.description
      }

      let { data, error } = await supabase
        .from('voting_periods')
        .insert([insertData])
        .select()

      // If description column doesn't exist, retry without it
      if (error && error.message.includes('description')) {
        console.log('Description column not found, retrying without it...')
        insertData = {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
        }
        if (newPeriodData.title) {
          insertData.title = newPeriodData.title
        }

        const retry = await supabase
          .from('voting_periods')
          .insert([insertData])
          .select()

        data = retry.data
        error = retry.error
      }

      // If title column also doesn't exist, retry with only required fields
      if (error && error.message.includes('title')) {
        console.log('Title column not found, using only required fields...')
        insertData = {
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active',
        }

        const retry = await supabase
          .from('voting_periods')
          .insert([insertData])
          .select()

        data = retry.data
        error = retry.error
      }

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Created voting period:', data)
      setShowCreateModal(false)
      setNewPeriodData({ title: '', description: '', startDate: '', endDate: '' })
      fetchVotingPeriods()
      alert('새 투표 기간이 생성되었습니다')
    } catch (error) {
      console.error('Error creating voting period:', error)
      alert(`투표 기간 생성 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  const handleDeletePeriod = async (periodId) => {
    // Safety check
    if (!periodId) {
      alert('삭제할 투표 ID가 없습니다.')
      return
    }

    // Find the period to show details in confirmation
    const period = votingPeriods.find(p => p.id === periodId)
    if (!period) {
      alert('투표를 찾을 수 없습니다.')
      return
    }

    const confirmMessage = `다음 투표를 삭제하시겠습니까?\n\n제목: ${period.title || '베스트 글 투표'}\n기간: ${formatDate(period.start_date, 'yyyy-MM-dd')} ~ ${formatDate(period.end_date, 'yyyy-MM-dd')}\n\n⚠️ 이 작업은 되돌릴 수 없으며, 관련된 모든 글과 투표가 삭제됩니다.`

    if (!window.confirm(confirmMessage)) {
      return
    }

    try {
      console.log('Attempting to delete period:', periodId)

      // Double check we have a valid UUID
      if (typeof periodId !== 'string' || periodId.length !== 36) {
        alert('잘못된 투표 ID입니다.')
        return
      }

      const { data, error } = await supabase
        .from('voting_periods')
        .delete()
        .eq('id', periodId)
        .select()

      console.log('Delete result:', { data, error })

      if (error) {
        console.error('Error deleting period:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        alert(`삭제 실패: ${error.message}`)
        return
      }

      if (data && data.length === 0) {
        alert('투표가 삭제되지 않았습니다. 이미 삭제되었거나 권한이 없습니다.')
        return
      }

      alert(`투표 "${period.title || '베스트 글 투표'}"가 삭제되었습니다.`)
      fetchVotingPeriods()
    } catch (error) {
      console.error('Error deleting voting period:', error)
      alert('투표 기간 삭제 중 오류가 발생했습니다: ' + error.message)
    }
  }

  const handleClosePeriod = async (periodId) => {
    if (!window.confirm('투표 기간을 종료하고 우승자를 선정하시겠습니까?')) {
      return
    }

    try {
      // Fetch all posts with vote counts for this period
      const { data: postsData, error: postsError } = await supabase
        .from('posts_nominations')
        .select(`
          *,
          votes(count)
        `)
        .eq('voting_period_id', periodId)

      if (postsError) {
        console.error('Error fetching posts:', postsError)
        throw postsError
      }

      // Find the maximum vote count
      let maxVotes = 0
      postsData?.forEach((post) => {
        const voteCount = post.votes?.[0]?.count || 0
        if (voteCount > maxVotes) {
          maxVotes = voteCount
        }
      })

      // Find all posts with the maximum votes (handle ties)
      const winners = postsData?.filter((post) => {
        const voteCount = post.votes?.[0]?.count || 0
        return voteCount === maxVotes && voteCount > 0
      }) || []

      // Create winner names string
      let winnerNames = ''
      if (winners.length > 0) {
        winnerNames = winners.map((post) => post.author_name || '익명').join(', ')
      }

      console.log('Winners:', winners)
      console.log('Winner names:', winnerNames)

      // Update voting period status and winner
      let updateData = {
        status: 'ended',
        winner_post_id: winners.length > 0 ? winners[0].id : null,
      }

      // Try to store winner names if the field exists
      if (winnerNames) {
        updateData.winner_names = winnerNames
      }

      let { error: updateError } = await supabase
        .from('voting_periods')
        .update(updateData)
        .eq('id', periodId)

      // If winner_names field doesn't exist, retry without it
      if (updateError && updateError.message && updateError.message.includes('winner_names')) {
        console.log('winner_names column not found, retrying without it...')
        updateData = {
          status: 'ended',
          winner_post_id: winners.length > 0 ? winners[0].id : null,
        }

        const retry = await supabase
          .from('voting_periods')
          .update(updateData)
          .eq('id', periodId)

        updateError = retry.error
      }

      if (updateError) {
        console.error('Error updating period:', updateError)
        throw updateError
      }

      fetchVotingPeriods()

      if (winners.length > 0) {
        alert(`투표가 종료되었습니다!\n\n우승자: ${winnerNames}\n추천 수: ${maxVotes}`)
      } else {
        alert('투표가 종료되었습니다.\n(제출된 글이 없거나 추천이 없습니다)')
      }
    } catch (error) {
      console.error('Error closing voting period:', error)
      alert('투표 기간 종료 중 오류가 발생했습니다')
    }
  }

  const handleViewPosts = async (periodId) => {
    try {
      // Fetch posts with vote counts for this period
      const { data: postsData, error } = await supabase
        .from('posts_nominations')
        .select(`
          *,
          author:users!nominator_id(username),
          votes(count)
        `)
        .eq('voting_period_id', periodId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
        throw error
      }

      // Sort by vote count (descending)
      const sortedPosts = (postsData || []).sort((a, b) => {
        const aVotes = a.votes?.[0]?.count || 0
        const bVotes = b.votes?.[0]?.count || 0
        return bVotes - aVotes
      })

      setSelectedPeriodPosts(sortedPosts)
      setShowPostsModal(true)
    } catch (error) {
      console.error('Error fetching posts:', error)
      alert('글 목록을 불러오는 중 오류가 발생했습니다')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">투표 관리</h1>
        <Button onClick={() => setShowCreateModal(true)}>새 투표 기간 생성</Button>
      </div>

      {/* Create Period Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">새 투표 기간 생성</h2>
            <form onSubmit={handleCreatePeriod} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  투표 제목 *
                </label>
                <input
                  type="text"
                  value={newPeriodData.title}
                  onChange={(e) =>
                    setNewPeriodData({ ...newPeriodData, title: e.target.value })
                  }
                  placeholder="예: Rezom 10월-1 베스트 글 투표"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  설명
                </label>
                <textarea
                  value={newPeriodData.description}
                  onChange={(e) =>
                    setNewPeriodData({ ...newPeriodData, description: e.target.value })
                  }
                  placeholder="투표에 대한 설명을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시작일 *
                  </label>
                  <input
                    type="date"
                    value={newPeriodData.startDate}
                    onChange={(e) =>
                      setNewPeriodData({ ...newPeriodData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    종료일 *
                  </label>
                  <input
                    type="date"
                    value={newPeriodData.endDate}
                    onChange={(e) =>
                      setNewPeriodData({ ...newPeriodData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" fullWidth>
                  생성하기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewPeriodData({ title: '', description: '', startDate: '', endDate: '' })
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Post Detail Modal */}
      {showPostDetailModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 border-b mb-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
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
                    setShowPostsModal(true)
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
                  className="w-full max-w-3xl h-auto rounded-lg border border-gray-200"
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

      {/* Posts List Modal */}
      {showPostsModal && selectedPeriodPosts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white pb-4 border-b mb-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  제출된 글 목록 (추천 순)
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowPostsModal(false)
                    setSelectedPeriodPosts(null)
                  }}
                >
                  닫기
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                총 {selectedPeriodPosts.length}개의 글이 제출되었습니다
              </p>
            </div>

            <div className="space-y-4">
              {selectedPeriodPosts.length > 0 ? (
                selectedPeriodPosts.map((post, index) => (
                  <Card key={post.id} className="bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 text-center">
                        <div className="text-2xl md:text-3xl font-bold text-blue-600">
                          {index + 1}
                        </div>
                        <div className="text-xs text-gray-500">순위</div>
                      </div>
                      <div className="flex-1">
                        <h3
                          className="text-lg font-bold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer"
                          onClick={() => {
                            setSelectedPost(post)
                            setShowPostDetailModal(true)
                            setShowPostsModal(false)
                          }}
                        >
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-3 whitespace-pre-line line-clamp-3">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>
                            작성자: {post.author_name || post.author?.username}
                          </span>
                          <span>•</span>
                          <span>제출: {post.author?.username}</span>
                          <span>•</span>
                          <span>{formatDate(post.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-center min-w-[80px]">
                        <div className="text-2xl font-bold text-green-600">
                          {post.votes?.[0]?.count || 0}
                        </div>
                        <div className="text-xs text-gray-500">추천</div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">아직 제출된 글이 없습니다</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Voting Periods List */}
      <div className="space-y-4">
        {votingPeriods.map((period) => (
          <Card key={period.id}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      period.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : period.status === 'ended'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {period.status === 'active'
                      ? '진행중'
                      : period.status === 'ended'
                      ? '종료'
                      : '결과 공개'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {period.title || '베스트 글 투표'}
                </h3>
                {period.description && (
                  <p className="text-gray-600 mb-2">{period.description}</p>
                )}
                <p className="text-gray-600 mb-1">
                  기간: {formatDate(period.start_date, 'yyyy-MM-dd')} ~{' '}
                  {formatDate(period.end_date, 'yyyy-MM-dd')}
                </p>
                <p className="text-gray-600">
                  제출된 글: {period.posts?.[0]?.count || 0}개
                </p>
                {period.status !== 'active' && period.winner_names && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-semibold text-yellow-800">
                      🏆 우승자: {period.winner_names}
                    </p>
                  </div>
                )}
                {period.status !== 'active' && !period.winner_names && period.winner && (
                  <p className="text-gray-600 mt-1">
                    우승작: {period.winner.title}
                  </p>
                )}
              </div>
              <div className="ml-4 flex flex-col space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPosts(period.id)}
                >
                  글 목록 보기
                </Button>
                {period.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleClosePeriod(period.id)}
                  >
                    투표 종료
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeletePeriod(period.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  삭제
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default AdminVotesPage
