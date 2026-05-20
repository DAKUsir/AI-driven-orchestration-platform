import { create } from 'zustand'
import { io } from 'socket.io-client'
import api from '../utils/api'

let socket = null

const useGroupChatStore = create((set, get) => ({
  groups: [],
  activeGroup: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  messagesLoading: false,
  error: null,
  hasMore: false,

  connectSocket: () => {
    if (socket) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Connect to Socket.IO
    socket = io('http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Socket connected')
    })

    socket.on('receive-message', (message) => {
      set((state) => {
        // Avoid duplicates — sender already added via REST
        if (state.messages.some(m => m._id?.toString() === message._id?.toString())) return state
        return { messages: [...state.messages, message] }
      })
    })

    socket.on('online-users', (users) => {
      set({ onlineUsers: users })
    })

    socket.on('user-typing', ({ userId, userName, isTyping }) => {
      set((state) => {
        if (isTyping && !state.typingUsers.find(u => u.userId === userId)) {
          return { typingUsers: [...state.typingUsers, { userId, userName }] }
        } else if (!isTyping) {
          return { typingUsers: state.typingUsers.filter((u) => u.userId !== userId) }
        }
        return state
      })
    })

    socket.on('system-message', (message) => {
      set((state) => ({ messages: [...state.messages, message] }))
    })
  },

  disconnectSocket: () => {
    if (socket) {
      socket.disconnect()
      socket = null
    }
  },

  getSocket: () => socket,

  fetchGroups: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/groups')
      set({ groups: data, error: null })
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch groups' })
    } finally {
      set({ loading: false })
    }
  },

  createGroup: async (name, description) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/groups', { name, description })
      set((state) => ({ groups: [...state.groups, data], error: null }))
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to create group' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  joinGroup: async (code) => {
    set({ loading: true })
    try {
      const { data } = await api.post('/groups/join', { code })
      get().fetchGroups()
      return data
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to join group' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  leaveGroup: async (groupId) => {
    set({ loading: true })
    try {
      await api.post(`/groups/${groupId}/leave`)
      get().fetchGroups()
      if (get().activeGroup?._id === groupId) {
        get().setActiveGroup(null)
      }
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to leave group' })
      throw err
    } finally {
      set({ loading: false })
    }
  },

  setActiveGroup: async (group) => {
    if (!group) {
      set({ activeGroup: null, messages: [] })
      if (socket) socket.emit('leave-room', get().activeGroup?._id)
      return
    }

    try {
      set({ messagesLoading: true, activeGroup: group })
      const { data } = await api.get(`/groups/${group._id}/messages`)
      // data might be array or { messages, hasMore }
      const msgs = data.messages || data
      set({ messages: msgs, error: null, hasMore: data.hasMore || false })

      if (!socket) get().connectSocket()
      
      socket.emit('join-room', group._id)
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load messages' })
    } finally {
      set({ messagesLoading: false })
    }
  },

  loadMoreMessages: async () => {
    // Basic placeholder, in reality would use pagination cursor
    console.log("Loading more messages...")
  },

  sendMessage: async (content) => {
    const { activeGroup } = get()
    if (!activeGroup) return

    try {
      // Save via REST — the server controller broadcasts to other members via socket
      const { data } = await api.post(`/groups/${activeGroup._id}/messages`, { content })
      // Show immediately for the sender (others get it via server socket broadcast)
      set((state) => ({ messages: [...state.messages, data] }))
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  },

  sendTyping: (isTyping) => {
    const { activeGroup } = get()
    if (activeGroup && socket) {
      socket.emit('typing', { groupId: activeGroup._id, isTyping })
    }
  },
}))

export default useGroupChatStore
