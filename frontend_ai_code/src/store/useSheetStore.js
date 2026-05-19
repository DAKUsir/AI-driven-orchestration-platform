import { create } from 'zustand'
import api from '../utils/api'

const useSheetStore = create((set) => ({
  sheets: [],
  loading: false,

  fetchSheets: async (tag) => {
    set({ loading: true })
    try {
      const url = tag ? `/sheets?tag=${tag}` : '/sheets'
      const res = await api.get(url)
      set({ sheets: res.data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  seedSheets: async () => {
    try {
      await api.post('/sheets/seed')
    } catch {
      /* ignore */
    }
  },
}))

export default useSheetStore
