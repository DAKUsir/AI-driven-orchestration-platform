import { create } from 'zustand'
import { io } from 'socket.io-client'
import api from '../utils/api'

let socket = null

const useGroupChatStore = create((set, get) => ({
  // ── Group Chat State ──
  groups: [],
  activeGroup: null,
  messages: [],
  onlineUsers: [],
  typingUsers: [],
  loading: false,
  messagesLoading: false,
  error: null,
  hasMore: false,

  // ── Global Chat State ──
  globalMessages: [],
  globalTypingUsers: [],
  globalOnlineCount: 0,
  globalLoading: false,

  // ── Active View ──
  activeView: 'global', // 'global' | 'groups'
  setActiveView: (view) => set({ activeView: view }),

  connectSocket: () => {
    if (socket) return

    const token = localStorage.getItem('token')
    if (!token) return

    // Connect to Socket.IO
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Socket connected')
      // Auto-join global chat room
      socket.emit('join-global')
    })

    // Group chat listeners
    socket.on('receive-message', (message) => {
      set((state) => ({ messages: [...state.messages, message] }))
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

    // Global chat listeners
    socket.on('receive-global-message', (message) => {
      set((state) => {
        const newMessages = [...state.globalMessages, message]
        // Keep only last 100 on the client side too
        return { globalMessages: newMessages.slice(-100) }
      })
    })

    socket.on('global-user-typing', ({ userId, userName, isTyping }) => {
      set((state) => {
        if (isTyping && !state.globalTypingUsers.find(u => u.userId === userId)) {
          return { globalTypingUsers: [...state.globalTypingUsers, { userId, userName }] }
        } else if (!isTyping) {
          return { globalTypingUsers: state.globalTypingUsers.filter((u) => u.userId !== userId) }
        }
        return state
      })
    })

    socket.on('global-online-count', (count) => {
      set({ globalOnlineCount: count })
    })
  },

  disconnectSocket: () => {
    if (socket) {
      socket.emit('leave-global')
      socket.disconnect()
      socket = null
    }
  },

  getSocket: () => socket,

  // ── Global Chat Actions ──
  fetchGlobalMessages: async () => {
    set({ globalLoading: true })
    try {
      const { data } = await api.get('/groups/global/messages')
      set({ globalMessages: data, globalLoading: false })
    } catch (err) {
      console.error('Failed to fetch global messages:', err)
      set({ globalLoading: false })
    }
  },

  sendGlobalMessage: (content) => {
    if (!content.trim()) return
    if (socket) {
      socket.emit('send-global-message', { content })
    }
  },

  sendGlobalTyping: (isTyping) => {
    if (socket) {
      socket.emit('global-typing', { isTyping })
    }
  },

  // ── Group Chat Actions ──
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
      // Save via REST only — server broadcasts 'receive-message' to everyone
      // including the sender, so we do NOT push to state here.
      await api.post(`/groups/${activeGroup._id}/messages`, { content })
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
