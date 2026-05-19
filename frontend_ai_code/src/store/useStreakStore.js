import { create } from 'zustand'
import api from '../utils/api'

const useStreakStore = create((set) => ({
  currentStreak: 0,
  longestStreak: 0,
  history: [],
  loading: false,

  fetchStreak: async () => {
    set({ loading: true })
    try {
      const res = await api.get('/streaks')
      set({
        currentStreak: res.data.currentStreak || 0,
        longestStreak: res.data.longestStreak || 0,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  fetchHistory: async (days = 30) => {
    try {
      const res = await api.get(`/streaks/history?days=${days}`)
      set({
        currentStreak: res.data.currentStreak || 0,
        longestStreak: res.data.longestStreak || 0,
        history: res.data.history || [],
      })
    } catch {
      /* ignore */
    }
  },
}))

export default useStreakStore
