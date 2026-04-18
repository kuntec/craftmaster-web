import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

export interface User {
  id:             string
  email:          string
  name:           string
  creditsBalance: number
  referralCode:   string
  plan:           'FREE' | 'STARTER' | 'PRO'
}

interface AuthState {
  user:            User | null
  token:           string | null
  isAuthenticated: boolean
  setAuth:         (user: User, token: string) => void
  updateUser:      (data: Partial<User>) => void
  logout:          () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        Cookies.set('cm_token', token, { expires: 7, sameSite: 'lax' })
        set({ user, token, isAuthenticated: true })
      },

      updateUser: (data) => {
        const current = get().user
        if (current) set({ user: { ...current, ...data } })
      },

      logout: () => {
        Cookies.remove('cm_token')
        set({ user: null, token: null, isAuthenticated: false })
        window.location.href = '/login'
      },
    }),
    {
      name: 'cm-auth',
    }
  )
)