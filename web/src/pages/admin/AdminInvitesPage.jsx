import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { formatDate } from '../../utils/date'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loading from '../../components/common/Loading'

function AdminInvitesPage() {
  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [count, setCount] = useState(1)

  useEffect(() => {
    fetchInvites()
  }, [])

  const fetchInvites = async () => {
    try {
      const { data } = await supabase
        .from('invitation_codes')
        .select('*, used_by_user:users(username)')
        .order('created_at', { ascending: false })

      setInvites(data || [])
    } catch (error) {
      console.error('Error fetching invites:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCode = () => {
    // Generate 6-character alphanumeric code (uppercase letters + numbers)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return code
  }

  const createInvites = async () => {
    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)

      const inviteCodes = Array.from({ length: parseInt(count) }, () => ({
        code: generateCode(),
        expires_at: expiresAt.toISOString(),
      }))

      await supabase.from('invitation_codes').insert(inviteCodes)

      fetchInvites()
      alert(`${count}개의 초대 코드가 생성되었습니다`)
      setCount(1)
    } catch (error) {
      console.error('Error creating invites:', error)
      alert('초대 코드 생성 중 오류가 발생했습니다')
    }
  }

  const invalidateCode = async (inviteId, code) => {
    if (!window.confirm(`초대 코드 "${code}"를 무효화하시겠습니까?\n\n이 코드는 더 이상 사용할 수 없게 됩니다.`)) {
      return
    }

    try {
      // Set expiration date to past to invalidate the code
      const pastDate = new Date('2000-01-01')

      const { error } = await supabase
        .from('invitation_codes')
        .update({ expires_at: pastDate.toISOString() })
        .eq('id', inviteId)

      if (error) {
        console.error('Error invalidating code:', error)
        throw error
      }

      fetchInvites()
      alert('초대 코드가 무효화되었습니다')
    } catch (error) {
      console.error('Error invalidating code:', error)
      alert('초대 코드 무효화 중 오류가 발생했습니다')
    }
  }

  const deleteCode = async (inviteId, code) => {
    if (!window.confirm(`초대 코드 "${code}"를 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return
    }

    try {
      console.log('Attempting to delete invite code:', inviteId, code)

      const { data, error } = await supabase
        .from('invitation_codes')
        .delete()
        .eq('id', inviteId)
        .select()

      if (error) {
        console.error('Supabase error deleting code:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        throw error
      }

      console.log('Deleted invite code:', data)
      fetchInvites()
      alert('초대 코드가 삭제되었습니다')
    } catch (error) {
      console.error('Error deleting code:', error)
      alert(`초대 코드 삭제 중 오류가 발생했습니다: ${error.message || error}`)
    }
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div>
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">초대 코드 관리</h1>

      <Card className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          새 초대 코드 생성
        </h2>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <Input
              label="생성 개수"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </div>
          <Button onClick={createInvites} className="mb-4">
            생성하기
          </Button>
        </div>
        <p className="text-sm text-gray-600">
          생성된 코드는 7일간 유효합니다
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold text-gray-900 mb-4">초대 코드 목록</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">코드</th>
                <th className="text-left py-3 px-4">생성일</th>
                <th className="text-left py-3 px-4">만료일</th>
                <th className="text-left py-3 px-4">상태</th>
                <th className="text-left py-3 px-4">사용자</th>
                <th className="text-left py-3 px-4">관리</th>
              </tr>
            </thead>
            <tbody>
              {invites.map((invite) => {
                const isExpired = new Date(invite.expires_at) < new Date()
                const isUsed = invite.is_used
                const isValid = !isExpired && !isUsed

                return (
                  <tr key={invite.id} className="border-b">
                    <td className="py-3 px-4 font-mono font-bold text-lg">
                      {invite.code}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(invite.created_at, 'yyyy-MM-dd')}
                    </td>
                    <td className="py-3 px-4">
                      {formatDate(invite.expires_at, 'yyyy-MM-dd')}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          isUsed
                            ? 'bg-gray-100 text-gray-700'
                            : isExpired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isUsed ? '사용됨' : isExpired ? '만료됨' : '사용 가능'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {invite.used_by_user?.username || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {isValid && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => invalidateCode(invite.id, invite.code)}
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          >
                            무효화
                          </Button>
                        )}
                        {!isUsed && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteCode(invite.id, invite.code)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            삭제
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AdminInvitesPage
