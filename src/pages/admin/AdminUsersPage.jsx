import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await supabase
        .from('users')
        .update({ is_active: !currentStatus })
        .eq('id', userId)

      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('회원 상태 변경 중 오류가 발생했습니다')
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">회원 관리</h1>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">닉네임</th>
                <th className="text-left py-3 px-4">카카오 닉네임</th>
                <th className="text-left py-3 px-4">역할</th>
                <th className="text-left py-3 px-4">가입일</th>
                <th className="text-left py-3 px-4">상태</th>
                <th className="text-left py-3 px-4">작업</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.kakao_nickname}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role === 'admin' ? '관리자' : '일반'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {formatDate(user.created_at, 'yyyy-MM-dd')}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {user.is_active ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggleUserStatus(user.id, user.is_active)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {user.is_active ? '비활성화' : '활성화'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminUsersPage
