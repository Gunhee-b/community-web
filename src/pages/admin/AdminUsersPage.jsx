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
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
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
      const { error } = await supabase.rpc(functionName, {
        user_id: userId,
        admin_user_id: currentUser.id
      })

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
        user_id: selectedUser.id,
        admin_user_id: currentUser.id
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

  const handleRoleClick = (user) => {
    if (user.id === currentUser?.id) {
      alert('자신의 역할은 변경할 수 없습니다')
      return
    }
    setSelectedUser(user)
    setNewRole(user.role)
    setRoleModalOpen(true)
  }

  const handleRoleChange = async () => {
    if (!selectedUser || !newRole) return

    try {
      console.log('Calling change_user_role with:', {
        p_user_id: selectedUser.id,
        p_new_role: newRole,
        p_admin_user_id: currentUser.id
      })

      const { data, error } = await supabase.rpc('change_user_role', {
        p_user_id: selectedUser.id,
        p_new_role: newRole,
        p_admin_user_id: currentUser.id
      })

      console.log('RPC response:', { data, error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      if (!data) {
        throw new Error('서버로부터 응답이 없습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '역할 변경 중 오류가 발생했습니다')
      }

      alert('회원 역할이 변경되었습니다')
      setRoleModalOpen(false)
      setSelectedUser(null)
      setNewRole('')
      fetchUsers()
    } catch (error) {
      console.error('Error changing user role:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      alert(`역할 변경 실패: ${error.message || error.hint || error.details || '알 수 없는 오류'}`)
    }
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return '관리자'
      case 'meeting_host':
        return '모임장'
      case 'member':
        return '일반'
      default:
        return '일반'
    }
  }

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-700'
      case 'meeting_host':
        return 'bg-purple-100 text-purple-700'
      case 'member':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">회원 관리</h1>

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
                    <button
                      onClick={() => handleRoleClick(user)}
                      disabled={user.id === currentUser?.id}
                      className={`px-2 py-1 rounded text-xs ${getRoleBadgeClass(user.role)} ${
                        user.id === currentUser?.id ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80 cursor-pointer'
                      }`}
                    >
                      {getRoleLabel(user.role)}
                    </button>
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

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="회원 역할 변경"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong>{selectedUser?.username}</strong> 회원의 역할을 변경합니다.
          </p>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              새 역할 선택
            </label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="member">일반 회원</option>
              <option value="meeting_host">모임장</option>
              <option value="admin">관리자</option>
            </select>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>역할별 권한:</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• <strong>일반 회원:</strong> 기본 기능 사용</li>
              <li>• <strong>모임장:</strong> 모임 관리 권한 추가</li>
              <li>• <strong>관리자:</strong> 전체 시스템 관리 권한</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setRoleModalOpen(false)}
            >
              취소
            </Button>
            <Button
              onClick={handleRoleChange}
            >
              변경
            </Button>
          </div>
        </div>
      </Modal>

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
