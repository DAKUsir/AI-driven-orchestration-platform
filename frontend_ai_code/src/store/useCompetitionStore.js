import { create } from 'zustand'
import api from '../utils/api'

const useCompetitionStore = create((set) => ({
  competitions: [],
  loading: false,
  refreshing: false,

  fetchCompetitions: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await api.get(`/competitions${params ? `?${params}` : ''}`)
      // Deduplicate by _id in case DB has existing duplicates
      const seen = new Set()
      const unique = res.data.filter(c => {
        if (seen.has(c._id)) return false
        seen.add(c._id)
        return true
      })
      set({ competitions: unique, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  refreshCompetitions: async () => {
    set({ refreshing: true })
    try {
      await api.post('/competitions/refresh')
      // Re-fetch after refresh
      const res = await api.get('/competitions?status=upcoming')
      const seen = new Set()
      const unique = res.data.filter(c => {
        if (seen.has(c._id)) return false
        seen.add(c._id)
        return true
      })
      set({ competitions: unique, refreshing: false })
    } catch {
      set({ refreshing: false })
    }
  },

  setReminder: async (id) => {
    try {
      await api.post(`/competitions/${id}/reminder`)
      set((s) => ({
        competitions: s.competitions.map((c) =>
          c._id === id ? { ...c, hasReminder: true } : c
        ),
      }))
    } catch {
      /* ignore */
    }
  },

  removeReminder: async (id) => {
    try {
      await api.delete(`/competitions/${id}/reminder`)
      set((s) => ({
        competitions: s.competitions.map((c) =>
          c._id === id ? { ...c, hasReminder: false } : c
        ),
      }))
    } catch {
      /* ignore */
    }
  },

  seedCompetitions: async () => {
    try {
      await api.post('/competitions/seed')
    } catch {
      /* ignore */
    }
  },
}))

export default useCompetitionStore
