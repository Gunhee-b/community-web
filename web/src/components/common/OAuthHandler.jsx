import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { handleOAuthCallback } from '../../utils/socialAuth'

// Global flag to prevent duplicate processing across component instances
let globalProcessingFlag = false

/**
 * OAuth Handler Component
 * Detects OAuth callback in URL hash and processes it
 */
function OAuthHandler() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const setSession = useAuthStore((state) => state.setSession)

  // useRef to ensure the effect runs only once per mount
  const hasProcessedRef = useRef(false)

  useEffect(() => {
    const processOAuthCallback = async () => {
      // Skip if already processed (singleton pattern)
      if (hasProcessedRef.current || globalProcessingFlag) {
        console.log('OAuthHandler: Already processed, skipping...')
        return
      }

      const hash = window.location.hash
      console.log('OAuthHandler: Checking hash:', hash)

      // Check if this is an OAuth callback (has access_token in hash)
      if (hash && hash.includes('access_token')) {
        // Mark as processing immediately
        hasProcessedRef.current = true
        globalProcessingFlag = true

        console.log('✅ OAuth callback detected in hash')
        console.log('Hash length:', hash.length)

        try {
          console.log('Calling handleOAuthCallback...')
          // Supabase will automatically parse the hash and create a session
          const result = await handleOAuthCallback()

          console.log('handleOAuthCallback result:', result)

          if (result.success && result.user && result.session) {
            console.log('✅ OAuth callback successful, setting user:', result.user.username)
            setUser(result.user)
            setSession(result.session)

            // Clear the hash and redirect to home
            console.log('Clearing hash and redirecting to home')
            window.history.replaceState(null, '', '/')
            navigate('/', { replace: true })
          } else {
            console.error('❌ OAuth callback failed:', result)
            globalProcessingFlag = false // Reset on failure
            window.history.replaceState(null, '', '/login')
            navigate('/login', { replace: true })
          }
        } catch (error) {
          console.error('❌ Error processing OAuth callback:', error)
          console.error('Error details:', error.message, error.stack)
          globalProcessingFlag = false // Reset on error
          window.history.replaceState(null, '', '/login')
          navigate('/login', { replace: true })
        }
      } else {
        console.log('No access_token in hash, skipping OAuth processing')
      }
    }

    processOAuthCallback()
  }, []) // Empty dependency array - run only once on mount

  return null
}

export default OAuthHandler
