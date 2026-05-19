import { create } from 'zustand'
import api from '../utils/api'

const useTaskStore = create((set, get) => ({
  tasks: [],
  dailyTasks: [],
  weeklyOverview: {},
  loading: false,
  error: null,

  fetchTasks: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await api.get(`/tasks${params ? `?${params}` : ''}`)
      set({ tasks: res.data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchDailyTasks: async () => {
    set({ loading: true })
    try {
      const res = await api.get('/tasks/today')
      set({ dailyTasks: res.data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchWeeklyOverview: async () => {
    try {
      const res = await api.get('/tasks/weekly')
      set({ weeklyOverview: res.data })
    } catch (err) {
      set({ error: err.message })
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData)
      set((s) => ({ tasks: [res.data, ...s.tasks] }))
      return res.data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateTask: async (id, data) => {
    try {
      const res = await api.patch(`/tasks/${id}`, data)
      set((s) => ({
        tasks: s.tasks.map((t) => (t._id === id ? res.data : t)),
        dailyTasks: s.dailyTasks.map((t) => (t._id === id ? res.data : t)),
      }))
      return res.data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      set((s) => ({
        tasks: s.tasks.filter((t) => t._id !== id),
        dailyTasks: s.dailyTasks.filter((t) => t._id !== id),
      }))
    } catch (err) {
      set({ error: err.message })
    }
  },

  carryForward: async () => {
    try {
      const res = await api.post('/tasks/carry-forward')
      // Refresh daily tasks after carry-forward
      get().fetchDailyTasks()
      return res.data
    } catch (err) {
      set({ error: err.message })
    }
  },

  bulkUpdateStatus: async (taskIds, status) => {
    try {
      await api.patch('/tasks/bulk-status', { taskIds, status })
      set((s) => ({
        tasks: s.tasks.map((t) =>
          taskIds.includes(t._id) ? { ...t, status, ...(status === 'done' ? { completedAt: new Date() } : {}) } : t
        ),
        dailyTasks: s.dailyTasks.map((t) =>
          taskIds.includes(t._id) ? { ...t, status } : t
        ),
      }))
    } catch (err) {
      set({ error: err.message })
    }
  },
}))

export default useTaskStore
