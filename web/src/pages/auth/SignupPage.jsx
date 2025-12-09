import { useState } from 'react'
import { Link } from 'react-router-dom'
import SocialLoginButtons from '../../components/auth/SocialLoginButtons'

function SignupPage() {
  const [error, setError] = useState('')

  const handleSocialLoginSuccess = (result) => {
    // Social login will redirect, so no need to navigate here
    console.log('Social signup initiated:', result)
  }

  const handleSocialLoginError = (error) => {
    setError(error.message)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-2">Rezom</h1>
          <p className="text-gray-600">커뮤니티에 가입하세요</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Social Login Buttons */}
        <SocialLoginButtons
          onSuccess={handleSocialLoginSuccess}
          onError={handleSocialLoginError}
        />

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 text-center">
            소셜 로그인으로 간편하게 가입하세요
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
