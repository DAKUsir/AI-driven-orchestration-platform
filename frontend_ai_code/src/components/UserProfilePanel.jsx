import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Trophy, Flame, Code2, GraduationCap, ExternalLink } from 'lucide-react'
import useLeaderboardStore from '../store/useLeaderboardStore'

export default function UserProfilePanel() {
  const { selectedUser: user, selectedUserLoading: loading, showProfilePanel, closeProfilePanel } = useLeaderboardStore()

  if (!showProfilePanel) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex justify-end"
        onClick={closeProfilePanel}
      >
        <motion.div
          initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-sm h-full overflow-y-auto"
          style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
          ) : user ? (
            <div className="p-6 space-y-6">
              {/* Close */}
              <button onClick={closeProfilePanel} className="btn btn-ghost btn-icon btn-sm float-right">
                <X className="w-5 h-5" />
              </button>

              {/* Avatar & Name */}
              <div className="text-center pt-4">
                <div className="text-5xl mb-3">{user.emojiAvatar || '😀'}</div>
                <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</h2>
                {user.college && <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{user.college}</p>}
                {user.bio && <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>{user.bio}</p>}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Points', value: user.points || 0, icon: <Trophy className="w-4 h-4" />, color: '#f59e0b' },
                  { label: 'Streak', value: `${user.streak || 0}🔥`, icon: <Flame className="w-4 h-4" />, color: '#ef4444' },
                  { label: 'Solved', value: user.totalSolved || 0, icon: <Code2 className="w-4 h-4" />, color: '#10b981' },
                  { label: 'Best Streak', value: user.longestStreak || 0, icon: <Flame className="w-4 h-4" />, color: '#8b5cf6' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className="card p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color }}>
                      {icon}
                      <span className="text-lg font-bold">{value}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-faint)' }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Platform Links */}
              {(user.leetcodeUsername || user.gfgUsername || user.githubUsername) && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Profiles</h4>
                  <div className="space-y-2">
                    {user.leetcodeUsername && (
                      <a href={`https://leetcode.com/u/${user.leetcodeUsername}`} target="_blank" rel="noopener noreferrer"
                        className="card p-3 flex items-center gap-3 hover:border-amber-500/30 transition-colors">
                        <Code2 className="w-4 h-4" style={{ color: '#f59e0b' }} />
                        <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>LeetCode</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.leetcodeUsername}</span>
                        <ExternalLink className="w-3 h-3" style={{ color: 'var(--text-faint)' }} />
                      </a>
                    )}
                    {user.gfgUsername && (
                      <a href={`https://www.geeksforgeeks.org/user/${user.gfgUsername}`} target="_blank" rel="noopener noreferrer"
                        className="card p-3 flex items-center gap-3 hover:border-emerald-500/30 transition-colors">
                        <GraduationCap className="w-4 h-4" style={{ color: '#10b981' }} />
                        <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>GeeksForGeeks</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.gfgUsername}</span>
                        <ExternalLink className="w-3 h-3" style={{ color: 'var(--text-faint)' }} />
                      </a>
                    )}
                    {user.githubUsername && (
                      <a href={`https://github.com/${user.githubUsername}`} target="_blank" rel="noopener noreferrer"
                        className="card p-3 flex items-center gap-3 hover:border-zinc-500/30 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-primary)' }}><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                        <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>GitHub</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.githubUsername}</span>
                        <ExternalLink className="w-3 h-3" style={{ color: 'var(--text-faint)' }} />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Skills & Topics */}
              {(user.skills?.length > 0 || user.strongTopics?.length > 0) && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Skills & Strengths</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(user.skills || []).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}>{s}</span>
                    ))}
                    {(user.strongTopics || []).map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md text-[11px] font-medium" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Member Since */}
              <p className="text-[11px] text-center" style={{ color: 'var(--text-faint)' }}>
                Member since {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
