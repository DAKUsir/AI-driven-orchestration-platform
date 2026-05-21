import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, Calendar, Swords, BookOpen,
  Trophy, Settings, Puzzle, MessageSquare, LogOut, X,
  ChevronLeft, ChevronRight, Target, GraduationCap, Briefcase, Code2,
  PlayCircle, BarChart3,
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/analytics',   icon: BarChart3,        label: 'Analytics' },
      { to: '/planner',     icon: CheckSquare,      label: 'Task Planner' },
      { to: '/calendar',    icon: Calendar,         label: 'Calendar' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/competitions', icon: Swords,    label: 'Competitions' },
      { to: '/dsa-sheets',   icon: BookOpen,  label: 'DSA Sheets' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/youtube',  icon: PlayCircle,    label: 'YouTube Dashboard' },
      { to: '/courses',  icon: GraduationCap, label: 'Course Tracker' },
      { to: '/career',   icon: Briefcase,     label: 'Resume & Career' },
      { to: '/editor',   icon: Code2,         label: 'Code Editor' },
      { to: 'https://mockprepgroq.vercel.app/', icon: Target, label: 'Interview Prep', external: true },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/groups',      icon: MessageSquare, label: 'Groups' },
      { to: '/leaderboard', icon: Trophy,        label: 'Leaderboard' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/integrations', icon: Puzzle,   label: 'Integrations' },
      { to: '/settings',     icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuthStore()

  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[252px]'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          transition-all duration-300 ease-out
          lg:static lg:z-auto theme-transition
          ${sidebarWidth}
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between h-14 px-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2.5 min-w-0 px-1">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
            >
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            {!collapsed && (
              <span
                className="font-semibold text-[14px] truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                FinishIt
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] lg:hidden p-1.5 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex text-[color:var(--text-muted)] hover:text-[color:var(--text-primary)] p-1.5 rounded-md transition-colors"
            style={{ ':hover': { background: 'var(--bg-hover)' } }}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              {!collapsed && (
                <p className="section-label px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label, external }) => {
                  if (external) {
                    return (
                      <a
                        key={to}
                        href={to}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        title={collapsed ? label : undefined}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative group nav-default hover:text-[color:var(--text-primary)] hover:bg-[color:var(--bg-hover)]"
                        style={{ color: 'var(--text-muted)', background: 'transparent' }}
                      >
                        <Icon className="w-[17px] h-[17px] flex-shrink-0" style={{ color: 'inherit' }} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </a>
                    )
                  }
                  return (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={onClose}
                      title={collapsed ? label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 relative group ${
                          isActive ? 'nav-active' : 'nav-default'
                        }`
                      }
                      style={({ isActive }) => ({
                        color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        background: isActive ? 'var(--bg-active)' : 'transparent',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div
                              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                              style={{ background: 'var(--accent)' }}
                            />
                          )}
                          <Icon
                            className="w-[17px] h-[17px] flex-shrink-0"
                            style={{ color: isActive ? 'var(--accent)' : 'inherit' }}
                          />
                          {!collapsed && <span className="truncate">{label}</span>}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div
          className="p-2 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] truncate font-medium" style={{ color: 'var(--text-primary)' }}>
                  {user?.name || 'User'}
                </p>
                <p className="text-[11px] truncate" style={{ color: 'var(--text-faint)' }}>
                  {user?.email || ''}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2 mb-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium w-full transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'var(--text-muted)' }}
            title={collapsed ? 'Logout' : undefined}
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--danger)'
              e.currentTarget.style.background = 'var(--danger-muted)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <LogOut className="w-[17px] h-[17px] flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
