import { BrowserRouter } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { App as CapApp } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'
import AppRoutes from './routes'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import AppUrlListener from './components/common/AppUrlListener'
import { initPushNotifications } from './utils/notifications'
import Loading from './components/common/Loading'

function App() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const isLoading = useAuthStore((state) => state.isLoading)
  const setUser = useAuthStore((state) => state.setUser)
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    // Initialize auth state (check for social auth session)
    initialize()
  }, [])

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

    // Native platform specific setup
    const isNative = Capacitor.isNativePlatform()

    if (isNative) {
      // Hide splash screen after app is loaded
      SplashScreen.hide()

      // Set status bar style
      StatusBar.setStyle({ style: Style.Light }).catch((err) => {
        console.error('Error setting status bar style:', err)
      })

      // Set status bar background color (Android only)
      if (Capacitor.getPlatform() === 'android') {
        StatusBar.setBackgroundColor({ color: '#ffffff' }).catch((err) => {
          console.error('Error setting status bar color:', err)
        })
      }

      // Handle Android back button
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (!canGoBack || window.location.pathname === '/') {
          CapApp.exitApp()
        } else {
          window.history.back()
        }
      })

      // Initialize push notifications if user is logged in
      if (user?.id) {
        initPushNotifications(user.id).catch((err) => {
          console.error('Error initializing push notifications:', err)
        })
      }

      // Handle app state changes
      CapApp.addListener('appStateChange', ({ isActive }) => {
        console.log('App state changed. Is active:', isActive)
        // Refresh user data when app comes to foreground
        if (isActive && user?.id) {
          refreshUserData(user.id)
        }
      })

      // Deep link handling is now done in AppUrlListener component
      // (which has access to React Router's navigate)
    } else {
      // Register service worker update handler for web
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
    }

    // Cleanup listeners on unmount
    return () => {
      if (isNative) {
        CapApp.removeAllListeners()
      }
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

  // Show loading screen while initializing auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster />
      <AppUrlListener />
      <AppRoutes />
      {user && <PWAInstallPrompt />}
    </BrowserRouter>
  )
}

export default App
