import { create } from 'zustand'
import api from '../utils/api'

const useLeaderboardStore = create((set) => ({
  entries: [],
  myRank: null,
  loading: false,

  fetchLeaderboard: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/leaderboard')
      set({ entries: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchMyRank: async () => {
    try {
      const { data } = await api.get('/leaderboard/me')
      set({ myRank: data })
    } catch {}
  },
}))

export default useLeaderboardStore
