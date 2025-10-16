import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: false,

      setUser: (user) => {
        // Create a custom session when user is set
        const session = user ? {
          user: { id: user.id },
          access_token: 'custom_session',
          expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
        } : null
        set({ user, session, isLoading: false })
      },
      setSession: (session) => set({ session }),
      logout: () => set({ user: null, session: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        session: state.session
      }),
    }
  )
)
