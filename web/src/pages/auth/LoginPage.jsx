import { useState } from 'react'
import SocialLoginButtons from '../../components/auth/SocialLoginButtons'

function LoginPage() {
  const [error, setError] = useState('')

  const handleSocialLoginSuccess = (result) => {
    // Social login will redirect, so no need to navigate here
    console.log('Social login initiated:', result)
  }

  const handleSocialLoginError = (error) => {
    setError(error.message)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-2">Rezom</h1>
          <p className="text-gray-600">커뮤니티에 로그인하세요</p>
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

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            소셜 로그인을 통해 간편하게 가입하고 로그인하세요
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
