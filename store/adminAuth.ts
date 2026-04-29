import { create } from 'zustand'
import Cookies from 'js-cookie'

interface AdminState {
  token:    string | null
  admin:    { email: string; role: string } | null
  setAuth:  (admin: any, token: string) => void
  logout:   () => void
}

export const useAdminStore = create<AdminState>((set) => ({
  token: Cookies.get('admin_token') || null,
  admin: null,

  setAuth: (admin, token) => {
    Cookies.set('admin_token', token, { expires: 1 })
    set({ admin, token })
  },

  logout: () => {
    Cookies.remove('admin_token')
    set({ admin: null, token: null })
    window.location.href = '/admin/login'
  },
}))