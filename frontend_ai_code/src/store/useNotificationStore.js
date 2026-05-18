import { create } from 'zustand'
import api from '../utils/api'

const useNotificationStore = create((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/notifications')
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.read).length,
        loading: false,
      })
    } catch {
      set({ loading: false })
    }
  },

  markRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}`)
      set((s) => {
        const notifs = s.notifications.map((n) => (n._id === id ? { ...n, read: true } : n))
        return { notifications: notifs, unreadCount: notifs.filter((n) => !n.read).length }
      })
    } catch {}
  },
}))

export default useNotificationStore
