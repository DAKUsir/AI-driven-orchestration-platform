import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayCircle, BookOpen, Clock, Loader2, CheckCircle, Search,
  Plus, X, Trash2, ExternalLink, Filter, TrendingUp, AlertCircle, Video, BookOpen as BookOpenIcon, GraduationCap, Library, Palette, Book,
  ChevronUp, ChevronDown
} from 'lucide-react'
import useCourseStore from '../store/useCourseStore'

const platformConfig = {
  youtube: { label: 'YouTube', icon: <Video className="w-5 h-5" />, color: 'from-red-500 to-rose-500', badge: 'bg-red-500/15 text-red-400' },
  coursera: { label: 'Coursera', icon: <BookOpenIcon className="w-5 h-5" />, color: 'from-blue-500 to-cyan-500', badge: 'bg-blue-500/15 text-blue-400' },
  udemy: { label: 'Udemy', icon: <GraduationCap className="w-5 h-5" />, color: 'from-orange-500 to-orange-500', badge: 'bg-orange-500/15 text-orange-400' },
  edx: { label: 'edX', icon: <Library className="w-5 h-5" />, color: 'from-sky-500 to-blue-500', badge: 'bg-sky-500/15 text-sky-400' },
  skillshare: { label: 'Skillshare', icon: <Palette className="w-5 h-5" />, color: 'from-emerald-500 to-green-500', badge: 'bg-emerald-500/15 text-emerald-400' },
  other: { label: 'Other', icon: <Book className="w-5 h-5" />, color: 'from-zinc-500 to-zinc-600', badge: 'bg-zinc-500/15 text-zinc-400' },
}

const statusConfig = {
  'not-started': { label: 'Not Started', cls: 'badge-neutral', icon: Clock },
  'in-progress': { label: 'In Progress', cls: 'badge-warning', icon: PlayCircle },
  completed: { label: 'Completed', cls: 'badge-success', icon: CheckCircle },
  dropped: { label: 'Dropped', cls: 'badge-danger', icon: X },
}

const emptyForm = {
  title: '', platform: 'youtube', url: '', instructor: '',
  totalModules: 1, notes: '', thumbnailUrl: '', tags: '',
}

