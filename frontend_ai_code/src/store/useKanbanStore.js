import { create } from 'zustand'
import api from '../utils/api'

const useKanbanStore = create((set, get) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    try {
      const { data } = await api.get('/tasks')
      set({ tasks: data, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  moveTask: async (taskId, newStatus) => {
    // Optimistic update
    set((s) => ({
      tasks: s.tasks.map((t) =>
        t._id === taskId
          ? { ...t, kanbanStatus: newStatus, completed: newStatus === 'done' }
          : t
      ),
    }))

    try {
      await api.patch(`/tasks/${taskId}`, {
        kanbanStatus: newStatus,
        completed: newStatus === 'done',
      })
    } catch {
      // Revert on error
      get().fetchTasks()
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await api.post('/tasks/create', {
        ...taskData,
        kanbanStatus: 'backlog',
        roadmapId: '000000000000000000000000', // placeholder for manual tasks
      })
      set((s) => ({ tasks: [...s.tasks, data] }))
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  },
}))

export default useKanbanStore
