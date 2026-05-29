import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, X, CheckCircle, Clock, AlertCircle, Archive,
  Loader2, ExternalLink, Search, Sparkles, Wand2, PartyPopper
} from 'lucide-react'
import useTaskStore from '../store/useTaskStore'

const columns = [
  { id: 'pending',     label: 'Pending',     icon: AlertCircle, color: '#818cf8' },
  { id: 'in-progress', label: 'In Progress', icon: Clock,       color: '#fbbf24' },
  { id: 'done',        label: 'Done',        icon: CheckCircle, color: '#4ade80' },
  { id: 'skipped',     label: 'Skipped',     icon: Archive,     color: '#71717a' },
]

const categoryOptions = [
  { value: 'youtube',        label: 'YouTube' },
  { value: 'coursera',       label: 'Coursera' },
  { value: 'github',         label: 'GitHub' },
  { value: 'leetcode',       label: 'LeetCode' },
  { value: 'gfg',            label: 'GFG' },
  { value: 'kaggle',         label: 'Kaggle' },
  { value: 'interview-prep', label: 'Interview Prep' },
  { value: 'other',          label: 'Other' },
]

const priorityColors = {
  low: 'badge-neutral', medium: 'badge-info', high: 'badge-warning', urgent: 'badge-danger'
}
const difficultyColors = {
  easy: 'badge-success', medium: 'badge-warning', hard: 'badge-danger'
}

const emptyTask = {
  title: '', description: '', sourceLink: '', category: 'other',
  priority: 'medium', difficulty: 'medium', dueDate: '', estimatedMinutes: 30, tags: '',
}

