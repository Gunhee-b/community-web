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
  const [deletedUsers, setDeletedUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [deletionReason, setDeletionReason] = useState('')
  const [activeTab, setActiveTab] = useState('active') // 'active' or 'deleted'
  const [permanentDeleteModalOpen, setPermanentDeleteModalOpen] = useState(false)
  const [permanentDeleteConfirmText, setPermanentDeleteConfirmText] = useState('')
  const currentUser = useAuthStore((state) => state.user)

  useEffect(() => {
    fetchUsers()
    fetchDeletedUsers()
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

      // Filter out deleted users (they have deleted_at set)
      setUsers((data || []).filter(u => !u.deleted_at))
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('회원 목록을 불러오는 중 오류가 발생했습니다: ' + (error.message || ''))
    } finally {
      setLoading(false)
    }
  }

  const fetchDeletedUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_deleted_users', {
        p_admin_user_id: currentUser?.id
      })

      if (error) {
        console.error('Error fetching deleted users:', error)
        throw error
      }

      // Check if data is an error response
      if (data && data.success === false) {
        console.error('Function returned error:', data.error)
        setDeletedUsers([])
        return
      }

      // data is JSONB array, parse it
      const deletedUsersArray = Array.isArray(data) ? data : []
      setDeletedUsers(deletedUsersArray)
    } catch (error) {
      console.error('Error fetching deleted users:', error)
      // Don't alert for this error, just log it
      setDeletedUsers([])
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
      console.log('🗑️ Deleting user:', {
        user_id: selectedUser.id,
        username: selectedUser.username,
        admin_id: currentUser.id,
        reason: deletionReason
      })

      const { data, error } = await supabase.rpc('soft_delete_user', {
        p_user_id: selectedUser.id,
        p_admin_user_id: currentUser.id,
        p_deletion_reason: deletionReason || null
      })

      console.log('🗑️ Delete response:', { data, error })

      if (error) {
        console.error('Delete error details:', error)
        throw error
      }

      // Check if function returned an error
      if (data && data.success === false) {
        console.error('❌ Delete failed:', data.error)
        alert(`삭제 실패: ${data.error}`)

        // If user is already deleted, refresh the lists
        if (data.error.includes('already deleted')) {
          await fetchUsers()
          await fetchDeletedUsers()
        }

        setDeleteModalOpen(false)
        setSelectedUser(null)
        setDeletionReason('')
        return
      }

      if (data && data.success === true) {
        console.log('✅ Delete successful:', data)
        alert('회원이 삭제되었습니다 (복구 가능)')
      }

      setDeleteModalOpen(false)
      setSelectedUser(null)
      setDeletionReason('')

      // Refresh both lists
      await fetchUsers()
      await fetchDeletedUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error.message || '회원 삭제 중 오류가 발생했습니다')
    }
  }

  const handleRestoreUser = async (userId, username) => {
    if (!confirm(`${username} 회원을 복구하시겠습니까?`)) {
      return
    }

    try {
      console.log('♻️ Restoring user:', { user_id: userId, username, admin_id: currentUser.id })

      const { data, error } = await supabase.rpc('restore_deleted_user', {
        p_user_id: userId,
        p_admin_user_id: currentUser.id
      })

      console.log('♻️ Restore response:', { data, error })

      if (error) {
        console.error('Restore error details:', error)
        throw error
      }

      // Check if function returned an error
      if (data && data.success === false) {
        console.error('❌ Restore failed:', data.error)
        alert(`복구 실패: ${data.error}`)
        return
      }

      if (data && data.success === true) {
        console.log('✅ Restore successful:', data)
        alert('회원이 성공적으로 복구되었습니다')
      }

      await fetchUsers()
      await fetchDeletedUsers()
    } catch (error) {
      console.error('Error restoring user:', error)
      alert(error.message || '회원 복구 중 오류가 발생했습니다')
    }
  }

  const handlePermanentDeleteClick = (user) => {
    setSelectedUser(user)
    setPermanentDeleteConfirmText('')
    setPermanentDeleteModalOpen(true)
  }

  const handlePermanentDeleteConfirm = async () => {
    if (!selectedUser) return

    // Require exact username match for confirmation
    if (permanentDeleteConfirmText !== selectedUser.username) {
      alert('닉네임이 일치하지 않습니다. 정확히 입력해주세요.')
      return
    }

    try {
      console.log('💀 Permanently deleting user:', {
        user_id: selectedUser.user_id,
        username: selectedUser.username,
        admin_id: currentUser.id
      })

      const { data, error } = await supabase.rpc('permanently_delete_user', {
        p_user_id: selectedUser.user_id,
        p_admin_user_id: currentUser.id,
        p_confirm_permanent_deletion: true
      })

      console.log('💀 Permanent delete response:', { data, error })

      if (error) {
        console.error('Permanent delete error details:', error)
        throw error
      }

      // Check if function returned an error
      if (data && data.success === false) {
        console.error('❌ Permanent delete failed:', data.error)
        alert(`영구 삭제 실패: ${data.error}`)
        return
      }

      if (data && data.success === true) {
        console.log('✅ Permanent delete successful:', data)
        alert(`회원이 영구적으로 삭제되었습니다.\n\n⚠️ ${data.warning || '이 작업은 되돌릴 수 없습니다.'}`)
      }

      setPermanentDeleteModalOpen(false)
      setSelectedUser(null)
      setPermanentDeleteConfirmText('')

      // Refresh both lists
      await fetchUsers()
      await fetchDeletedUsers()
    } catch (error) {
      console.error('Error permanently deleting user:', error)
      alert(error.message || '영구 삭제 중 오류가 발생했습니다')
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

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'active'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          활성 회원 ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('deleted')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeTab === 'deleted'
              ? 'border-b-2 border-red-500 text-red-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          삭제된 회원 ({deletedUsers.length})
        </button>
      </div>

      {activeTab === 'active' ? (
        <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">닉네임</th>
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
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">닉네임</th>
                  <th className="text-left py-3 px-4">역할</th>
                  <th className="text-left py-3 px-4">삭제일</th>
                  <th className="text-left py-3 px-4">삭제자</th>
                  <th className="text-left py-3 px-4">삭제 사유</th>
                  <th className="text-left py-3 px-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {deletedUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-gray-500">
                      삭제된 회원이 없습니다
                    </td>
                  </tr>
                ) : (
                  deletedUsers.map((user) => (
                    <tr key={user.user_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getRoleBadgeClass(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {formatDate(user.deleted_at, 'yyyy-MM-dd HH:mm')}
                      </td>
                      <td className="py-3 px-4">
                        {user.deleted_by_username || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {user.deletion_reason || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRestoreUser(user.user_id, user.username)}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            복구
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handlePermanentDeleteClick(user)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium"
                          >
                            영구 삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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

      {/* Permanent Delete Confirmation Modal */}
      <Modal
        isOpen={permanentDeleteModalOpen}
        onClose={() => {
          setPermanentDeleteModalOpen(false)
          setPermanentDeleteConfirmText('')
        }}
        title="⚠️ 영구 삭제 확인"
      >
        <div className="space-y-4">
          <div className="bg-red-50 border-2 border-red-200 p-4 rounded-lg">
            <p className="text-red-800 font-bold text-lg mb-2">
              ⚠️ 위험: 이 작업은 되돌릴 수 없습니다!
            </p>
            <p className="text-red-700 text-sm">
              <strong>{selectedUser?.username}</strong> 회원의 모든 데이터가 영구적으로 삭제됩니다.
            </p>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm font-semibold text-gray-800 mb-2">삭제될 데이터:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✗ 회원 계정 정보</li>
              <li>✗ 작성한 게시글 및 댓글</li>
              <li>✗ 투표 기록</li>
              <li>✗ 모임 참여 기록</li>
              <li>✗ 채팅 메시지</li>
              <li>✓ 아카이브 기록은 보존됨 (감사 추적용)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              확인을 위해 회원의 닉네임을 정확히 입력해주세요:
            </label>
            <p className="text-sm text-gray-600 mb-2">
              입력할 닉네임: <strong className="text-red-600">{selectedUser?.username}</strong>
            </p>
            <input
              type="text"
              value={permanentDeleteConfirmText}
              onChange={(e) => setPermanentDeleteConfirmText(e.target.value)}
              placeholder={selectedUser?.username}
              className="w-full px-3 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              autoComplete="off"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setPermanentDeleteModalOpen(false)
                setPermanentDeleteConfirmText('')
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handlePermanentDeleteConfirm}
              disabled={permanentDeleteConfirmText !== selectedUser?.username}
            >
              영구 삭제 실행
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setDeletionReason('')
        }}
        title="회원 삭제 확인"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            <strong>{selectedUser?.username}</strong> 회원을 삭제하시겠습니까?
          </p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Soft Delete (복구 가능)</strong>
            </p>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• 회원 데이터는 완전히 백업됩니다</li>
              <li>• 회원은 즉시 로그인할 수 없게 됩니다</li>
              <li>• 언제든지 "삭제된 회원" 탭에서 복구 가능합니다</li>
              <li>• 모든 관련 데이터가 보존됩니다</li>
            </ul>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              삭제 사유 (선택사항)
            </label>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="예: 커뮤니티 가이드라인 위반, 본인 요청 등"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setDeleteModalOpen(false)
                setDeletionReason('')
              }}
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
