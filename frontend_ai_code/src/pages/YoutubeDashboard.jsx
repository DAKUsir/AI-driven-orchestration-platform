import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlayCircle, RefreshCw, Loader2, ExternalLink, Trash2,
  Clock, CheckCircle, Filter, ChevronDown, ChevronUp,
  Calendar, ListTodo, AlertCircle, X, BarChart3,
  Plus, LinkIcon, Sparkles, Wand2, Search, Video
} from 'lucide-react'
import useYoutubeStore from '../store/useYoutubeStore'
import api from '../utils/api'

const categoryLabels = {
  dsa: 'DSA', 'web-dev': 'Web Dev', python: 'Python', java: 'Java',
  'ml-ai': 'AI/ML', devops: 'DevOps', mobile: 'Mobile', database: 'Database',
  'system-design': 'System Design', general: 'General', other: 'Other',
}

const categoryColors = {
  dsa: 'bg-amber-500/15 text-amber-400',
  'web-dev': 'bg-blue-500/15 text-blue-400',
  python: 'bg-emerald-500/15 text-emerald-400',
  java: 'bg-orange-500/15 text-orange-400',
  'ml-ai': 'bg-orange-500/15 text-orange-400',
  devops: 'bg-rose-500/15 text-rose-400',
  mobile: 'bg-pink-500/15 text-pink-400',
  database: 'bg-cyan-500/15 text-cyan-400',
  'system-design': 'bg-red-500/15 text-red-400',
  general: 'bg-zinc-500/15 text-zinc-400',
  other: 'bg-zinc-500/15 text-zinc-400',
}

const statusConfig = {
  'not-started': { label: 'Not Started', cls: 'bg-zinc-500/15 text-zinc-400' },
  'in-progress': { label: 'In Progress', cls: 'bg-amber-500/15 text-amber-400' },
  completed: { label: 'Completed', cls: 'bg-emerald-500/15 text-emerald-400' },
  dropped: { label: 'Dropped', cls: 'bg-red-500/15 text-red-400' },
}

