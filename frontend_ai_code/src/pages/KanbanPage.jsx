import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Columns3, Plus, X, GripVertical, CheckCircle, Clock, AlertCircle, Archive, Loader2, Filter } from 'lucide-react'
import useKanbanStore from '../store/useKanbanStore'

const columns = [
  { id: 'backlog', label: 'Backlog', icon: Archive, color: 'text-zinc-500' },
  { id: 'todo', label: 'To Do', icon: AlertCircle, color: 'text-indigo-400' },
  { id: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-amber-400' },
  { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-400' },
]

const difficultyColors = {
  easy: 'badge-success',
  medium: 'badge-warning',
  hard: 'badge-danger',
}

const typeColors = {
  'problem-solving': 'badge-accent',
  'project': 'badge-info',
  'mock-interview': 'badge-warning',
  'system-design': 'badge-info',
  'video': 'badge-neutral',
  'article': 'badge-neutral',
  'quiz': 'badge-success',
}

export default function KanbanPage() {
  const { tasks, loading, fetchTasks, moveTask, createTask } = useKanbanStore()
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', taskType: 'problem-solving', difficulty: 'medium' })
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    // Add drag image styling
    setTimeout(() => {
      e.target.classList.add('kanban-card-dragging')
    }, 0)
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('kanban-card-dragging')
    setDraggedTask(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e, colId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverCol(colId)
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    setDragOverCol(null)
    if (draggedTask && draggedTask.kanbanStatus !== colId) {
      moveTask(draggedTask._id, colId)
    }
    setDraggedTask(null)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    await createTask(newTask)
    setNewTask({ title: '', description: '', taskType: 'problem-solving', difficulty: 'medium' })
    setShowModal(false)
  }

  const getColumnTasks = (colId) => {
    return tasks.filter(t => (t.kanbanStatus || 'backlog') === colId)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Kanban Board</h1>
          <p className="text-sm text-zinc-500 mt-1">Drag and drop tasks to organize your workflow</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary btn-sm"
          id="add-task-btn"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[500px]">
          {columns.map(({ id, label, icon: Icon, color }) => {
            const colTasks = getColumnTasks(id)
            const isOver = dragOverCol === id
            return (
              <div
                key={id}
                className="flex flex-col"
                onDragOver={(e) => handleDragOver(e, id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, id)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <h3 className="text-sm font-semibold text-zinc-300">{label}</h3>
                  <span className="text-xs text-zinc-600 ml-auto">{colTasks.length}</span>
                </div>

                {/* Column body */}
                <div
                  className={`flex-1 rounded-xl p-2 space-y-2 transition-all kanban-column ${
                    isOver ? 'kanban-drop-target' : 'bg-zinc-900/30'
                  }`}
                >
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="card p-3 cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical className="w-4 h-4 text-zinc-700 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 mb-1 line-clamp-2">{task.title}</p>
                          {task.description && (
                            <p className="text-xs text-zinc-600 mb-2 line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1">
                            {task.taskType && (
                              <span className={`badge text-[10px] ${typeColors[task.taskType] || 'badge-neutral'}`}>
                                {task.taskType}
                              </span>
                            )}
                            {task.difficulty && (
                              <span className={`badge text-[10px] ${difficultyColors[task.difficulty] || 'badge-neutral'}`}>
                                {task.difficulty}
                              </span>
                            )}
                          </div>
                          {task.platformLink && (
                            <a
                              href={task.platformLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-1.5 inline-block"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {task.platform || 'Open'} →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {colTasks.length === 0 && !isOver && (
                    <div className="flex items-center justify-center h-24 text-xs text-zinc-700">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Task Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-zinc-100">Add Task</h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Two Sum — LeetCode #1"
                    required
                    className="input"
                    id="new-task-title"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={3}
                    className="input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Type</label>
                    <select
                      value={newTask.taskType}
                      onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                      className="input"
                    >
                      <option value="problem-solving">Problem Solving</option>
                      <option value="system-design">System Design</option>
                      <option value="project">Project</option>
                      <option value="mock-interview">Mock Interview</option>
                      <option value="video">Video</option>
                      <option value="article">Article</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Difficulty</label>
                    <select
                      value={newTask.difficulty}
                      onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })}
                      className="input"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full" id="create-task-submit">
                  <Plus className="w-4 h-4" /> Create Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
