import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import AppRoutes from './routes'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'

function App() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    // Check if session is expired and clear it
    if (session && session.expires_at < Date.now()) {
      setUser(null)
    }
    // If we have a persisted user but need to refresh data
    else if (user?.id) {
      // Optionally refresh user data from database
      refreshUserData(user.id)
    }
  }, [])

  const refreshUserData = async (userId) => {
    try {
      const { data, error } = await supabase.rpc('get_user_by_id', {
        p_user_id: userId
      })

      if (error) {
        console.error('Error refreshing user data:', error)
        setUser(null)
        return
      }

      if (data.success && data.user) {
        // User is active and valid, update the store
        setUser(data.user)
      } else {
        // User not found or inactive, clear session
        console.log('Session invalid:', data.error)
        setUser(null)
      }
    } catch (error) {
      console.error('Error refreshing user data:', error)
      setUser(null)
    }
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
