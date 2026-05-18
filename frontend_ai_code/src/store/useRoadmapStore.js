import { create } from 'zustand'
import api from '../utils/api'

const useRoadmapStore = create((set) => ({
  roadmap: null,
  tasks: [],
  loading: false,
  error: null,

  generateRoadmap: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/ai/roadmap')
      set({ roadmap: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.detail || 'Failed to generate roadmap', loading: false })
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
}))

export default useRoadmapStore
