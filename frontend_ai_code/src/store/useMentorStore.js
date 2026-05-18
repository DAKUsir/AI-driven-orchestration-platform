import { create } from 'zustand'
import api from '../utils/api'

const useMentorStore = create((set) => ({
  messages: [],
  loading: false,

  sendMessage: async (message) => {
    const userMsg = { role: 'user', content: message }
    set((s) => ({ messages: [...s.messages, userMsg], loading: true }))
    try {
      const { data } = await api.post('/ai/chat', { message })
      const aiMsg = { role: 'assistant', content: data.response }
      set((s) => ({ messages: [...s.messages, aiMsg], loading: false }))
    } catch {
      set((s) => ({
        messages: [...s.messages, { role: 'assistant', content: 'Sorry, something went wrong.' }],
        loading: false,
      }))
    }
  },

  clearMessages: () => set({ messages: [] }),
}))

export default useMentorStore
