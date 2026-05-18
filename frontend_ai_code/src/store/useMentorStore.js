import { create } from 'zustand'
import api from '../utils/api'

const useMentorStore = create((set, get) => ({
  messages: [],
  loading: false,
  mode: 'general', // general, dsa, interview, code-review

  setMode: (mode) => set({ mode }),

  sendMessage: async (message) => {
    const userMsg = { role: 'user', content: message }
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }))
    try {
      const { mode } = get()
      const contextType = mode === 'dsa' ? 'mentor'
        : mode === 'interview' ? 'interview'
        : mode === 'code-review' ? 'debugging'
        : 'mentor'

      const { data } = await api.post('/ai/chat', { message, contextType })
      const aiMsg = { role: 'assistant', content: data.response }
      set((s) => ({ messages: [...s.messages, aiMsg], loading: false }))
    } catch {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }],
        loading: false,
      }))
    }
  },

  clearMessages: () => set({ messages: [] }),
}))

export default useMentorStore
