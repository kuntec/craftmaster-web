import axios from 'axios'
import Cookies from 'js-cookie'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('cm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('cm_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; referralCode?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  google: (data: { idToken: string; referralCode?: string }) =>
    api.post('/auth/google', data),
  me: () =>
    api.get('/auth/me'),
  updateProfile: (data: { name: string }) =>
    api.patch('/auth/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/password', data),
  deleteAccount: () =>
    api.delete('/auth/account'),
}

// ── Credits ───────────────────────────────────────────────
export const creditsApi = {
  balance:  () => api.get('/credits/balance'),
  history:  (page = 1, limit = 20) => api.get(`/credits/history?page=${page}&limit=${limit}`),
  packages: () => api.get('/credits/packages'),
  topup:    (credits: number) => api.post('/stripe/topup', { credits }),
  add:      (amount: number) => api.post('/credits/add', { amount }),
}

// ── Image ─────────────────────────────────────────────────
export const imageApi = {
  generate: (data: { prompt: string; width?: number; height?: number }) =>
    api.post('/image/generate', data),
  sizes: () =>
    api.get('/image/sizes'),
}

// ── Video ─────────────────────────────────────────────────
export const videoApi = {
  generate: (data: { prompt: string; duration?: number }) =>
    api.post('/video/generate', data),
  info: () =>
    api.get('/video/info'),
}

// ── Website ───────────────────────────────────────────────
export const websiteApi = {
  generate: (data: { prompt: string; style?: string }) =>
    api.post('/website/generate', data),
  styles: () =>
    api.get('/website/styles'),
}

// ── Jobs ──────────────────────────────────────────────────
export const jobsApi = {
  list: (params?: { type?: string; status?: string; page?: number }) =>
    api.get('/jobs', { params }),
  get: (id: string) =>
    api.get(`/jobs/${id}`),
}

// ── Builder ───────────────────────────────────────────────
export const builderApi = {
  generatePlans: (description: string) =>
    api.post('/projects/plan', { description }),

  startProject: (data: {
    title:        string
    description:  string
    plan:         string
    features:     any[]
    steps:        any[]
    totalCredits: number
  }) => api.post('/projects/start', data),

  nextStep: (projectId: string, data: {
    stepTitle:       string
    stepDescription: string
  }) => api.post(`/projects/${projectId}/next-step`, data),

  getProject:  (id: string) => api.get(`/projects/${id}`),
  listProjects: ()           => api.get('/projects'),
  pauseProject: (id: string) => api.patch(`/projects/${id}/pause`),
  resumeProject:(id: string) => api.patch(`/projects/${id}/resume`),
}