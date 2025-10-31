import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { handleOAuthCallback, handleKakaoCallback } from '../../utils/socialAuth'
import Loading from '../../components/common/Loading'

function CallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const setUser = useAuthStore((state) => state.setUser)
  const setSession = useAuthStore((state) => state.setSession)
  const [error, setError] = useState(null)

  useEffect(() => {
    const processCallback = async () => {
      try {
        const state = searchParams.get('state')
        const code = searchParams.get('code')
        const errorParam = searchParams.get('error')

        // Check for error from OAuth provider
        if (errorParam) {
          throw new Error(searchParams.get('error_description') || '인증 중 오류가 발생했습니다')
        }

        // Handle Kakao callback
        if (state === 'kakao' && code) {
          const result = await handleKakaoCallback(code)

          if (result.success) {
            setUser(result.user)

            if (result.isNew) {
              // New user - redirect to welcome/profile completion
              navigate('/welcome', { state: { isNew: true } })
            } else {
              // Existing user - redirect to home
              navigate('/')
            }
          } else {
            throw new Error('카카오 인증 처리 실패')
          }
        }
        // Handle Google/Facebook callback
        else {
          const result = await handleOAuthCallback()

          if (result.success && result.user && result.session) {
            setUser(result.user)
            setSession(result.session)

            if (result.isNew) {
              // New user - redirect to welcome/profile completion
              navigate('/welcome', { state: { isNew: true } })
            } else {
              // Existing user - redirect to home
              navigate('/')
            }
          } else {
            throw new Error('인증 처리 실패')
          }
        }
      } catch (err) {
        console.error('Callback processing error:', err)
        setError(err.message || '인증 처리 중 오류가 발생했습니다')

        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    processCallback()
  }, [searchParams, navigate, setUser, setSession])

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">인증 실패</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <Loading />
          <h2 className="text-xl font-bold text-gray-900 mb-2 mt-4">인증 처리 중</h2>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    </div>
  )
}

export default CallbackPage
