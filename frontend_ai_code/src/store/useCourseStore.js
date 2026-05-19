import { create } from 'zustand'
import api from '../utils/api'

const useCourseStore = create((set) => ({
  courses: [],
  stats: null,
  loading: false,
  error: null,

  fetchCourses: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await api.get(`/courses${params ? `?${params}` : ''}`)
      set({ courses: res.data, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/courses/stats')
      set({ stats: res.data })
    } catch {
      /* ignore */
    }
  },

  addCourse: async (data) => {
    try {
      const res = await api.post('/courses', data)
      set((s) => ({ courses: [res.data, ...s.courses] }))
      return res.data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  updateCourse: async (id, data) => {
    try {
      const res = await api.patch(`/courses/${id}`, data)
      set((s) => ({
        courses: s.courses.map((c) => (c._id === id ? res.data : c)),
      }))
      return res.data
    } catch (err) {
      set({ error: err.message })
      throw err
    }
  },

  deleteCourse: async (id) => {
    try {
      await api.delete(`/courses/${id}`)
      set((s) => ({ courses: s.courses.filter((c) => c._id !== id) }))
    } catch (err) {
      set({ error: err.message })
    }
  },
}))

export default useCourseStore
