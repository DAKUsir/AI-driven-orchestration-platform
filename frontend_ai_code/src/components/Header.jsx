import { useState, useEffect, useRef } from 'react'
import { Menu, Bell, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/useAuthStore'
import useNotificationStore from '../store/useNotificationStore'
import { useNavigate, useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard':    'Dashboard',
  '/analytics':    'Analytics',
  '/planner':      'Task Planner',
  '/calendar':     'Calendar',
  '/competitions': 'Competitions',
  '/dsa-sheets':   'DSA Sheets',
  '/groups':       'Group Chat',
  '/leaderboard':  'Leaderboard',
  '/integrations': 'Integrations',
  '/settings':     'Settings',
  '/courses':      'Course Tracker',
  '/career':       'Career & Resume',
  '/editor':       'Code Editor',
  '/youtube':      'YouTube Dashboard',
  '/onboarding':   'Getting Started',
}

function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark')
  return { theme, toggle }
}

export default function Header({ onMenuClick }) {
  const { user } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markRead } = useNotificationStore()
  const [showNotifs, setShowNotifs] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggle } = useTheme()

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
      className="h-14 border-b flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 theme-transition"
      style={{
        background: 'color-mix(in srgb, var(--bg-primary) 85%, transparent)',
        borderColor: 'var(--border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] lg:hidden p-1.5 rounded-lg transition-colors"
          style={{ background: 'transparent' }}
          id="mobile-menu-button"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Points badge */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>
            {user?.points || 0}
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>pts</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="p-2 rounded-lg transition-all"
          style={{ color: 'var(--text-muted)' }}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          id="theme-toggle"
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = 'var(--text-muted)'
          }}
        >
          {theme === 'dark'
            ? <Sun className="w-[18px] h-[18px]" />
            : <Moon className="w-[18px] h-[18px]" />
          }
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-lg transition-all"
            style={{ color: 'var(--text-muted)' }}
            id="notification-button"
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--bg-hover)'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
            }}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-4 h-4 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                style={{ background: 'var(--accent)' }}
              >
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
                className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden z-50"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Notifications
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center">
                      <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No notifications yet</p>
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
                        className="w-full text-left px-4 py-3 transition-colors"
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          background: !n.read ? 'var(--accent-muted)' : 'transparent',
                          color: 'var(--text-primary)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                        onMouseLeave={e => e.currentTarget.style.background = !n.read ? 'var(--accent-muted)' : 'transparent'}
                      >
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
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
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white hover:opacity-90 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
          id="user-avatar-button"
          title={user?.name || 'Settings'}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </button>
      </div>
    </header>
  )
}
