import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { signOut } from '../utils/socialAuth'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isLoading: false,
      authType: null, // 'local' or 'social'

      setUser: (user) => {
        // Determine auth type based on provider
        const authType = user?.provider && user.provider !== 'local' ? 'social' : 'local'

        // Create a custom session when user is set for local auth
        const session = user
          ? user.provider && user.provider !== 'local'
            ? null // Social auth will have its own session
            : {
                user: { id: user.id },
                access_token: 'custom_session',
                expires_at: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
              }
          : null

        set({ user, session, isLoading: false, authType })
      },

      setSession: (session) => {
        // For social auth, session comes from Supabase Auth
        set({ session, authType: 'social' })
      },

      logout: async () => {
        const { authType } = get()

        try {
          // If social auth, sign out from Supabase
          if (authType === 'social') {
            await signOut()
          }

          // Clear local state
          set({ user: null, session: null, authType: null })
        } catch (error) {
          console.error('Logout error:', error)
          // Clear state anyway
          set({ user: null, session: null, authType: null })
        }
      },

      // Initialize auth state on app start
      initialize: async () => {
        set({ isLoading: true })

        try {
          // Check for Supabase Auth session
          const {
            data: { session },
          } = await supabase.auth.getSession()

          if (session) {
            // Get user from session
            const {
              data: { user: authUser },
            } = await supabase.auth.getUser()

            if (authUser) {
              // Fetch user data from our users table
              const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', authUser.email)
                .single()

              if (!error && userData) {
                set({
                  user: userData,
                  session,
                  authType: 'social',
                  isLoading: false,
                })
                return
              }
            }
          }

          // If no social auth session, check for local auth in storage
          const storedState = get()
          if (storedState.user && storedState.authType === 'local') {
            // Local auth session exists in storage
            set({ isLoading: false })
            return
          }

          // No valid session
          set({ user: null, session: null, authType: null, isLoading: false })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ user: null, session: null, authType: null, isLoading: false })
        }
      },

      // Check if session is valid
      isAuthenticated: () => {
        const { user, session, authType } = get()

        if (!user) return false

        if (authType === 'social') {
          // Check Supabase session validity
          return session && session.expires_at && session.expires_at * 1000 > Date.now()
        }

        if (authType === 'local') {
          // Check custom session validity
          return session && session.expires_at && session.expires_at > Date.now()
        }

        return false
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        authType: state.authType,
      }),
    }
  )
)

// Listen to Supabase auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state change:', event, session)

  const store = useAuthStore.getState()

  if (event === 'SIGNED_IN' && session) {
    // Fetch user data from our users table
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (authUser) {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single()

      if (userData) {
        store.setUser(userData)
        store.setSession(session)
      }
    }
  } else if (event === 'SIGNED_OUT') {
    // Only clear if this was a social auth session
    if (store.authType === 'social') {
      store.logout()
    }
  } else if (event === 'TOKEN_REFRESHED' && session) {
    store.setSession(session)
  }
})