export default function TaskPlannerPage() {
  const { tasks, loading, fetchTasks, createTask, updateTask, deleteTask, generateTasksWithAI } = useTaskStore()
  const [showModal, setShowModal]   = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [newTask, setNewTask]       = useState({ ...emptyTask })
  const [draggedTask, setDraggedTask] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [filterCat, setFilterCat]   = useState('')
  const [search, setSearch]         = useState('')

  // AI state
  const [aiGoal, setAiGoal]         = useState('')
  const [aiCategory, setAiCategory] = useState('other')
  const [aiIntensity, setAiIntensity]= useState('balanced')
  const [aiCount, setAiCount]       = useState(5)
  const [aiDeadline, setAiDeadline] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().split('T')[0]
  })
  const [aiLoading, setAiLoading]   = useState(false)
  const [aiResult, setAiResult]     = useState(null)
  const [aiError, setAiError]       = useState('')

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
    if (draggedTask && draggedTask.status !== colId) updateTask(draggedTask._id, { status: colId })
    setDraggedTask(null)
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return
    await createTask({
      ...newTask,
      tags: newTask.tags ? newTask.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      dueDate: newTask.dueDate || undefined,
    })
    setNewTask({ ...emptyTask })
    setShowModal(false)
  }

  const handleAIGenerate = async () => {
    if (!aiGoal.trim()) {
      setAiError('Please provide a goal.')
      return
    }
    setAiLoading(true)
    setAiError('')
    setAiResult(null)
    
    // Calculate count based on intensity and deadline
    const today = new Date()
    const deadlineDate = new Date(aiDeadline)
    const daysFromNow = Math.max(1, Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24)))
    
    let finalCount = aiCount
    if (aiIntensity !== 'custom') {
      if (aiIntensity === 'relaxed') finalCount = Math.max(2, Math.floor(daysFromNow / 3))
      if (aiIntensity === 'balanced') finalCount = Math.max(3, Math.floor(daysFromNow / 2))
      if (aiIntensity === 'intensive') finalCount = Math.max(5, daysFromNow)
      finalCount = Math.min(15, finalCount)
    }

    try {
      const created = await generateTasksWithAI({
        goal: aiGoal.trim(), 
        category: aiCategory, 
        count: finalCount, 
        deadline: aiDeadline
      })
      setAiResult(created.length)
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to generate tasks. Try again.')
    } finally {
      setAiLoading(false)
    }
  }

  const getColumnTasks = (colId) =>
    tasks
      .filter(t => (t.status || 'pending') === colId)
      .filter(t => !filterCat || t.category === filterCat)
      .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Task Planner
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Drag and drop tasks to update their status
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAIModal(true); setAiResult(null); setAiError('') }}
            className="btn btn-secondary btn-sm"
            id="ai-generate-btn"
          >
            <Sparkles className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            AI Generate
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" id="add-task-btn">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input input-with-icon text-sm"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="input text-sm"
          style={{ width: 'auto', maxWidth: 180 }}
        >
          <option value="">All Categories</option>
          {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
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
                onDragOver={e => { e.preventDefault(); setDragOverCol(id) }}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, id)}
              >
                <div className="flex items-center gap-2 mb-3 px-1">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{label}</h3>
                  <span className="text-xs ml-auto" style={{ color: 'var(--text-faint)' }}>{colTasks.length}</span>
                </div>
                <div
                  className={`flex-1 rounded-xl p-2 space-y-2 transition-all kanban-column ${isOver ? 'kanban-drop-target' : ''}`}
                  style={!isOver ? { background: 'var(--bg-elevated)', opacity: 0.6 } : {}}
                >
                  {colTasks.map(task => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={e => handleDragStart(e, task)}
                      onDragEnd={handleDragEnd}
                      className="card p-3 cursor-grab active:cursor-grabbing transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium line-clamp-2 flex-1" style={{ color: 'var(--text-primary)' }}>
                          {task.title}
                        </p>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="text-[color:var(--text-faint)] hover:text-[color:var(--danger)] flex-shrink-0 p-0.5 transition-colors"
                          title="Delete"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {task.description && (
                        <p className="text-xs mt-1 line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {categoryOptions.find(c => c.value === task.category)?.label || 'Other'}
                        </span>
                        {task.priority && (
                          <span className={`badge text-[10px] ${priorityColors[task.priority]}`}>{task.priority}</span>
                        )}
                        {task.difficulty && (
                          <span className={`badge text-[10px] ${difficultyColors[task.difficulty]}`}>{task.difficulty}</span>
                        )}
                      </div>
                      {task.dueDate && (
                        <p className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {task.sourceLink && (
                        <a
                          href={task.sourceLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] mt-1 inline-flex items-center gap-1 transition-colors"
                          style={{ color: 'var(--accent)' }}
                          onClick={e => e.stopPropagation()}
                        >
                          Open <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {task.isCarryForward && (
                        <span className="badge badge-warning text-[10px] mt-1">carried</span>
                      )}
                    </div>
                  ))}
                  {colTasks.length === 0 && !isOver && (
                    <div
                      className="flex items-center justify-center h-24 text-xs rounded-lg"
                      style={{ color: 'var(--text-faint)' }}
                    >
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Add Task Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Add Task</h2>
                <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Title *</label>
                  <input
                    type="text" value={newTask.title}
                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="e.g. Complete Two Sum on LeetCode" required className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Source Link</label>
                  <input
                    type="url" value={newTask.sourceLink}
                    onChange={e => setNewTask({ ...newTask, sourceLink: e.target.value })}
                    placeholder="https://leetcode.com/problems/two-sum" className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Optional details..." rows={2} className="input"
                    style={{ minHeight: 60, resize: 'vertical' }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Category</label>
                    <select value={newTask.category} onChange={e => setNewTask({ ...newTask, category: e.target.value })} className="input">
                      {categoryOptions.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Priority</label>
                    <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })} className="input">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Difficulty</label>
                    <select value={newTask.difficulty} onChange={e => setNewTask({ ...newTask, difficulty: e.target.value })} className="input">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Est. Minutes</label>
                    <input
                      type="number" value={newTask.estimatedMinutes}
                      onChange={e => setNewTask({ ...newTask, estimatedMinutes: parseInt(e.target.value) || 30 })}
                      className="input" min={5} max={480}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Due Date</label>
                    <input type="date" value={newTask.dueDate} onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })} className="input" />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>Tags</label>
                    <input
                      type="text" value={newTask.tags}
                      onChange={e => setNewTask({ ...newTask, tags: e.target.value })}
                      placeholder="dp, arrays, ..." className="input"
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  <Plus className="w-4 h-4" /> Create Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI Generate Modal ── */}
      <AnimatePresence>
        {showAIModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => { setShowAIModal(false); setAiResult(null); setAiError('') }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--accent-muted)' }}
                  >
                    <Wand2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  </div>
                  <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                    AI Task Generator
                  </h2>
                </div>
                <button
                  onClick={() => { setShowAIModal(false); setAiResult(null); setAiError('') }}
                  className="btn btn-ghost btn-sm btn-icon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Describe your learning goal and AI will generate a personalized task plan.
              </p>

              {aiResult !== null ? (
                <div className="space-y-4">
                  <div
                    className="p-4 rounded-xl text-center"
                    style={{ background: 'var(--success-muted)', border: '1px solid rgba(34,197,94,0.2)' }}
                  >
                    <div className="mb-2 flex justify-center text-emerald-400"><PartyPopper className="w-10 h-10" /></div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
                      {aiResult} tasks created!
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                      Check your Task Planner — they're in the Pending column.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setAiResult(null); setAiGoal(''); setAiError('') }}
                      className="btn btn-secondary btn-sm flex-1"
                    >
                      Generate More
                    </button>
                    <button
                      onClick={() => { setShowAIModal(false); setAiResult(null) }}
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                      What do you want to learn? *
                    </label>
                    <textarea
                      value={aiGoal}
                      onChange={e => setAiGoal(e.target.value)}
                      placeholder="e.g. Master dynamic programming in 2 weeks, or Learn React hooks and context API"
                      className="input"
                      rows={3}
                      style={{ minHeight: 80, resize: 'none' }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map(cat => (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setAiCategory(cat.value)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                            aiCategory === cat.value 
                              ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 shadow-sm' 
                              : 'bg-transparent border-zinc-700/50 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                        Target Deadline
                      </label>
                      <input
                        type="date"
                        value={aiDeadline}
                        onChange={e => setAiDeadline(e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                        Intensity
                      </label>
                      <select value={aiIntensity} onChange={e => setAiIntensity(e.target.value)} className="input text-sm">
                        <option value="relaxed">Relaxed (~1 task/3 days)</option>
                        <option value="balanced">Balanced (~1 task/2 days)</option>
                        <option value="intensive">Intensive (~1 task/day)</option>
                        <option value="custom">Exact Amount</option>
                      </select>
                    </div>
                  </div>
                  <AnimatePresence>
                    {aiIntensity === 'custom' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-1">
                          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                            Number of tasks
                          </label>
                          <input
                            type="number" value={aiCount}
                            onChange={e => setAiCount(Math.min(15, Math.max(1, parseInt(e.target.value) || 5)))}
                            className="input text-sm w-full" min={1} max={15}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {aiError && (
                    <p className="text-sm" style={{ color: 'var(--danger)' }}>{aiError}</p>
                  )}

                  <button
                    onClick={handleAIGenerate}
                    disabled={aiLoading || !aiGoal.trim()}
                    className="btn btn-primary w-full"
                    id="ai-generate-submit"
                  >
                    {aiLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Generating tasks...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Generate Tasks</>
                    )}
                  </button>

                  {aiLoading && (
                    <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      AI is creating your personalized task plan... (~10-20s)
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
