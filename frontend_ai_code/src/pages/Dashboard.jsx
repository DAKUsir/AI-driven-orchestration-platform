import { motion } from 'framer-motion'
import { BookOpen, Code2, Trophy, TrendingUp, ArrowRight, Clock, CheckCircle, Target, Zap } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import useAuthStore from '../store/useAuthStore'
import useRoadmapStore from '../store/useRoadmapStore'
import useLeaderboardStore from '../store/useLeaderboardStore'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { tasks, fetchTasks } = useRoadmapStore()
  const { entries, fetchLeaderboard } = useLeaderboardStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
    fetchLeaderboard()
  }, [])

  const completedTasks = tasks.filter((t) => t.completed).length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    { icon: Trophy, label: 'Total Points', value: user?.points || 0, color: 'amber', delay: 0 },
    { icon: CheckCircle, label: 'Tasks Done', value: `${completedTasks}/${totalTasks}`, color: 'green', delay: 0.05 },
    { icon: Code2, label: 'Progress', value: `${progress}%`, color: 'primary', delay: 0.1 },
    { icon: TrendingUp, label: 'Streak', value: `${user?.streak || 0} days`, color: 'accent', delay: 0.15 },
  ]

  const quickActions = [
    { label: 'Continue Roadmap', desc: `${totalTasks - completedTasks} tasks remaining`, icon: BookOpen, to: '/roadmap', color: 'from-indigo-500 to-violet-500' },
    { label: 'AI Mentor', desc: 'Ask anything', icon: Zap, to: '/mentor', color: 'from-cyan-500 to-blue-500' },
    { label: 'Mock Interview', desc: 'Practice now', icon: Target, to: '/interview', color: 'from-amber-500 to-orange-500' },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-bold text-zinc-100 tracking-tight"
        >
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="text-sm text-zinc-500 mt-1"
        >
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </motion.p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-3">
        {quickActions.map(({ label, desc, icon: Icon, to, color }, i) => (
          <motion.button
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            onClick={() => navigate(to)}
            className="card p-5 text-left group hover:border-zinc-700 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100 mb-0.5">{label}</h3>
            <p className="text-xs text-zinc-500">{desc}</p>
          </motion.button>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">Recent Activity</h2>
            <Clock className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="space-y-3">
            {tasks.slice(0, 5).length === 0 ? (
              <div className="py-10 text-center">
                <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No activity yet. Start your roadmap!</p>
              </div>
            ) : (
              tasks.slice(0, 5).map((task) => (
                <div key={task._id} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.completed ? 'bg-emerald-500' : 'bg-zinc-700'}`} />
                  <span className={`text-sm flex-1 truncate ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                    {task.title}
                  </span>
                  <span className="badge badge-neutral text-[11px]">{task.type || task.taskType}</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">Leaderboard</h2>
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              View All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {entries.slice(0, 5).map((entry, i) => (
              <div key={entry._id} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? 'bg-amber-500/15 text-amber-400' :
                  i === 1 ? 'bg-zinc-600/20 text-zinc-400' :
                  i === 2 ? 'bg-orange-500/15 text-orange-400' :
                  'bg-zinc-800 text-zinc-600'
                }`}>
                  {i + 1}
                </span>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">
                  {entry.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-zinc-300 flex-1 truncate">{entry.name}</span>
                <span className="text-xs font-semibold text-amber-400">{entry.points} pts</span>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="py-10 text-center">
                <Trophy className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No leaderboard data yet</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
