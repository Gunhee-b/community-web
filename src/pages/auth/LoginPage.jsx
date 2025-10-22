import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { loginUser } from '../../utils/auth'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await loginUser(formData)
      setUser(userData)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-2">ING:K</h1>
          <p className="text-gray-600">커뮤니티에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="닉네임"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="닉네임을 입력하세요"
            required
          />

          <Input
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="비밀번호를 입력하세요"
            required
          />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
