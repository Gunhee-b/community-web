import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import NotificationBell from './NotificationBell'

function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-app mx-auto px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                통찰방
              </Link>
              <nav className="flex space-x-4">
                <Link
                  to="/"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') && location.pathname === '/'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  홈
                </Link>
                <Link
                  to="/vote"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/vote')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  베스트 글 투표
                </Link>
                <Link
                  to="/best-posts"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/best-posts')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  베스트 글
                </Link>
                <Link
                  to="/meetings"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/meetings')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  오프라인 모임
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin')
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    관리자
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <span className="text-sm text-gray-700">{user?.username}님</span>
              <Link
                to="/profile"
                className="text-sm text-gray-700 hover:text-blue-600"
              >
                프로필
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-red-600"
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

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-app mx-auto px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 통찰방 커뮤니티. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
