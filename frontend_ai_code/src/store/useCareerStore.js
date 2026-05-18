import { create } from 'zustand'
import api from '../utils/api'

const useCareerStore = create((set) => ({
  analysis: null,
  uploading: false,
  error: null,

  uploadResume: async (file, targetRole) => {
    set({ uploading: true, error: null })
    try {
      const form = new FormData()
      form.append('resume', file)
      form.append('targetRole', targetRole)
      const { data } = await api.post('/resume/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      set({ analysis: data, uploading: false })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Upload failed', uploading: false })
    }
  },

  clearAnalysis: () => set({ analysis: null, error: null }),
}))

export default useCareerStore
