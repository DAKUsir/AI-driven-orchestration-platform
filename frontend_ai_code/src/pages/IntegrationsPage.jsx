import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, BookOpen, GitBranch, RefreshCw, CheckCircle, Plus, X, Trash2,
  ExternalLink, Loader2, Star, GitFork, FolderKanban, AlertCircle, Zap,
  PlayCircle, Unplug,
} from 'lucide-react'
import useIntegrationStore from '../store/useIntegrationStore'
import useYoutubeStore from '../store/useYoutubeStore'
import useAuthStore from '../store/useAuthStore'
import api from '../utils/api'

const platformConfig = {
  LeetCode: {
    icon: Code2,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-400',
    placeholder: 'e.g. leetcode_user123',
    urlPrefix: 'https://leetcode.com/u/',
  },
  GeeksForGeeks: {
    icon: BookOpen,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-400',
    placeholder: 'e.g. gfg_user123',
    urlPrefix: 'https://www.geeksforgeeks.org/user/',
  },
}

const categoryColors = {
  'Web Dev': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  'AI/ML': 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  'Mobile': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'DevOps': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Data Science': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'Systems': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Other': 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

export default function IntegrationsPage() {
  const {
    profiles, projects, loading, syncing, syncingAll, error,
    fetchIntegrations, connectPlatform, syncPlatform, syncAll,
    fetchProjects, addProject, removeProject, clearError,
  } = useIntegrationStore()

  const { user, loadUser } = useAuthStore()

  const [usernames, setUsernames] = useState({ LeetCode: '', GeeksForGeeks: '' })
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectUrl, setProjectUrl] = useState('')
  const [projectPlatform, setProjectPlatform] = useState('GitHub')
  const [addingProject, setAddingProject] = useState(false)

  const yt = useYoutubeStore()

  useEffect(() => {
    fetchIntegrations()
    fetchProjects()
    yt.fetchStatus()
  }, [])

  // Check for YouTube callback query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('youtube') === 'connected') {
      yt.fetchStatus()
      window.history.replaceState({}, '', '/integrations')
    }
  }, [])

  // Pre-fill usernames from user data
  useEffect(() => {
    if (user) {
      setUsernames({
        LeetCode: user.leetcodeUsername || '',
        GeeksForGeeks: user.gfgUsername || '',
      })
    }
  }, [user])

  const getProfile = (platform) => profiles.find((p) => p.platform === platform)

  const handleConnect = async (platform) => {
    const username = usernames[platform]?.trim()
    if (!username) return
    try {
      await connectPlatform(platform, username)
      await loadUser()
    } catch {}
  }

  const handleSync = async (platform) => {
    try {
      await syncPlatform(platform)
      await loadUser()
    } catch {}
  }

  const handleSyncAll = async () => {
    try {
      await syncAll()
      await loadUser()
    } catch {}
  }

  const handleAddProject = async () => {
    if (!projectUrl.trim()) return
    setAddingProject(true)
    try {
      await addProject(projectUrl.trim(), projectPlatform)
      setProjectUrl('')
      setShowProjectModal(false)
    } catch {}
    setAddingProject(false)
  }

  const timeSince = (date) => {
    if (!date) return 'Never'
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Integrations</h1>
          <p className="text-sm text-zinc-500 mt-1">Connect your accounts and track your projects</p>
        </div>
        {profiles.length > 0 && (
          <button
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="btn btn-secondary btn-sm"
          >
            {syncingAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Sync All
          </button>
        )}
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300 flex-1">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Section 0: YouTube Integration ──────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          YouTube Integration
        </h2>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">
          <div className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 text-xl">
              🎬
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-base font-semibold text-zinc-100">YouTube</h3>
                {yt.connected && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              {yt.connected ? (
                <p className="text-xs text-zinc-500">
                  {yt.channelTitle || 'YouTube Account'} · Track playlists as courses
                </p>
              ) : (
                <p className="text-xs text-zinc-500">Connect to auto-track your YouTube playlists and courses</p>
              )}
            </div>

            {yt.connected ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link to="/youtube" className="btn btn-primary btn-sm">
                  <PlayCircle className="w-4 h-4" /> Dashboard
                </Link>
                <button onClick={() => yt.disconnectYoutube()} className="btn btn-ghost btn-sm text-zinc-500 hover:text-red-400">
                  <Unplug className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => yt.connectYoutube()} className="btn btn-primary btn-sm flex-shrink-0" id="connect-youtube-btn">
                <Plus className="w-4 h-4" /> Connect YouTube
              </button>
            )}
          </div>

          {yt.connected && (
            <div className="border-t border-zinc-800/60 px-5 py-3 flex items-center gap-4 text-xs text-zinc-500">
              <span>Last synced: {yt.lastSynced ? new Date(yt.lastSynced).toLocaleString() : 'Never'}</span>
              <Link to="/youtube" className="text-indigo-400 hover:text-indigo-300 ml-auto flex items-center gap-1">
                View courses <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </motion.div>
      </section>

      {/* ─── Section 1: Coding Platform Connections ─────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
          Coding Platforms
        </h2>
        <div className="space-y-4">
          {Object.entries(platformConfig).map(([platform, config], i) => {
            const profile = getProfile(platform)
            const Icon = config.icon
            const isSyncing = syncing[platform]
            const isConnected = !!profile

            return (
              <motion.div
                key={platform}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card overflow-hidden"
              >
                {/* Header */}
                <div className="p-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-semibold text-zinc-100">{platform}</h3>
                      {isConnected && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </span>
                      )}
                    </div>
                    {isConnected ? (
                      <p className="text-xs text-zinc-500">
                        @{profile.username} · Last synced {timeSince(profile.lastSynced)}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500">Enter your username to connect</p>
                    )}
                  </div>

                  {isConnected && (
                    <button
                      onClick={() => handleSync(platform)}
                      disabled={isSyncing}
                      className="btn btn-secondary btn-sm flex-shrink-0"
                    >
                      {isSyncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      Sync
                    </button>
                  )}
                </div>

                {/* Connect form (if not connected) */}
                {!isConnected && (
                  <div className="px-5 pb-5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={usernames[platform]}
                        onChange={(e) =>
                          setUsernames((prev) => ({ ...prev, [platform]: e.target.value }))
                        }
                        placeholder={config.placeholder}
                        className="input flex-1"
                        id={`connect-${platform.toLowerCase()}`}
                      />
                      <button
                        onClick={() => handleConnect(platform)}
                        disabled={loading || !usernames[platform]?.trim()}
                        className="btn btn-primary btn-sm px-5"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Connect'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats (if connected & has data) */}
                {isConnected && profile.solvedProblems > 0 && (
                  <div className="border-t border-zinc-800/60 px-5 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="text-center p-2.5 rounded-lg bg-zinc-900/50">
                        <p className="text-lg font-bold text-zinc-100">{profile.solvedProblems}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Total</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-zinc-900/50">
                        <p className="text-lg font-bold text-emerald-400">{profile.easySolved}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Easy</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-zinc-900/50">
                        <p className="text-lg font-bold text-amber-400">{profile.mediumSolved}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Medium</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-zinc-900/50">
                        <p className="text-lg font-bold text-red-400">{profile.hardSolved}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider">Hard</p>
                      </div>
                      <div className="text-center p-2.5 rounded-lg bg-zinc-900/50">
                        <p className="text-lg font-bold text-indigo-400">
                          {(profile.easySolved * 2) + (profile.mediumSolved * 5) + (profile.hardSolved * 10)}
                        </p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider flex items-center justify-center gap-0.5">
                          <Zap className="w-3 h-3" /> Points
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Update username (if connected) */}
                {isConnected && (
                  <div className="border-t border-zinc-800/60 px-5 py-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={usernames[platform]}
                        onChange={(e) =>
                          setUsernames((prev) => ({ ...prev, [platform]: e.target.value }))
                        }
                        placeholder="Update username"
                        className="input flex-1 text-sm"
                      />
                      <button
                        onClick={() => handleConnect(platform)}
                        disabled={loading || !usernames[platform]?.trim()}
                        className="btn btn-ghost btn-sm text-xs"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ─── Section 2: GitHub & Kaggle Projects ───────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Projects
          </h2>
          <button
            onClick={() => setShowProjectModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="w-4 h-4" /> Add Project
          </button>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-10 text-center"
          >
            <FolderKanban className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 mb-1">No projects tracked yet</p>
            <p className="text-xs text-zinc-600">Add your GitHub or Kaggle repos to monitor them</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {projects.map((project, i) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-4 group hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    project.platform === 'GitHub'
                      ? 'bg-zinc-800 text-zinc-300'
                      : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-zinc-100 truncate">{project.name}</h4>
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium border ${categoryColors[project.category] || categoryColors.Other}`}>
                        {project.category}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-zinc-500 truncate mb-2">{project.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      {project.language && (
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-indigo-400" />
                          {project.language}
                        </span>
                      )}
                      {project.stars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" /> {project.stars}
                        </span>
                      )}
                      {project.forks > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" /> {project.forks}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-ghost btn-sm btn-icon p-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => removeProject(project._id)}
                      className="btn btn-ghost btn-sm btn-icon p-1.5 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Add Project Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showProjectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowProjectModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(e) => e.stopPropagation()}
              className="card p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-zinc-100">Add Project</h3>
                <button onClick={() => setShowProjectModal(false)} className="btn btn-ghost btn-sm btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Platform</label>
                  <div className="flex gap-2">
                    {['GitHub', 'Kaggle'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setProjectPlatform(p)}
                        className={`flex-1 p-3 rounded-xl border transition-all text-sm font-medium ${
                          projectPlatform === p
                            ? 'bg-indigo-500/8 border-indigo-500/25 text-indigo-400'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {p === 'GitHub' ? <GitBranch className="w-4 h-4 inline mr-1.5" /> : <Code2 className="w-4 h-4 inline mr-1.5" />}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">
                    {projectPlatform === 'GitHub' ? 'GitHub Repository URL' : 'Kaggle URL'}
                  </label>
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder={
                      projectPlatform === 'GitHub'
                        ? 'https://github.com/user/repo'
                        : 'https://www.kaggle.com/...'
                    }
                    className="input"
                    id="project-url-input"
                  />
                </div>

                <button
                  onClick={handleAddProject}
                  disabled={addingProject || !projectUrl.trim()}
                  className="btn btn-primary w-full"
                  id="add-project-submit"
                >
                  {addingProject ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Add Project</>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
