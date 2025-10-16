import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Loading from '../../components/common/Loading'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import { useAuthStore } from '../../store/authStore'

function AdminUsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      // Use RPC function to bypass RLS
      const { data, error } = await supabase.rpc('admin_get_all_users_secure', {
        p_user_id: currentUser?.id
      })

      if (error) {
        console.error('Error fetching users:', error)
        throw error
      }

      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('회원 목록을 불러오는 중 오류가 발생했습니다: ' + (error.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    // Prevent admin from deactivating themselves
    if (userId === currentUser?.id) {
      alert('자신의 계정은 비활성화할 수 없습니다')
      return
    }

    try {
      const functionName = currentStatus ? 'deactivate_user' : 'activate_user'
      const { error } = await supabase.rpc(functionName, { user_id: userId })

      if (error) throw error

      alert(currentStatus ? '회원이 비활성화되었습니다' : '회원이 활성화되었습니다')
      fetchUsers()
    } catch (error) {
      console.error('Error updating user status:', error)
      alert(error.message || '회원 상태 변경 중 오류가 발생했습니다')
    }
  }

  const handleDeleteClick = (user) => {
    if (user.id === currentUser?.id) {
      alert('자신의 계정은 삭제할 수 없습니다')
      return
    }
    setSelectedUser(user)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase.rpc('delete_user_permanently', {
        user_id: selectedUser.id
      })

      if (error) throw error

      alert('회원이 영구 삭제되었습니다')
      setDeleteModalOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.message || '회원 삭제 중 오류가 발생했습니다')
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
                <tr key={user.id} className="border-b hover:bg-gray-50">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        disabled={user.id === currentUser?.id}
                        className={`text-sm ${
                          user.id === currentUser?.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        {user.is_active ? '비활성화' : '활성화'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(user)}
                        disabled={user.id === currentUser?.id}
                        className={`text-sm ${
                          user.id === currentUser?.id
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="회원 삭제 확인"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            정말로 <strong>{selectedUser?.username}</strong> 회원을 영구 삭제하시겠습니까?
          </p>
          <p className="text-sm text-red-600">
            ⚠️ 이 작업은 되돌릴 수 없습니다. 회원의 모든 데이터가 삭제됩니다.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setDeleteModalOpen(false)}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
            >
              삭제
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminUsersPage
