import axios from 'axios'
import Cookies from 'js-cookie'

const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

adminApi.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

adminApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('admin_token')
      window.location.href = '/admin/login'
    }
    return Promise.reject(err)
  }
)

export const adminAuthApi = {
  login:  (data: { email: string; password: string }) =>
    adminApi.post('/admin/auth/login', data),
  verify: () =>
    adminApi.get('/admin/auth/verify'),
}

export const adminStatsApi = {
  overview:      () => adminApi.get('/admin/stats/overview'),
  signupsChart:  () => adminApi.get('/admin/stats/signups-chart'),
  revenueChart:  () => adminApi.get('/admin/stats/revenue-chart'),
}

export const adminUsersApi = {
  list:          (params?: any) => adminApi.get('/admin/users', { params }),
  get:           (id: string)   => adminApi.get(`/admin/users/${id}`),
  adjustCredits: (id: string, data: { amount: number; reason: string }) =>
    adminApi.patch(`/admin/users/${id}/credits`, data),
  ban:           (id: string)   => adminApi.patch(`/admin/users/${id}/ban`),
  delete:        (id: string)   => adminApi.delete(`/admin/users/${id}`),
}

export const adminPaymentsApi = {
  list: (params?: any) => adminApi.get('/admin/payments', { params }),
}

export const adminGenerationsApi = {
  list: (params?: any) => adminApi.get('/admin/generations', { params }),
}

export default adminApi