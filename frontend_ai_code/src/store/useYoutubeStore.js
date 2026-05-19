import { create } from 'zustand'
import api from '../utils/api'

const useYoutubeStore = create((set, get) => ({
  connected: false,
  channelTitle: '',
  connectedAt: null,
  lastSynced: null,
  courses: [],
  courseDetail: null,
  loading: false,
  syncing: false,
  generatingTasks: false,
  addingPlaylist: false,
  error: null,

  // ── Check connection status ──
  fetchStatus: async () => {
    try {
      const { data } = await api.get('/integrations/youtube/status')
      set({
        connected: data.connected,
        channelTitle: data.channelTitle || '',
        connectedAt: data.connectedAt,
        lastSynced: data.lastSynced,
      })
    } catch {
      set({ connected: false })
    }
  },

  // ── Initiate OAuth ──
  connectYoutube: async () => {
    try {
      const { data } = await api.get('/integrations/youtube/connect')
      // Open OAuth popup
      window.location.href = data.authUrl
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to connect YouTube' })
    }
  },

  // ── Disconnect ──
  disconnectYoutube: async (removeCourses = false) => {
    try {
      await api.delete(`/integrations/youtube/disconnect?removeCourses=${removeCourses}`)
      set({ connected: false, channelTitle: '', courses: [], lastSynced: null })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to disconnect' })
    }
  },

  // ── Fetch courses ──
  fetchCourses: async (filters = {}) => {
    set({ loading: true })
    try {
      const params = new URLSearchParams(filters).toString()
      const { data } = await api.get(`/integrations/youtube/courses${params ? `?${params}` : ''}`)
      set({ courses: data, loading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch courses', loading: false })
    }
  },

  // ── Fetch single course detail ──
  fetchCourseDetail: async (id) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/integrations/youtube/courses/${id}`)
      set({ courseDetail: data, loading: false })
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch course', loading: false })
    }
  },

  // ── Sync playlists (OAuth) ──
  syncYoutube: async () => {
    set({ syncing: true })
    try {
      const { data } = await api.post('/integrations/youtube/sync')
      set({ syncing: false, lastSynced: new Date().toISOString() })
      // Refetch courses after sync
      get().fetchCourses()
      return data
    } catch (err) {
      set({ syncing: false, error: err.response?.data?.message || 'Sync failed' })
      throw err
    }
  },

  // ── Add a public playlist by URL (no OAuth needed) ──
  addPlaylist: async (url) => {
    set({ addingPlaylist: true })
    try {
      const { data } = await api.post('/integrations/youtube/add-playlist', { url })
      set((s) => ({
        addingPlaylist: false,
        courses: [data, ...s.courses],
      }))
      return data
    } catch (err) {
      set({ addingPlaylist: false, error: err.response?.data?.message || 'Failed to add playlist' })
      throw err
    }
  },

  // ── Toggle video watched ──
  toggleVideo: async (courseId, videoId, watched) => {
    try {
      const { data } = await api.patch(`/integrations/youtube/courses/${courseId}/video`, {
        videoId,
        watched,
      })
      // Update courseDetail if viewing
      if (get().courseDetail?._id === courseId) {
        set({ courseDetail: data })
      }
      // Update in courses list
      set((s) => ({
        courses: s.courses.map((c) => (c._id === courseId ? { ...c, completedVideos: data.completedVideos, progressPercentage: data.progressPercentage, status: data.status } : c)),
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update video' })
    }
  },

  // ── Update course status/category ──
  updateCourse: async (courseId, updates) => {
    try {
      const { data } = await api.patch(`/integrations/youtube/courses/${courseId}`, updates)
      set((s) => ({
        courses: s.courses.map((c) => (c._id === courseId ? { ...c, ...data } : c)),
      }))
      if (get().courseDetail?._id === courseId) set({ courseDetail: data })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to update course' })
    }
  },

  // ── Generate tasks from course ──
  generateTasks: async (courseId, videosPerDay = 3, startDate = null) => {
    set({ generatingTasks: true })
    try {
      const { data } = await api.post(`/integrations/youtube/courses/${courseId}/generate-tasks`, {
        videosPerDay,
        startDate,
      })
      set({ generatingTasks: false })
      return data
    } catch (err) {
      set({ generatingTasks: false, error: err.response?.data?.message || 'Failed to generate tasks' })
      throw err
    }
  },

  // ── Delete course ──
  deleteCourse: async (courseId) => {
    try {
      await api.delete(`/integrations/youtube/courses/${courseId}`)
      set((s) => ({
        courses: s.courses.filter((c) => c._id !== courseId),
      }))
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to delete course' })
    }
  },

  clearError: () => set({ error: null }),
}))

export default useYoutubeStore
