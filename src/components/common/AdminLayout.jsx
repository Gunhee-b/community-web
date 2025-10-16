import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import NotificationBell from './NotificationBell'

function AdminLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 shadow">
        <div className="max-w-app mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/admin" className="text-2xl font-bold text-white">
                관리자 대시보드
              </Link>
              <nav className="flex space-x-4">
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  대시보드
                </Link>
                <Link
                  to="/admin/votes"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/votes')
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  투표 관리
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/users')
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  회원 관리
                </Link>
                <Link
                  to="/admin/invites"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/admin/invites')
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-700'
                  }`}
                >
                  초대 코드
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="[&>div>button]:text-blue-100 [&>div>button:hover]:bg-blue-700">
                <NotificationBell />
              </div>
              <span className="text-sm text-blue-100">{user?.username}님</span>
              <Link
                to="/"
                className="text-sm text-blue-100 hover:text-white"
              >
                메인으로
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-blue-100 hover:text-white"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-app mx-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
