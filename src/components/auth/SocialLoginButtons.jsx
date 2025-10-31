import { useState } from 'react'
import { signInWithGoogle, signInWithFacebook, signInWithKakao } from '../../utils/socialAuth'

function SocialLoginButtons({ onSuccess, onError }) {
  const [loading, setLoading] = useState(null) // 'google', 'facebook', 'kakao', or null

  const handleSocialLogin = async (provider, loginFn) => {
    setLoading(provider)
    try {
      const result = await loginFn()
      if (onSuccess) {
        onSuccess(result)
      }
    } catch (error) {
      console.error(`${provider} login error:`, error)
      if (onError) {
        onError(error)
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-3">
      {/* Google Login */}
      <button
        onClick={() => handleSocialLogin('google', signInWithGoogle)}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span className="text-gray-700 font-medium">
          {loading === 'google' ? '로그인 중...' : 'Google로 계속하기'}
        </span>
      </button>

      {/* Kakao Login */}
      <button
        onClick={() => handleSocialLogin('kakao', signInWithKakao)}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#FEE500] rounded-lg hover:bg-[#FDD835] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'kakao' ? (
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#3C1E1E] rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#3C1E1E">
            <path d="M12 3C6.5 3 2 6.6 2 11c0 2.8 1.9 5.3 4.7 6.7-.2.7-.6 2.5-.7 2.9-.1.5.2.5.4.4.3-.1 3.1-2.1 3.6-2.4.6.1 1.3.2 2 .2 5.5 0 10-3.6 10-8S17.5 3 12 3z" />
          </svg>
        )}
        <span className="text-[#3C1E1E] font-medium">
          {loading === 'kakao' ? '로그인 중...' : '카카오로 계속하기'}
        </span>
      </button>

      {/* Facebook Login */}
      <button
        onClick={() => handleSocialLogin('facebook', signInWithFacebook)}
        disabled={loading !== null}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading === 'facebook' ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        <span className="font-medium">
          {loading === 'facebook' ? '로그인 중...' : 'Facebook으로 계속하기'}
        </span>
      </button>
    </div>
  )
}

export default SocialLoginButtons
