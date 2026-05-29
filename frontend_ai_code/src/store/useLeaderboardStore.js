import { create } from 'zustand'
import api from '../utils/api'

const useLeaderboardStore = create((set) => ({
  entries: [],
  groupEntries: [],
  myRank: null,
  loading: false,
  activeTab: 'global', // global | group
  selectedGroupId: null,

  // User profile panel
  selectedUser: null,
  selectedUserLoading: false,
  showProfilePanel: false,

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedGroupId: (id) => set({ selectedGroupId: id }),

  fetchLeaderboard: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/leaderboard?limit=50')
      set({ entries: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchMyRank: async () => {
    try {
      const { data } = await api.get('/leaderboard/me')
      set({ myRank: data })
    } catch {}
  },

  fetchGroupLeaderboard: async (groupId) => {
    set({ loading: true })
    try {
      const { data } = await api.get(`/leaderboard/group/${groupId}`)
      set({ groupEntries: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  fetchUserProfile: async (userId) => {
    set({ selectedUserLoading: true, showProfilePanel: true })
    try {
      const { data } = await api.get(`/users/${userId}/public-profile`)
      set({ selectedUser: data, selectedUserLoading: false })
    } catch {
      set({ selectedUserLoading: false })
    }
  },

  closeProfilePanel: () => set({ showProfilePanel: false, selectedUser: null }),
}))

export default useLeaderboardStore
