import { BrowserRouter } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import { Toaster } from 'react-hot-toast'
import AppRoutes from './routes'
import { useAuthStore } from './store/authStore'
import { supabase } from './lib/supabase'
import PWAInstallPrompt from './components/common/PWAInstallPrompt'
import AppUrlListener from './components/common/AppUrlListener'
import OAuthHandler from './components/common/OAuthHandler'
import Loading from './components/common/Loading'

function App() {
  const user = useAuthStore((state) => state.user)
  const session = useAuthStore((state) => state.session)
  const isLoading = useAuthStore((state) => state.isLoading)
  const setUser = useAuthStore((state) => state.setUser)
  const initialize = useAuthStore((state) => state.initialize)

  // useRef to ensure initialize runs only once (singleton pattern)
  const hasInitializedRef = useRef(false)

  useEffect(() => {
    // Skip if already initialized
    if (hasInitializedRef.current) {
      return
    }

    // Skip initialization on auth callback pages to avoid race condition
    // The callback page will handle authentication itself
    const isAuthCallback = window.location.pathname.startsWith('/auth/callback')
    if (isAuthCallback) {
      console.log('Skipping initialize on auth callback page')
      hasInitializedRef.current = true
      return
    }

    hasInitializedRef.current = true

    // Initialize auth state (check for social auth session)
    initialize()
  }, [])

  // Platform-specific setup (run once on mount)
  useEffect(() => {
    const setupPlatform = async () => {
      // Check if we're in a native environment
      let isNative = false
      try {
        const { Capacitor } = await import('@capacitor/core')
        isNative = Capacitor.isNativePlatform()
      } catch {
        // Not in native environment, continue with web setup
        isNative = false
      }

      if (isNative) {
        // Dynamic imports for native modules
        const [
          { App: CapApp },
          { StatusBar, Style },
          { SplashScreen }
        ] = await Promise.all([
          import('@capacitor/app'),
          import('@capacitor/status-bar'),
          import('@capacitor/splash-screen')
        ])

        const { Capacitor } = await import('@capacitor/core')

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
        const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack || window.location.pathname === '/') {
            CapApp.exitApp()
          } else {
            window.history.back()
          }
        })

        // Deep link handling is now done in AppUrlListener component

        // Cleanup listeners on unmount
        return () => {
          backButtonListener.remove()
        }
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
    }

    setupPlatform()
  }, [])

  // Handle user-specific setup when user changes
  useEffect(() => {
    const setupUserSpecificFeatures = async () => {
      let isNative = false
      try {
        const { Capacitor } = await import('@capacitor/core')
        isNative = Capacitor.isNativePlatform()
      } catch {
        isNative = false
      }

      if (isNative && user?.id) {
        const { initPushNotifications } = await import('./utils/notifications')
        const { App: CapApp } = await import('@capacitor/app')

        // Initialize push notifications
        initPushNotifications(user.id).catch((err) => {
          console.error('Error initializing push notifications:', err)
        })

        // Handle app state changes
        const appStateListener = CapApp.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active:', isActive)
          // Refresh user data when app comes to foreground
          if (isActive && user?.id) {
            refreshUserData(user.id)
          }
        })

        return () => {
          appStateListener.remove()
        }
      }
    }

    setupUserSpecificFeatures()
  }, [user?.id])

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
      <OAuthHandler />
      <AppRoutes />
      {user && <PWAInstallPrompt />}
    </BrowserRouter>
  )
}

export default App
