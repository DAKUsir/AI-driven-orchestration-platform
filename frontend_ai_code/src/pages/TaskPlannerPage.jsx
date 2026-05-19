import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, CheckCircle, Clock, AlertCircle, Archive, Loader2, ExternalLink, Filter, Search } from 'lucide-react'
import useTaskStore from '../store/useTaskStore'

const columns = [
  { id: 'pending', label: 'Pending', icon: AlertCircle, color: 'text-indigo-400' },
  { id: 'in-progress', label: 'In Progress', icon: Clock, color: 'text-amber-400' },
  { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-emerald-400' },
  { id: 'skipped', label: 'Skipped', icon: Archive, color: 'text-zinc-500' },
]

const categoryOptions = [
  { value: 'youtube', label: '🎬 YouTube' },
  { value: 'coursera', label: '📚 Coursera' },
  { value: 'github', label: '🐙 GitHub' },
  { value: 'leetcode', label: '💻 LeetCode' },
  { value: 'gfg', label: '📗 GFG' },
  { value: 'kaggle', label: '📊 Kaggle' },
  { value: 'interview-prep', label: '🎯 Interview Prep' },
  { value: 'other', label: '📝 Other' },
]

const priorityColors = { low: 'badge-neutral', medium: 'badge-info', high: 'badge-warning', urgent: 'badge-danger' }
const difficultyColors = { easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger' }

const emptyTask = {
  title: '', description: '', sourceLink: '', category: 'other',
  priority: 'medium', difficulty: 'medium', dueDate: '', estimatedMinutes: 30, tags: '',
}

export default function TaskPlannerPage() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore()
  const [showModal, setShowModal] = useState(false)
  const [newTask, setNewTask] = useState({ ...emptyTask })
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [filterCat, setFilterCat] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTasks() }, [])

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => e.target.classList.add('kanban-card-dragging'), 0)
  }

  const handleDragEnd = (e) => {
    e.target.classList.remove('kanban-card-dragging')
    setDraggedTask(null)
    setDragOverCol(null)
  }

  const handleDrop = (e, colId) => {
    e.preventDefault()
    setDragOverCol(null)
    if (draggedTask && draggedTask.status !== colId) {
      updateTask(draggedTask._id, { status: colId })
    }
    setDraggedTask(null)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    await createTask({
      ...newTask,
      tags: newTask.tags ? newTask.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      dueDate: newTask.dueDate || undefined,
    })
    setNewTask({ ...emptyTask })
    setShowModal(false)
  }

  const getColumnTasks = (colId) => {
    return tasks
      .filter((t) => (t.status || 'pending') === colId)
      .filter((t) => !filterCat || t.category === filterCat)
      .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Task Planner</h1>
          <p className="text-sm text-zinc-500 mt-1">Drag and drop tasks to update their status</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" id="add-task-btn">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} className="input input-with-icon text-sm" style={{ paddingLeft: 36 }} />
        </div>
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="input text-sm w-auto" style={{ maxWidth: 180 }}>
          <option value="">All Categories</option>
          {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
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
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(id) }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={(e) => handleDrop(e, id)}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <h3 className="text-sm font-semibold text-zinc-300">{label}</h3>
                  <span className="text-xs text-zinc-600 ml-auto">{colTasks.length}</span>
                </div>
                <div className={`flex-1 rounded-xl p-2 space-y-2 transition-all kanban-column ${isOver ? 'kanban-drop-target' : 'bg-zinc-900/30'}`}>
                  {colTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="card p-3 cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-all"
                    >
                      <p className="text-sm font-medium text-zinc-200 mb-1 line-clamp-2">{task.title}</p>
                      {task.description && <p className="text-xs text-zinc-600 mb-2 line-clamp-1">{task.description}</p>}
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        <span className="text-[10px] text-zinc-500">{categoryOptions.find((c) => c.value === task.category)?.label || '📝 Other'}</span>
                        {task.priority && <span className={`badge text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</span>}
                        {task.difficulty && <span className={`badge text-[10px] ${difficultyColors[task.difficulty]}`}>{task.difficulty}</span>}
                      </div>
                      {task.dueDate && (
                        <p className="text-[10px] text-zinc-600">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                      {task.sourceLink && (
                        <a href={task.sourceLink} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-400 hover:text-indigo-300 mt-1 inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {task.isCarryForward && <span className="badge badge-warning text-[10px] mt-1">carried</span>}
                    </div>
                  ))}
                  {colTasks.length === 0 && !isOver && (
                    <div className="flex items-center justify-center h-24 text-xs text-zinc-700">Drop tasks here</div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} onClick={(e) => e.stopPropagation()} className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-zinc-100">Add Task</h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300 p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Title *</label>
                  <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="e.g. Complete Two Sum on LeetCode" required className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Source Link</label>
                  <input type="url" value={newTask.sourceLink} onChange={(e) => setNewTask({ ...newTask, sourceLink: e.target.value })} placeholder="https://leetcode.com/problems/two-sum" className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Description</label>
                  <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Optional details..." rows={2} className="input" style={{ minHeight: 60, resize: 'vertical' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Category</label>
                    <select value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value })} className="input">
                      {categoryOptions.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Priority</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Difficulty</label>
                    <select value={newTask.difficulty} onChange={(e) => setNewTask({ ...newTask, difficulty: e.target.value })} className="input">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Est. Minutes</label>
                    <input type="number" value={newTask.estimatedMinutes} onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })} className="input" min={5} max={480} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Due Date</label>
                    <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Tags</label>
                    <input type="text" value={newTask.tags} onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })} placeholder="dp, arrays, ..." className="input" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full"><Plus className="w-4 h-4" /> Create Task</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
