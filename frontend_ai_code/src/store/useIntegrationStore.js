import { create } from 'zustand'
import api from '../utils/api'

const useIntegrationStore = create((set, get) => ({
  profiles: [],
  projects: [],
  loading: false,
  syncing: {},        // { LeetCode: true, GeeksForGeeks: false, ... }
  syncingAll: false,
  error: null,

  // ─── Platform Profiles ─────────────────────────────────────────────────

  fetchIntegrations: async () => {
    try {
      const { data } = await api.get('/integrations')
      set({ profiles: data })
    } catch {}
  },

  connectPlatform: async (platform, username) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/integrations/connect', { platform, username })
      set((s) => {
        const existing = s.profiles.findIndex((p) => p.platform === platform)
        const profiles = [...s.profiles]
        if (existing >= 0) profiles[existing] = data
        else profiles.push(data)
        return { profiles, loading: false }
      })
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Connection failed', loading: false })
      throw err
    }
  },

  syncAll: async () => {
    set({ syncingAll: true, error: null })
    try {
      const { data } = await api.post('/integrations/sync')
      if (data.results) {
        set({ profiles: data.results, syncingAll: false })
      } else {
        set({ syncingAll: false })
      }
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Sync failed', syncingAll: false })
      throw err
    }
  },

  syncPlatform: async (platform) => {
    set((s) => ({ syncing: { ...s.syncing, [platform]: true }, error: null }))
    try {
      const { data } = await api.post(`/integrations/sync/${platform}`)
      set((s) => {
        const profiles = s.profiles.map((p) =>
          p.platform === platform ? data : p
        )
        return { profiles, syncing: { ...s.syncing, [platform]: false } }
      })
      return data
    } catch (err) {
      set((s) => ({
        syncing: { ...s.syncing, [platform]: false },
        error: err.response?.data?.message || 'Sync failed',
      }))
      throw err
    }
  },

  // ─── Projects ───────────────────────────────────────────────────────────

  fetchProjects: async () => {
    try {
      const { data } = await api.get('/integrations/projects')
      set({ projects: data })
    } catch {}
  },

  addProject: async (repoUrl, platform) => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/integrations/projects', { repoUrl, platform })
      set((s) => ({ projects: [data, ...s.projects], loading: false }))
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to add project', loading: false })
      throw err
    }
  },

  removeProject: async (id) => {
    try {
      await api.delete(`/integrations/projects/${id}`)
      set((s) => ({ projects: s.projects.filter((p) => p._id !== id) }))
    } catch {}
  },

  syncProject: async (id) => {
    try {
      const { data } = await api.post(`/integrations/projects/${id}/sync`)
      set((s) => ({
        projects: s.projects.map((p) => (p._id === id ? data : p)),
      }))
    } catch {}
  },

  clearError: () => set({ error: null }),
}))

export default useIntegrationStore
