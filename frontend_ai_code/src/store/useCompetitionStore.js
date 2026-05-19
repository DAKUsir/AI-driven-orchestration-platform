import { create } from 'zustand'
import api from '../utils/api'

const useCompetitionStore = create((set) => ({
  competitions: [],
  loading: false,

  fetchCompetitions: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await api.get(`/competitions${params ? `?${params}` : ''}`)
      set({ competitions: res.data, loading: false })
    } catch {
      set({ loading: false })
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
