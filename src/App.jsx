import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'

function App() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // Check if session is expired and clear it
    if (session && session.expires_at < Date.now()) {
      console.log('Session expired, clearing user data')
      setUser(null)
      return
    }

    // If we have a persisted user, verify with database
    if (user?.id) {
      refreshUserData(user.id)
    }

    // Register service worker update handler
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, notify user
              if (confirm('새로운 버전이 있습니다. 업데이트하시겠습니까?')) {
                window.location.reload()
              }
            }
          })
        })
      })
    }
  }, [])

  const refreshUserData = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_user_by_id', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error refreshing user data:', error)
        // Don't clear user on network/RPC errors - keep persisted session
        // Only clear if it's a clear authentication failure
        if (error.code === 'PGRST116' || error.code === 'PGRST202' || error.code === '404') {
          // Function doesn't exist (PGRST116, PGRST202) or 404 - keep user logged in
          console.log('RPC function not found (code: ' + error.code + '), keeping persisted session')
        }
        // For any other errors, also keep the session
        return
      }

      if (data?.success && data?.user) {
        // User is active and valid, update the store with fresh data
        setUser(data.user)
      } else if (data?.success === false) {
        // Explicitly invalid user (inactive or not found)
        console.log('User is inactive or not found:', data.error)
        setUser(null)
      }
      // Otherwise keep the persisted session
    } catch (error) {
      console.error('Error refreshing user data:', error)
      // Don't clear user on unexpected errors - keep persisted session
    }
  }

  return (
    <BrowserRouter>
      <Toaster />
      <AppRoutes />
      {user && <PWAInstallPrompt />}
    </BrowserRouter>
  )
}

export default App
