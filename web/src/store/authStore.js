import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { signOut } from '../utils/socialAuth'

// Global flag to prevent logout infinite loop
let isLoggingOut = false

// Custom storage that uses both localStorage and cookies for persistence
const customStorage = {
  getItem: (name) => {
    // Try localStorage first
    const localValue = localStorage.getItem(name)
    if (localValue) return localValue

    // Fallback to cookie
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=')
      if (key === name) {
        return decodeURIComponent(value)
      }
    }
    return null
  },
  setItem: (name, value) => {
    // Save to localStorage
    localStorage.setItem(name, value)

    // Also save to cookie (7 days expiry)
    const expires = new Date()
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000)
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  },
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,

      setUser: (user) => {
        // Create a simple session for Kakao users
        const session = user ? {
          user: { id: user.id },
          expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days in seconds
        } : null
        set({ user, session, isLoading: false })
      },

      setSession: (session) => {
        set({ session })
      },

      logout: async () => {
        // Prevent infinite loop - skip if already logging out
        if (isLoggingOut) {
          console.log('Logout already in progress, skipping...')
          return
        }

        try {
          isLoggingOut = true
          await signOut()
          set({ user: null, session: null })
        } catch (error) {
          console.error('Logout error:', error)
          set({ user: null, session: null })
        } finally {
          // Reset flag after a short delay to allow auth state change to complete
          setTimeout(() => {
            isLoggingOut = false
          }, 1000)
        }
      },

      // Initialize auth state on app start
      initialize: async () => {
        set({ isLoading: true })

        try {
          // Check for valid stored session first
          const storedState = get()

          if (storedState.user && storedState.session) {
            // Check if session is still valid
            if (storedState.session.expires_at && storedState.session.expires_at * 1000 > Date.now()) {
              console.log('Using valid session from storage')
              set({ isLoading: false })
              return
            }
          }

          // Check Supabase Auth for session (for Google login)
          console.log('Checking Supabase Auth...')
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            const {
              data: { user: authUser },
            } = await supabase.auth.getUser()

            if (authUser) {
              // Fetch user data from profiles table (changed from 'users')
              const { data: profileData, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .maybeSingle()

              if (!error && profileData) {
                // Map snake_case DB response to frontend state
                // Normalize role to lowercase: 'ADMIN' -> 'admin'
                const mappedRole = (profileData.role || 'user').toLowerCase()
                console.log('🔐 Mapped User Role:', mappedRole, '(original:', profileData.role, ')')

                const userData = {
                  id: profileData.id,
                  username: profileData.username,
                  fullName: profileData.full_name,
                  avatarUrl: profileData.avatar_url,
                  role: mappedRole,
                  isActive: profileData.is_active ?? true,
                  email: authUser.email,
                }
                set({
                  user: userData,
                  session,
                  isLoading: false,
                })
                return
              } else if (error) {
                console.error('Error fetching profile data:', error)
              }
            }
          }

          // No valid session found
          console.log('No valid session, clearing auth state')
          set({ user: null, session: null, isLoading: false })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ isLoading: false })
        }
      },

      // Check if session is valid
      isAuthenticated: () => {
        const { user, session } = get()

        if (!user) return false

        // Check session validity
        return session && session.expires_at && session.expires_at * 1000 > Date.now()
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
)

// Helper to check if we're on auth callback page
const isOnAuthCallbackPage = () => {
  return typeof window !== 'undefined' && window.location.pathname.startsWith('/auth/callback')
}

// Listen to Supabase auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event, session)

  // Skip auth state changes on callback page - let CallbackPage handle it
  if (isOnAuthCallbackPage()) {
    console.log('On auth callback page, skipping auth state change handling')
    return
  }

  const store = useAuthStore.getState()

  if (event === 'SIGNED_IN' && session) {
    console.log('User signed in, OAuthHandler will handle sync')
  } else if (event === 'SIGNED_OUT') {
    // Only clear state if not already logging out (prevent infinite loop)
    if (!isLoggingOut) {
      console.log('SIGNED_OUT event: clearing auth state')
      store.setUser(null)
    } else {
      console.log('SIGNED_OUT event: logout already in progress, skipping')
    }
  } else if (event === 'TOKEN_REFRESHED' && session) {
    store.setSession(session)
  } else if (event === 'INITIAL_SESSION' && session) {
    console.log('Initial session detected, OAuthHandler will process if needed')
  }
})
