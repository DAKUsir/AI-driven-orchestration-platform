import { create } from 'zustand'
import api from '../utils/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('token', data.token)
      set({
        user: { _id: data._id, name: data.name, email: data.email },
        token: data.token,
        loading: false,
      })
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      localStorage.setItem('token', data.token)
      set({
        user: { _id: data._id, name: data.name, email: data.email },
        token: data.token,
        loading: false,
      })
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      set({ error: msg, loading: false })
      throw new Error(msg)
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null, error: null })
  },

  loadUser: async () => {
    const token = get().token
    if (!token) return
    set({ loading: true })
    try {
      const { data } = await api.get('/auth/me')
      const onboardingCompleted = data.onboardingCompleted ?? true
      set({ user: { ...data, onboardingCompleted }, loading: false })
    } catch (err) {
      // Only clear token on 401 (invalid/expired) — not on network errors
      if (err.response?.status === 401) {
        localStorage.removeItem('token')
        set({ user: null, token: null, loading: false })
      } else {
        set({ loading: false })
      }
    }
  },

  setToken: (token) => {
    localStorage.setItem('token', token)
    set({ token })
  },
}))

export default useAuthStore
