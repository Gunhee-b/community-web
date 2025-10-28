import { useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { supabase } from '../../lib/supabase'
import NotificationBell from './NotificationBell'

function MainLayout() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Check if user is logged in
  const isLoggedIn = !!user

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProtectedLinkClick = (e, path) => {
    if (!isLoggedIn) {
      e.preventDefault()
      alert('로그인 후 이용 부탁드립니다')
      navigate('/login')
    }
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Desktop */}
      <header className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-app mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 active:bg-gray-200"
              aria-label="메뉴 열기"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="text-lg md:text-2xl font-bold text-blue-600">
              ING:K
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2 lg:space-x-4">
              <Link
                to="/"
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium ${
                  isActive('/') && location.pathname === '/'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                홈
              </Link>
              <Link
                to="/questions"
                onClick={(e) => handleProtectedLinkClick(e, '/questions')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium ${
                  isActive('/questions')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                질문모음
              </Link>
              <Link
                to="/vote"
                onClick={(e) => handleProtectedLinkClick(e, '/vote')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium ${
                  isActive('/vote')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                투표
              </Link>
              <Link
                to="/best-posts"
                onClick={(e) => handleProtectedLinkClick(e, '/best-posts')}
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium ${
                  isActive('/best-posts')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                베스트
              </Link>
              <Link
                to="/meetings"
                className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium ${
                  isActive('/meetings')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                모임
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className={`px-2 lg:px-3 py-2 rounded-md text-xs lg:text-sm font-medium ${
                    isActive('/admin')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  관리자
                </Link>
              )}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {isLoggedIn ? (
                <>
                  <NotificationBell />
                  <span className="hidden sm:inline text-xs md:text-sm text-gray-700">{user.username}님</span>
                  <Link
                    to="/profile"
                    className="hidden md:inline text-sm text-gray-700 hover:text-blue-600"
                  >
                    프로필
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="hidden md:inline text-sm text-gray-700 hover:text-red-600"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="hidden md:inline text-xs md:text-sm px-3 py-1.5 md:px-4 md:py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileMenu}
          />
          <div className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 shadow-xl md:hidden transform transition-transform duration-300">
            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-bold text-blue-600">메뉴</h2>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* User Info or Login Button */}
              {isLoggedIn ? (
                <div className="p-4 bg-blue-50 border-b">
                  <p className="text-sm font-medium text-gray-900">{user.username}님</p>
                  <p className="text-xs text-gray-600">
                    {user.role === 'admin' ? '관리자' : user.role === 'meeting_host' ? '모임장' : '일반 회원'}
                  </p>
                </div>
              ) : (
                <div className="p-4 border-b space-y-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block w-full py-2 px-4 bg-blue-600 text-white text-center rounded-lg font-medium"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    onClick={closeMobileMenu}
                    className="block w-full py-2 px-4 border border-blue-600 text-blue-600 text-center rounded-lg font-medium"
                  >
                    회원가입
                  </Link>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="flex-1 overflow-y-auto py-4">
                <Link
                  to="/"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive('/') && location.pathname === '/'
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">🏠</span>
                  홈
                </Link>
                <Link
                  to="/questions"
                  onClick={(e) => {
                    handleProtectedLinkClick(e, '/questions')
                    if (isLoggedIn) closeMobileMenu()
                  }}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive('/questions')
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">💡</span>
                  오늘의 질문
                </Link>
                <Link
                  to="/vote"
                  onClick={(e) => {
                    handleProtectedLinkClick(e, '/vote')
                    if (isLoggedIn) closeMobileMenu()
                  }}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive('/vote')
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">📝</span>
                  베스트 글 투표
                </Link>
                <Link
                  to="/best-posts"
                  onClick={(e) => {
                    handleProtectedLinkClick(e, '/best-posts')
                    if (isLoggedIn) closeMobileMenu()
                  }}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive('/best-posts')
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">🏆</span>
                  베스트 글
                </Link>
                <Link
                  to="/meetings"
                  onClick={closeMobileMenu}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive('/meetings')
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">🤝</span>
                  오프라인 모임
                </Link>
                <Link
                  to="/profile"
                  onClick={(e) => {
                    handleProtectedLinkClick(e, '/profile')
                    if (isLoggedIn) closeMobileMenu()
                  }}
                  className={`flex items-center px-4 py-3 text-base font-medium ${
                    isActive('/profile')
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">👤</span>
                  프로필
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMobileMenu}
                    className={`flex items-center px-4 py-3 text-base font-medium ${
                      isActive('/admin')
                        ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">⚙️</span>
                    관리자
                  </Link>
                )}
              </nav>

              {/* Logout Button - only for logged in users */}
              {isLoggedIn && (
                <div className="p-4 border-t">
                  <button
                    onClick={() => {
                      closeMobileMenu()
                      handleLogout()
                    }}
                    className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 active:bg-red-200"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-app mx-auto w-full px-4 md:px-8 py-4 md:py-8 pb-20 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/') && location.pathname === '/'
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs">홈</span>
          </Link>
          <Link
            to="/questions"
            onClick={(e) => handleProtectedLinkClick(e, '/questions')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/questions') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs">질문</span>
          </Link>
          <Link
            to="/vote"
            onClick={(e) => handleProtectedLinkClick(e, '/vote')}
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/vote') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs">투표</span>
          </Link>
          <Link
            to="/meetings"
            className={`flex flex-col items-center justify-center flex-1 h-full ${
              isActive('/meetings') ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">모임</span>
          </Link>
        </div>
      </nav>

      {/* Footer - Desktop only */}
      <footer className="hidden md:block bg-white border-t mt-auto">
        <div className="max-w-app mx-auto px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2025 ING:K 커뮤니티. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
