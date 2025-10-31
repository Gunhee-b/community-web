import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { linkSocialAccountToUser, getSocialConnections } from '../../utils/socialAuth'
import SocialLoginButtons from '../../components/auth/SocialLoginButtons'
import Button from '../../components/common/Button'

/**
 * Link Account Page
 *
 * This page is for existing users to link their social accounts.
 * It shows which social accounts are already linked and allows linking new ones.
 */
function LinkAccountPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const [connections, setConnections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    loadConnections()
  }, [user, navigate])

  const loadConnections = async () => {
    try {
      setLoading(true)
      const data = await getSocialConnections(user.id)
      setConnections(data)
    } catch (err) {
      console.error('Failed to load connections:', err)
      setError('연동 정보를 불러오지 못했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLinkSuccess = () => {
    // Reload connections after successful link
    loadConnections()
  }

  const handleSocialLinkError = (error) => {
    setError(error.message)
  }

  const isProviderLinked = (provider) => {
    return connections.some((conn) => conn.provider === provider)
  }

  const getProviderName = (provider) => {
    const names = {
      google: 'Google',
      kakao: '카카오',
      facebook: 'Facebook',
      local: '일반 로그인',
    }
    return names[provider] || provider
  }

  const getProviderIcon = (provider) => {
    switch (provider) {
      case 'google':
        return '🔵'
      case 'kakao':
        return '💛'
      case 'facebook':
        return '🔷'
      case 'local':
        return '👤'
      default:
        return '🔗'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <p className="text-center text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">소셜 계정 연동</h1>
          <p className="text-gray-600">
            소셜 계정을 연동하면 더 쉽게 로그인할 수 있습니다.
          </p>
        </div>

        {/* Migration Notice */}
        {user?.provider === 'local' && connections.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  소셜 로그인으로 전환하세요
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    더 안전하고 편리한 소셜 로그인으로 전환하는 것을 권장합니다.
                    아래에서 원하는 소셜 계정을 연동해보세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Connections */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">연동된 계정</h2>

          {connections.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">연동된 소셜 계정이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getProviderIcon(conn.provider)}</span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getProviderName(conn.provider)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {conn.email || conn.display_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium">연동됨</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Link New Account */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">새 계정 연동</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            {/* Filter out already linked providers */}
            <div className="space-y-3">
              {!isProviderLinked('google') && (
                <button
                  onClick={() =>
                    linkSocialAccountToUser(user.id, 'google')
                      .then(handleSocialLinkSuccess)
                      .catch(handleSocialLinkError)
                  }
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="text-2xl">🔵</span>
                  <span className="text-gray-700 font-medium">Google 계정 연동</span>
                </button>
              )}

              {!isProviderLinked('kakao') && (
                <button
                  onClick={() =>
                    linkSocialAccountToUser(user.id, 'kakao')
                      .then(handleSocialLinkSuccess)
                      .catch(handleSocialLinkError)
                  }
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors"
                >
                  <span className="text-2xl">💛</span>
                  <span className="text-[#3C1E1E] font-medium">카카오 계정 연동</span>
                </button>
              )}

              {!isProviderLinked('facebook') && (
                <button
                  onClick={() =>
                    linkSocialAccountToUser(user.id, 'facebook')
                      .then(handleSocialLinkSuccess)
                      .catch(handleSocialLinkError)
                  }
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <span className="text-2xl">🔷</span>
                  <span className="font-medium">Facebook 계정 연동</span>
                </button>
              )}
            </div>

            {isProviderLinked('google') &&
              isProviderLinked('kakao') &&
              isProviderLinked('facebook') && (
                <p className="text-center text-gray-500 py-4">
                  모든 소셜 계정이 연동되었습니다
                </p>
              )}
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline">
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LinkAccountPage
