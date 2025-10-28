import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { formatDate } from '../utils/date'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Modal from '../components/common/Modal'
import { supabase } from '../lib/supabase'

function ProfilePage() {
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEditClick = () => {
    setNewUsername(user?.username || '')
    setError('')
    setIsEditModalOpen(true)
  }

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      setError('닉네임을 입력해주세요')
      return
    }

    if (newUsername.length < 2 || newUsername.length > 20) {
      setError('닉네임은 2-20자 사이여야 합니다')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data, error: rpcError } = await supabase.rpc('update_username', {
        p_user_id: user.id,
        p_new_username: newUsername.trim()
      })

      if (rpcError) {
        throw new Error(rpcError.message || '닉네임 변경 중 오류가 발생했습니다')
      }

      if (!data.success) {
        throw new Error(data.error || '닉네임 변경 중 오류가 발생했습니다')
      }

      // Update user in store
      setUser(data.user)
      setIsEditModalOpen(false)
      alert('닉네임이 성공적으로 변경되었습니다')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">내 프로필</h1>

      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-gray-600 font-medium">사이트 닉네임</span>
            <div className="flex items-center gap-3">
              <span className="text-gray-900 font-semibold">{user?.username}</span>
              <button
                onClick={handleEditClick}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                수정
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-gray-600 font-medium">역할</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                user?.role === 'admin'
                  ? 'bg-blue-100 text-blue-700'
                  : user?.role === 'meeting_host'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {user?.role === 'admin' ? '관리자' : user?.role === 'meeting_host' ? '모임장' : '일반 회원'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-medium">가입일</span>
            <span className="text-gray-900">
              {formatDate(user?.created_at, 'yyyy년 MM월 dd일')}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">활동 통계</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold text-blue-600 mb-1">-</div>
            <div className="text-sm text-gray-600">투표 참여</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold text-green-600 mb-1">-</div>
            <div className="text-sm text-gray-600">글 추천</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">
              {user?.meeting_participation_count || 0}
            </div>
            <div className="text-sm text-gray-600">모임 참여</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">-</div>
            <div className="text-sm text-gray-600">모임 주최</div>
          </div>
        </div>
      </Card>

      {/* 닉네임 수정 모달 */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="닉네임 수정"
      >
        <div className="space-y-4">
          <Input
            label="새 닉네임"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="2-20자 (한글, 영문, 숫자)"
            error={error}
            maxLength={20}
          />

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              닉네임 변경 안내
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• 닉네임은 2-20자 사이여야 합니다</li>
              <li>• 한글, 영문, 숫자를 사용할 수 있습니다</li>
              <li>• 중복된 닉네임은 사용할 수 없습니다</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              onClick={handleUpdateUsername}
              disabled={loading}
            >
              {loading ? '변경 중...' : '변경'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProfilePage
