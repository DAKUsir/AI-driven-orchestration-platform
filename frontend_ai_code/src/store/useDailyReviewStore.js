import { create } from 'zustand'
import api from '../utils/api'

const useDailyReviewStore = create((set) => ({
  review: null,
  weeklyReview: null,
  loading: false,

  fetchDailyReview: async (date) => {
    set({ loading: true })
    try {
      const url = date ? `/daily-reviews?date=${date}` : '/daily-reviews'
      const res = await api.get(url)
      set({ review: res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchWeeklyReview: async () => {
    try {
      const res = await api.get('/daily-reviews/weekly')
      set({ weeklyReview: res.data })
    } catch {
      /* ignore */
    }
  },
}))

export default useDailyReviewStore
