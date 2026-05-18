import { create } from 'zustand'
import api from '../utils/api'

const useAnalyticsStore = create((set) => ({
  analytics: null,
  loading: false,

  fetchAnalytics: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/analytics/dashboard')
      set({ analytics: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },
}))

export default useAnalyticsStore