function timeSince(date) {
  if (!date) return 'Never'
  const d = new Date(date)
  const now = new Date()
  const diff = Math.floor((now - d) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString()
}

export default function VideoDashboard() {
  const {
    connected, channelTitle, lastSynced, courses, loading, syncing,
    generatingTasks, addingPlaylist, error,
    fetchStatus, fetchCourses, syncYoutube, generateTasks, deleteCourse,
    addPlaylist, clearError,
  } = useYoutubeStore()

  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [courseOnly, setCourseOnly] = useState(false)
  const [taskModal, setTaskModal] = useState(null)
  const [videosPerDay, setVideosPerDay] = useState(3)
  const [taskResult, setTaskResult] = useState(null)

  // Add playlist modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [addSuccess, setAddSuccess] = useState(null)

  // AI discovery state
  const [showAI, setShowAI] = useState(false)
  const [aiTopic, setAiTopic] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [aiError, setAiError] = useState('')
  const [addingIds, setAddingIds] = useState(new Set())
  const [addedIds, setAddedIds] = useState(new Set())

  useEffect(() => {
    fetchStatus()
    // Always fetch courses (works for both OAuth and manual playlists)
    const filters = {}
    if (filterStatus) filters.status = filterStatus
    if (filterCategory) filters.category = filterCategory
    if (courseOnly) filters.courseOnly = 'true'
    fetchCourses(filters)
  }, [])

  useEffect(() => {
    const filters = {}
    if (filterStatus) filters.status = filterStatus
    if (filterCategory) filters.category = filterCategory
    if (courseOnly) filters.courseOnly = 'true'
    fetchCourses(filters)
  }, [filterStatus, filterCategory, courseOnly])

  const handleSync = async () => {
    try {
      await syncYoutube()
    } catch {}
  }

  const handleGenerateTasks = async () => {
    if (!taskModal) return
    try {
      const result = await generateTasks(taskModal, videosPerDay)
      setTaskResult(result)
    } catch {}
  }

  const handleAddPlaylist = async () => {
    if (!playlistUrl.trim()) return
    try {
      const course = await addPlaylist(playlistUrl.trim())
      setAddSuccess(course)
      setPlaylistUrl('')
    } catch {}
  }

  const closeAddModal = () => {
    setShowAddModal(false)
    setPlaylistUrl('')
    setAddSuccess(null)
  }

  const handleAISearch = async () => {
    if (!aiTopic.trim()) return
    setAiLoading(true)
    setAiError('')
    setAiSuggestions([])
    try {
      const { data } = await api.post('/ai/youtube-suggest', { topic: aiTopic.trim() })
      setAiSuggestions(data.suggestions || [])
    } catch (err) {
      setAiError(err.response?.data?.message || 'Failed to get suggestions')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAIAdd = async (suggestion, idx) => {
    setAddingIds(prev => new Set(prev).add(idx))
    try {
      await addPlaylist(suggestion.url)
      setAddedIds(prev => new Set(prev).add(idx))
    } catch (err) {
      console.error('Failed to add playlist:', err)
    } finally {
      setAddingIds(prev => { const s = new Set(prev); s.delete(idx); return s })
    }
  }

  // Stats
  const totalCourses = courses.length
  const inProgress = courses.filter((c) => c.status === 'in-progress').length
  const completed = courses.filter((c) => c.status === 'completed').length
  const totalHours = courses.reduce((acc, c) => acc + (c.estimatedHours || 0), 0)
  const avgProgress = totalCourses > 0
    ? Math.round(courses.reduce((acc, c) => acc + (c.progressPercentage || 0), 0) / totalCourses)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Video className="w-8 h-8 text-red-500" /> YouTube Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {connected ? (
              <>
                Connected as <span style={{ color: 'var(--text-primary)' }}>{channelTitle || 'YouTube User'}</span>
                {lastSynced && <> · Last synced {timeSince(lastSynced)}</>}
              </>
            ) : (
              'Track YouTube courses and playlists'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAI(!showAI); setAiSuggestions([]); setAiError('') }}
            className={`btn btn-sm ${showAI ? 'btn-primary' : 'btn-secondary'}`}
            id="ai-discover-btn"
          >
            <Sparkles className="w-4 h-4" /> AI Discover
          </button>
          <button onClick={() => { setShowAddModal(true); setAddSuccess(null) }}
            className="btn btn-secondary btn-sm" id="add-playlist-btn">
            <Plus className="w-4 h-4" /> Add Playlist
          </button>
          {connected && (
            <button onClick={handleSync} disabled={syncing} className="btn btn-ghost btn-sm btn-icon" id="sync-youtube-btn" title="Sync">
              {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* AI Discovery Panel */}
      <AnimatePresence>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -8, height: 0 }}
            className="card p-5 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--accent-muted)' }}
              >
                <Wand2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  AI Course Discovery
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Describe a topic and AI will find the best YouTube playlists for you
                </p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={aiTopic}
                  onChange={e => setAiTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAISearch()}
                  placeholder="e.g. DSA for interviews, Python for ML, React advanced patterns..."
                  className="input input-with-icon"
                  id="ai-topic-input"
                />
              </div>
              <button
                onClick={handleAISearch}
                disabled={aiLoading || !aiTopic.trim()}
                className="btn btn-primary"
                id="ai-search-btn"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? 'Searching...' : 'Find'}
              </button>
            </div>

            {aiError && (
              <p className="text-sm mb-3" style={{ color: 'var(--danger)' }}>{aiError}</p>
            )}

            {aiSuggestions.length > 0 && (
              <div className="space-y-2">
                {aiSuggestions.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-lg"
                      style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)' }}
                    >
                      ▶
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{s.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {s.channel} · {s.difficulty} · ~{s.estimatedHours}h
                      </p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--text-muted)' }}>{s.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm btn-icon"
                        title="Preview"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleAIAdd(s, i)}
                        disabled={addingIds.has(i) || addedIds.has(i)}
                        className={`btn btn-sm ${addedIds.has(i) ? 'btn-secondary' : 'btn-primary'}`}
                        style={{ minWidth: 70 }}
                      >
                        {addingIds.has(i) ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : addedIds.has(i) ? (
                          <><CheckCircle className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} /> Added</>
                        ) : (
                          <><Plus className="w-3.5 h-3.5" /> Add</>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      {totalCourses > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: totalCourses, color: 'text-zinc-100' },
            { label: 'In Progress', value: inProgress, color: 'text-amber-400' },
            { label: 'Completed', value: completed, color: 'text-emerald-400' },
            { label: 'Total Hours', value: `${Math.round(totalHours)}h`, color: 'text-orange-400' },
            { label: 'Avg Progress', value: `${avgProgress}%`, color: 'text-orange-400' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="card p-4 text-center">
              <p className={`text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      {totalCourses > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <button onClick={() => setCourseOnly(!courseOnly)}
            className={`btn btn-sm ${courseOnly ? 'btn-primary' : 'btn-ghost'}`}>
            <Filter className="w-3.5 h-3.5" /> Courses Only
          </button>
          <div className="w-px h-5 bg-zinc-800" />
          {['', 'in-progress', 'not-started', 'completed'].map((s) => (
            <button key={s || 'all'} onClick={() => setFilterStatus(s)}
              className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-ghost'}`}>
              {s ? statusConfig[s]?.label : 'All Status'}
            </button>
          ))}
          <div className="w-px h-5 bg-zinc-800" />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="input text-xs py-1.5 px-2 w-auto">
            <option value="">All Categories</option>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      )}

      {/* Course Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <PlayCircle className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 mb-2">No courses yet</p>
          <p className="text-xs text-zinc-600 mb-4">
            Add a YouTube playlist URL to start tracking your learning
          </p>
          <button onClick={() => { setShowAddModal(true); setAddSuccess(null) }}
            className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => {
            const catColor = categoryColors[course.category] || categoryColors.other
            const stConf = statusConfig[course.status] || statusConfig['not-started']
            const progress = course.progressPercentage || 0
            const remaining = course.estimatedHours
              ? Math.round(course.estimatedHours * (1 - progress / 100) * 10) / 10
              : null

            return (
              <motion.div key={course._id}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card overflow-hidden group hover:border-zinc-700 transition-all flex flex-col"
              >
                {/* Thumbnail */}
                {course.thumbnail && (
                  <div className="relative h-36 overflow-hidden bg-zinc-900">
                    <img src={course.thumbnail} alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                    <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium ${stConf.cls}`}>
                      {stConf.label}
                    </span>
                  </div>
                )}

                <div className="p-4 flex-1 flex flex-col">
                  {/* Title */}
                  <h3 className="text-sm font-semibold text-zinc-100 mb-1 line-clamp-2 group-hover:text-orange-300 transition-colors">
                    {course.title}
                  </h3>
                  {course.channelTitle && (
                    <p className="text-xs text-zinc-500 mb-2">by {course.channelTitle}</p>
                  )}
                  <span className={`inline-flex w-fit px-2 py-0.5 rounded-md text-[10px] font-medium mb-3 ${catColor}`}>
                    {categoryLabels[course.category] || 'General'}
                  </span>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-zinc-500">
                        {course.completedVideos || 0}/{course.totalVideos} videos
                      </span>
                      <span className="text-xs font-semibold text-zinc-300">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                        className={`h-full rounded-full ${progress === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-red-500 to-rose-400'}`}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-zinc-500 mb-3">
                    {remaining !== null && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {remaining}h left
                      </span>
                    )}
                    {course.lastSynced && (
                      <span>Synced {timeSince(course.lastSynced)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-auto">
                    <Link to={`/youtube/${course._id}`} className="btn btn-primary btn-sm flex-1">
                      <PlayCircle className="w-3.5 h-3.5" /> Continue
                    </Link>
                    <button onClick={() => { setTaskModal(course._id); setTaskResult(null) }}
                      className="btn btn-secondary btn-sm" title="Generate Tasks">
                      <ListTodo className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteCourse(course._id)}
                      className="btn btn-ghost btn-sm btn-icon text-zinc-600 hover:text-red-400" title="Remove">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* ─── Add Playlist Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={closeAddModal}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-red-400" /> Add YouTube Playlist
                </h3>
                <button onClick={closeAddModal} className="btn btn-ghost btn-sm btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {addSuccess ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <p className="text-sm font-medium text-emerald-300">Playlist added!</p>
                    </div>
                    <p className="text-xs text-zinc-400">{addSuccess.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {addSuccess.totalVideos} videos · {addSuccess.estimatedHours}h estimated
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/youtube/${addSuccess._id}`} className="btn btn-primary flex-1 btn-sm"
                      onClick={closeAddModal}>
                      <PlayCircle className="w-4 h-4" /> View Course
                    </Link>
                    <button onClick={() => { setAddSuccess(null); setPlaylistUrl('') }}
                      className="btn btn-secondary btn-sm">
                      <Plus className="w-4 h-4" /> Add Another
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                      YouTube Playlist URL
                    </label>
                    <input
                      type="url"
                      value={playlistUrl}
                      onChange={(e) => setPlaylistUrl(e.target.value)}
                      placeholder="https://youtube.com/playlist?list=PLxxxxxx"
                      className="input"
                      id="playlist-url-input"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddPlaylist()}
                    />
                    <p className="text-[11px] text-zinc-600 mt-1.5">
                      Paste any public YouTube playlist link. No sign-in required.
                    </p>
                  </div>
                  <button onClick={handleAddPlaylist}
                    disabled={addingPlaylist || !playlistUrl.trim()}
                    className="btn btn-primary w-full" id="add-playlist-submit">
                    {addingPlaylist ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Fetching playlist...</>
                    ) : (
                      <><Plus className="w-4 h-4" /> Add Playlist</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Generate Tasks Modal ────────────────────────────────────── */}
      <AnimatePresence>
        {taskModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setTaskModal(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-full max-w-sm">
              <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" /> Generate Study Plan
              </h3>

              {taskResult ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-300">{taskResult.message}</p>
                    <p className="text-xs text-zinc-500 mt-1">{taskResult.totalDays} days of study planned</p>
                  </div>
                  <button onClick={() => setTaskModal(null)} className="btn btn-primary w-full btn-sm">Done</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Videos per day</label>
                    <input type="number" value={videosPerDay}
                      onChange={(e) => setVideosPerDay(parseInt(e.target.value) || 1)}
                      min={1} max={20} className="input" />
                  </div>
                  <button onClick={handleGenerateTasks} disabled={generatingTasks}
                    className="btn btn-primary w-full">
                    {generatingTasks ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListTodo className="w-4 h-4" />}
                    {generatingTasks ? 'Generating...' : 'Generate Tasks'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
