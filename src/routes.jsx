import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layouts
import MainLayout from './components/common/MainLayout'
import AdminLayout from './components/common/AdminLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Main Pages
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'

// Voting Pages
import VotePage from './pages/voting/VotePage'
import NominatePage from './pages/voting/NominatePage'
import BestPostsPage from './pages/voting/BestPostsPage'

// Meeting Pages
import MeetingsPage from './pages/meetings/MeetingsPage'
import CreateMeetingPage from './pages/meetings/CreateMeetingPage'
import MeetingDetailPage from './pages/meetings/MeetingDetailPage'

// Question Pages
import QuestionsListPage from './pages/questions/QuestionsListPage'
import QuestionDetailPage from './pages/questions/QuestionDetailPage'

// Test Pages
import StorageTest from './pages/StorageTest'

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminVotesPage from './pages/admin/AdminVotesPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminMeetingsPage from './pages/admin/AdminMeetingsPage'
import AdminInvitesPage from './pages/admin/AdminInvitesPage'
import AdminQuestionsPage from './pages/admin/AdminQuestionsPage'

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Check if user account is active
  if (user.is_active === false) {
    // Log out inactive users
    useAuthStore.getState().logout()
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return children
}

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const user = useAuthStore((state) => state.user)

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="profile" element={<ProfilePage />} />

        {/* Voting Routes */}
        <Route path="vote" element={<VotePage />} />
        <Route path="vote/nominate" element={<NominatePage />} />
        <Route path="best-posts" element={<BestPostsPage />} />

        {/* Meeting Routes */}
        <Route path="meetings" element={<MeetingsPage />} />
        <Route path="meetings/create" element={<CreateMeetingPage />} />
        <Route path="meetings/:id" element={<MeetingDetailPage />} />

        {/* Question Routes */}
        <Route path="questions" element={<QuestionsListPage />} />
        <Route path="questions/:id" element={<QuestionDetailPage />} />

        {/* Test Routes */}
        <Route path="storage-test" element={<StorageTest />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="votes" element={<AdminVotesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="meetings" element={<AdminMeetingsPage />} />
        <Route path="invites" element={<AdminInvitesPage />} />
        <Route path="questions" element={<AdminQuestionsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
