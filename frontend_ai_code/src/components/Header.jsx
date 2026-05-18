import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, Search, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import useNotificationStore from '../store/useNotificationStore'
import { useNavigate, useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/roadmap': 'Roadmap',
  '/kanban': 'Kanban Board',
  '/mentor': 'AI Mentor',
  '/interview': 'Mock Interview',
  '/editor': 'Code Editor',
  '/analytics': 'Analytics',
  '/leaderboard': 'Leaderboard',
  '/career': 'Career',
  '/integrations': 'Integrations',
  '/settings': 'Settings',
  '/onboarding': 'Getting Started',
}

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markRead } = useNotificationStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (user) fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const pageTitle = pageTitles[location.pathname] || ''

  return (
    <header
      className="h-14 border-b border-zinc-800/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30"
      style={{ background: 'rgba(9, 9, 11, 0.8)', backdropFilter: 'blur(12px)' }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-zinc-500 hover:text-zinc-300 lg:hidden p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
          id="mobile-menu-button"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h1 className="text-[15px] font-semibold text-zinc-100">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Points badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
          <span className="text-xs font-semibold text-amber-400">{user?.points || 0}</span>
          <span className="text-xs text-zinc-500">pts</span>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 text-zinc-500 hover:text-zinc-300 rounded-lg hover:bg-zinc-800/50 transition-colors"
            id="notification-button"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifs && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden shadow-2xl z-50"
                style={{ background: '#1c1c1e', border: '1px solid rgba(63, 63, 70, 0.5)' }}
              >
                <div className="px-4 py-3 border-b border-zinc-800/60">
                  <p className="text-sm font-semibold text-zinc-100">Notifications</p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <button
                        key={n._id}
                        onClick={() => {
                          if (!n.read) markRead(n._id)
                          if (n.link) navigate(n.link)
                          setShowNotifs(false)
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-800/30 hover:bg-zinc-800/40 transition-colors ${
                          !n.read ? 'bg-indigo-500/5' : ''
                        }`}
                      >
                        <p className="text-sm text-zinc-200">{n.message}</p>
                        <p className="text-xs text-zinc-600 mt-1">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User avatar */}
        <button
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          id="user-avatar-button"
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  )
}
