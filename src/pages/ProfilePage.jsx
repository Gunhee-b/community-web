import { useAuthStore } from '../store/authStore'
import { formatDate } from '../utils/date'
import Card from '../components/common/Card'

function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-8">내 프로필</h1>

      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-gray-600 font-medium">사이트 닉네임</span>
            <span className="text-gray-900 font-semibold">{user?.username}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b">
            <span className="text-gray-600 font-medium">카카오 닉네임</span>
            <span className="text-gray-900">{user?.kakao_nickname}</span>
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
            <div className="text-2xl md:text-3xl font-bold text-purple-600 mb-1">-</div>
            <div className="text-sm text-gray-600">모임 참여</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl md:text-3xl font-bold text-orange-600 mb-1">-</div>
            <div className="text-sm text-gray-600">모임 주최</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ProfilePage
