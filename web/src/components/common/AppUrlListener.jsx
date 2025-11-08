import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { App as CapApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

/**
 * AppUrlListener Component
 *
 * Handles deep link navigation for OAuth callbacks in native apps.
 * This must be inside <BrowserRouter> to access useNavigate.
 */
function AppUrlListener() {
  const navigate = useNavigate()

  useEffect(() => {
    // Only run in native platform
    if (!Capacitor.isNativePlatform()) {
      return
    }

    console.log('[AppUrlListener] Setting up deep link listener')

    const handleAppUrlOpen = (event) => {
      console.log('[AppUrlListener] Deep link received:', event.url)

      try {
        // Parse the deep link URL
        const url = new URL(event.url)
        console.log('[AppUrlListener] Parsed URL:', {
          protocol: url.protocol,
          host: url.host,
          pathname: url.pathname,
          search: url.search,
        })

        // Handle auth callback: ingk://auth/callback?code=...
        if (url.protocol === 'ingk:' && url.pathname.includes('callback')) {
          const searchParams = url.search || ''
          const targetPath = `/auth/callback${searchParams}`

          console.log('[AppUrlListener] Navigating to:', targetPath)

          // Use setTimeout to ensure navigation happens after React is ready
          setTimeout(() => {
            navigate(targetPath, { replace: true })
          }, 100)
        } else {
          console.warn('[AppUrlListener] Unhandled deep link:', event.url)
        }
      } catch (error) {
        console.error('[AppUrlListener] Error parsing deep link:', error)
      }
    }

    // Add listener
    const listenerHandle = CapApp.addListener('appUrlOpen', handleAppUrlOpen)

    console.log('[AppUrlListener] Deep link listener added')

    // Cleanup
    return () => {
      console.log('[AppUrlListener] Removing deep link listener')
      listenerHandle.remove()
    }
  }, [navigate])

  // This component doesn't render anything
  return null
}

export default AppUrlListener
