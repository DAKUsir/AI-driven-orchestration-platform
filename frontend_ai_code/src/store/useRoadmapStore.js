import { create } from 'zustand'
import api from '../utils/api'

const useRoadmapStore = create((set) => ({
  roadmap: null,
  tasks: [],
  loading: false,
  error: null,

  generateRoadmap: async (params = {}) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/ai/roadmap', params)
      set({ roadmap: data, loading: false })
      // Refresh tasks after generating roadmap
      const tasksRes = await api.get('/tasks')
      set({ tasks: tasksRes.data })
    } catch (err) {
      set({ error: err.response?.data?.message || err.response?.data?.detail || 'Failed to generate roadmap', loading: false })
    }
  },

  fetchTasks: async () => {
    try {
      const { data } = await api.get('/tasks')
      set({ tasks: data })
    } catch {}
  },

  toggleTask: async (taskId, completed) => {
    try {
      await api.patch(`/tasks/${taskId}`, { completed })
      set((s) => ({
        tasks: s.tasks.map((t) => (t._id === taskId ? { ...t, completed } : t)),
      }))
    } catch {}
  },

  clearRoadmap: () => set({ roadmap: null, error: null }),
}))

export default useRoadmapStore
