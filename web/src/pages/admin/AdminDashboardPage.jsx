import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'

function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    activeVotingPeriods: 0,
    activeMeetings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Active users
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Active voting periods
      const { count: activeVotingPeriods } = await supabase
        .from('voting_periods')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      // Active meetings
      const { count: activeMeetings } = await supabase
        .from('offline_meetings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'recruiting')

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        activeVotingPeriods: activeVotingPeriods || 0,
        activeMeetings: activeMeetings || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">관리자 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-blue-600 mb-2">
              {stats.totalUsers}
            </div>
            <div className="text-gray-600">전체 회원</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-green-600 mb-2">
              {stats.activeUsers}
            </div>
            <div className="text-gray-600">활성 회원</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-purple-600 mb-2">
              {stats.activeVotingPeriods}
            </div>
            <div className="text-gray-600">진행 중인 투표</div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 mb-2">
              {stats.activeMeetings}
            </div>
            <div className="text-gray-600">모집 중인 모임</div>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/votes"
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">투표 관리</div>
            <div className="text-sm text-gray-600">투표 기간 및 결과 관리</div>
          </a>

          <a
            href="/admin/users"
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="text-2xl mb-2">👥</div>
            <div className="font-medium text-gray-900">회원 관리</div>
            <div className="text-sm text-gray-600">회원 정보 및 제재 관리</div>
          </a>

          <a
            href="/admin/meetings"
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="text-2xl mb-2">🤝</div>
            <div className="font-medium text-gray-900">모임 관리</div>
            <div className="text-sm text-gray-600">모든 모임 조회 및 관리</div>
          </a>

          <a
            href="/admin/invites"
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <div className="text-2xl mb-2">🎫</div>
            <div className="font-medium text-gray-900">초대 코드</div>
            <div className="text-sm text-gray-600">초대 코드 생성 및 관리</div>
          </a>
        </div>
      </Card>
    </div>
  )
}

export default AdminDashboardPage
