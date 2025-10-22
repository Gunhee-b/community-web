import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { registerUser } from '../../utils/auth'
import {
  validateUsername,
  validatePassword,
  validateInvitationCode,
} from '../../utils/validation'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'

function SignupPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)

  const [formData, setFormData] = useState({
    invitationCode: '',
    username: '',
    password: '',
    passwordConfirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field
    setErrors({
      ...errors,
      [name]: '',
    })
    setGeneralError('')
  }

  const validate = () => {
    const newErrors = {}

    // Invitation code
    const codeError = validateInvitationCode(formData.invitationCode)
    if (codeError) newErrors.invitationCode = codeError

    // Username
    const usernameError = validateUsername(formData.username)
    if (usernameError) newErrors.username = usernameError

    // Password
    const passwordError = validatePassword(formData.password)
    if (passwordError) newErrors.password = passwordError

    // Password confirm
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = '비밀번호가 일치하지 않습니다'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validate()) {
      return
    }

    setLoading(true)

    try {
      const userData = await registerUser({
        username: formData.username,
        password: formData.password,
        invitationCode: formData.invitationCode,
      })
      setUser(userData)
      navigate('/')
    } catch (err) {
      setGeneralError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-600 mb-2">ING:K</h1>
          <p className="text-gray-600">커뮤니티에 가입하세요</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="초대 코드"
            name="invitationCode"
            value={formData.invitationCode}
            onChange={handleChange}
            placeholder="6자리 초대 코드 (영문 대문자 + 숫자)"
            error={errors.invitationCode}
            required
            maxLength={6}
          />

          <Input
            label="사이트 닉네임"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="2-20자 (한글, 영문, 숫자)"
            error={errors.username}
            required
          />

          <Input
            label="비밀번호"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="8-20자 (영문, 숫자, 특수문자 중 2가지 이상)"
            error={errors.password}
            required
          />

          <Input
            label="비밀번호 확인"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleChange}
            placeholder="비밀번호를 다시 입력하세요"
            error={errors.passwordConfirm}
            required
          />

          {generalError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
              {generalError}
            </div>
          )}

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm">
            <p className="font-medium mb-1">회원가입 안내</p>
            <ul className="list-disc list-inside text-xs space-y-1">
              <li>초대 코드는 7일간 유효합니다</li>
              <li>관리자 승인 후 활동 가능합니다</li>
            </ul>
          </div>

          <Button type="submit" fullWidth disabled={loading}>
            {loading ? '가입 처리 중...' : '회원가입'}
          </Button>
        </form>

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
