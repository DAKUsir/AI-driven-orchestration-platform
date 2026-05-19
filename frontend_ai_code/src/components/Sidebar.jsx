import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CheckSquare, Calendar, Swords, BookOpen,
  Trophy, Settings, Puzzle, MessageSquare, LogOut, X,
  ChevronLeft, ChevronRight, Target, GraduationCap, Briefcase, Code2,
  PlayCircle,
} from 'lucide-react'
import useAuthStore from '../store/useAuthStore'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/planner', icon: CheckSquare, label: 'Task Planner' },
      { to: '/calendar', icon: Calendar, label: 'Calendar' },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/competitions', icon: Swords, label: 'Competitions' },
      { to: '/dsa-sheets', icon: BookOpen, label: 'DSA Sheets' },
    ],
  },
  {
    label: 'Tools',
    items: [
      { to: '/youtube', icon: PlayCircle, label: 'YouTube Dashboard' },
      { to: '/courses', icon: GraduationCap, label: 'Course Tracker' },
      { to: '/career', icon: Briefcase, label: 'Resume Analyzer' },
      { to: '/editor', icon: Code2, label: 'Code Editor' },
    ],
  },
  {
    label: 'Community',
    items: [
      { to: '/groups', icon: MessageSquare, label: 'Groups' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/integrations', icon: Puzzle, label: 'Integrations' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const { user, logout } = useAuthStore()

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-[260px]'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          border-r border-zinc-800/60
          transition-all duration-300 ease-out
          lg:static lg:z-auto
          ${sidebarWidth}
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ background: '#111113' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-zinc-800/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
              <Target className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-semibold text-zinc-100 text-[15px] truncate">FinishIt</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 lg:hidden p-1"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-800/50 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-4">
              {!collapsed && (
                <p className="text-[11px] font-medium text-zinc-600 uppercase tracking-wider px-3 mb-1.5">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group relative ${
                        isActive
                          ? 'bg-zinc-800/80 text-zinc-100'
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40'
                      }`
                    }
                    title={collapsed ? label : undefined}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-indigo-500 rounded-r-full" />
                        )}
                        <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-indigo-400' : ''}`} />
                        {!collapsed && <span className="truncate">{label}</span>}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-800/60 p-2.5 flex-shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate font-medium">{user?.name || 'User'}</p>
                <p className="text-xs text-zinc-600 truncate">{user?.email || ''}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-zinc-500 hover:text-red-400 hover:bg-red-500/8 w-full transition-all ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