export default function CourseTrackerPage() {
  const { courses, stats, loading, fetchCourses, fetchStats, addCourse, updateCourse, deleteCourse } = useCourseStore()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ ...emptyForm })
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    fetchCourses()
    fetchStats()
  }, [])

  useEffect(() => {
    const filters = {}
    if (filterPlatform) filters.platform = filterPlatform
    if (filterStatus) filters.status = filterStatus
    fetchCourses(filters)
  }, [filterPlatform, filterStatus])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.url.trim()) return
    await addCourse({
      ...form,
      totalModules: parseInt(form.totalModules) || 1,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    })
    setForm({ ...emptyForm })
    setShowModal(false)
    fetchStats()
  }

  const handleProgressUp = async (course) => {
    const next = Math.min(course.completedModules + 1, course.totalModules)
    const newStatus = next >= course.totalModules ? 'completed' : 'in-progress'
    await updateCourse(course._id, { completedModules: next, status: newStatus })
    fetchStats()
  }

  const handleProgressDown = async (course) => {
    const next = Math.max(course.completedModules - 1, 0)
    const newStatus = next === 0 ? 'not-started' : 'in-progress'
    await updateCourse(course._id, { completedModules: next, status: newStatus })
    fetchStats()
  }

  const handleStatusChange = async (course, status) => {
    await updateCourse(course._id, { status })
    fetchStats()
  }

  const handleDelete = async (id) => {
    await deleteCourse(id)
    fetchStats()
  }

  const platforms = Object.keys(platformConfig)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-orange-400" /> Course Tracker
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Track your YouTube, Coursera, and other courses in one place</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" id="add-course-btn">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'text-zinc-100', bg: 'bg-zinc-800' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-amber-400', bg: 'bg-amber-500/10' },
            { label: 'Completed', value: stats.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Not Started', value: stats.notStarted, color: 'text-zinc-400', bg: 'bg-zinc-800/50' },
          ].map(({ label, value, color, bg }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-[11px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setFilterPlatform(''); setFilterStatus('') }} className={`btn btn-sm ${!filterPlatform && !filterStatus ? 'btn-primary' : 'btn-secondary'}`}>
          All
        </button>
        {platforms.map((p) => (
          <button key={p} onClick={() => setFilterPlatform(p === filterPlatform ? '' : p)} className={`btn btn-sm ${filterPlatform === p ? 'btn-primary' : 'btn-ghost'}`}>
            {platformConfig[p].icon} {platformConfig[p].label}
          </button>
        ))}
        <div className="w-px bg-zinc-800 mx-1" />
        {Object.entries(statusConfig).map(([key, { label }]) => (
          <button key={key} onClick={() => setFilterStatus(key === filterStatus ? '' : key)} className={`btn btn-sm ${filterStatus === key ? 'btn-primary' : 'btn-ghost'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <GraduationCap className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 mb-2">No courses tracked yet</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Your First Course
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => {
            const pConf = platformConfig[course.platform] || platformConfig.other
            const sConf = statusConfig[course.status] || statusConfig['not-started']
            const progress = course.totalModules > 0
              ? Math.round((course.completedModules / course.totalModules) * 100)
              : 0
            const expanded = expandedId === course._id

            return (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-5 flex flex-col group hover:border-zinc-700 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${pConf.color} flex items-center justify-center text-lg flex-shrink-0`}>
                    {pConf.icon}
                  </div>
                  <span className={`badge text-[10px] ${sConf.cls}`}>{sConf.label}</span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-zinc-100 mb-1 line-clamp-2 group-hover:text-orange-300 transition-colors">
                  {course.title}
                </h3>
                {course.instructor && (
                  <p className="text-xs text-zinc-500 mb-2">by {course.instructor}</p>
                )}
                <p className={`text-[11px] ${pConf.badge} inline-flex w-fit px-2 py-0.5 rounded-md mb-3`}>
                  {pConf.label}
                </p>

                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-zinc-500">{course.completedModules}/{course.totalModules} modules</span>
                    <span className="text-xs font-semibold text-zinc-300">{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5 }}
                      className={`h-full rounded-full ${
                        progress === 100
                          ? 'bg-gradient-to-r from-emerald-500 to-green-400'
                          : 'bg-gradient-to-r from-orange-500 to-orange-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Module increment buttons */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => handleProgressDown(course)}
                    disabled={course.completedModules === 0}
                    className="btn btn-ghost btn-sm btn-icon p-1.5"
                    title="Mark module incomplete"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-zinc-400 flex-1 text-center">
                    {course.completedModules === course.totalModules ? 'All done!' : `${course.totalModules - course.completedModules} left`}
                  </span>
                  <button
                    onClick={() => handleProgressUp(course)}
                    disabled={course.completedModules >= course.totalModules}
                    className="btn btn-ghost btn-sm btn-icon p-1.5"
                    title="Mark module complete"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto">
                  <a href={course.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm flex-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <button onClick={() => setExpandedId(expanded ? null : course._id)} className="btn btn-secondary btn-sm btn-icon">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleDelete(course._id)} className="btn btn-ghost btn-sm btn-icon text-zinc-600 hover:text-red-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {expanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-zinc-800/60 space-y-2">
                        {course.notes && <p className="text-xs text-zinc-400">{course.notes}</p>}
                        {course.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {course.tags.map((t) => <span key={t} className="badge badge-neutral text-[10px]">{t}</span>)}
                          </div>
                        )}
                        <select
                          value={course.status}
                          onChange={(e) => handleStatusChange(course, e.target.value)}
                          className="input text-xs w-full"
                        >
                          {Object.entries(statusConfig).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add Course Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} onClick={(e) => e.stopPropagation()} className="card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-zinc-100">Add Course</h2>
                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-zinc-300 p-1"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Course Title *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Striver's A2Z DSA Course" required className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Course URL *</label>
                  <input type="url" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://youtube.com/playlist?list=..." required className="input" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Platform</label>
                    <select value={form.platform} onChange={(e) => setForm({ ...form, platform: e.target.value })} className="input">
                      {platforms.map((p) => <option key={p} value={p}>{platformConfig[p].icon} {platformConfig[p].label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Total Modules</label>
                    <input type="number" value={form.totalModules} onChange={(e) => setForm({ ...form, totalModules: e.target.value })} min={1} max={500} className="input" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Instructor</label>
                  <input type="text" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} placeholder="e.g. Striver, Andrew Ng" className="input" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." rows={2} className="input" style={{ minHeight: 50, resize: 'vertical' }} />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Tags</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="dsa, web-dev, ml ..." className="input" />
                </div>
                <button type="submit" className="btn btn-primary w-full"><Plus className="w-4 h-4" /> Add Course</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
