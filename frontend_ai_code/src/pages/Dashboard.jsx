import { motion } from 'framer-motion'
import { CheckCircle, Flame, Trophy, TrendingUp, ArrowRight, Clock, AlertTriangle, Calendar, Plus, Target } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../components/StatCard'
import useAuthStore from '../store/useAuthStore'
import useTaskStore from '../store/useTaskStore'
import useStreakStore from '../store/useStreakStore'
import useLeaderboardStore from '../store/useLeaderboardStore'

const categoryIcons = {
  youtube: '🎬', coursera: '📚', github: '🐙', leetcode: '💻',
  gfg: '📗', kaggle: '📊', 'interview-prep': '🎯', other: '📝',
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { dailyTasks, fetchDailyTasks, updateTask, carryForward } = useTaskStore()
  const { currentStreak, longestStreak, fetchStreak } = useStreakStore()
  const { entries, fetchLeaderboard } = useLeaderboardStore()
  const navigate = useNavigate()

  useEffect(() => {
    fetchDailyTasks()
    fetchStreak()
    fetchLeaderboard()
    carryForward() // Auto carry-forward missed tasks
  }, [])

  const doneTasks = dailyTasks.filter((t) => t.status === 'done').length
  const totalToday = dailyTasks.length
  const pendingTasks = dailyTasks.filter((t) => t.status === 'pending' || t.status === 'in-progress')
  const carriedTasks = dailyTasks.filter((t) => t.isCarryForward)

  const stats = [
    { icon: Flame, label: 'Current Streak', value: `${currentStreak} 🔥`, color: 'amber', delay: 0 },
    { icon: CheckCircle, label: "Today's Progress", value: `${doneTasks}/${totalToday}`, color: 'green', delay: 0.05 },
    { icon: Trophy, label: 'Total Points', value: user?.points || 0, color: 'primary', delay: 0.1 },
    { icon: TrendingUp, label: 'Longest Streak', value: `${longestStreak} days`, color: 'accent', delay: 0.15 },
  ]

  const quickActions = [
    { label: 'Add Task', desc: 'Capture a new learning task', icon: Plus, to: '/planner', color: 'from-indigo-500 to-violet-500' },
    { label: 'View Calendar', desc: 'See your weekly schedule', icon: Calendar, to: '/calendar', color: 'from-cyan-500 to-blue-500' },
    { label: 'Competitions', desc: 'Check upcoming contests', icon: Target, to: '/competitions', color: 'from-amber-500 to-orange-500' },
  ]

  const toggleDone = async (task) => {
    const newStatus = task.status === 'done' ? 'pending' : 'done'
    await updateTask(task._id, { status: newStatus })
    fetchStreak()
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-bold text-zinc-100 tracking-tight">
          Welcome back, {user?.name?.split(' ')[0] || 'User'}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="text-sm text-zinc-500 mt-1">
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

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Today's Checklist */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">Today's Focus</h2>
            <span className="text-xs text-zinc-600">{doneTasks}/{totalToday} done</span>
          </div>

          {/* Carried-forward warning */}
          {carriedTasks.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/15 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs text-amber-300">{carriedTasks.length} task{carriedTasks.length > 1 ? 's' : ''} carried from yesterday</span>
            </div>
          )}

          <div className="space-y-2">
            {pendingTasks.length === 0 && doneTasks === totalToday && totalToday > 0 ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-sm text-zinc-400">All done for today! Great work.</p>
              </div>
            ) : dailyTasks.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                <p className="text-sm text-zinc-500">No tasks for today. Add some!</p>
                <button onClick={() => navigate('/planner')} className="btn btn-primary btn-sm mt-3">
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>
            ) : (
              dailyTasks.slice(0, 8).map((task) => (
                <button
                  key={task._id}
                  onClick={() => toggleDone(task)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800/40 transition-colors text-left group"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    task.status === 'done' ? 'border-emerald-500 bg-emerald-500' : 'border-zinc-700 group-hover:border-zinc-500'
                  }`}>
                    {task.status === 'done' && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm mr-1">{categoryIcons[task.category] || '📝'}</span>
                  <span className={`text-sm flex-1 truncate ${task.status === 'done' ? 'text-zinc-600 line-through' : 'text-zinc-300'}`}>
                    {task.title}
                  </span>
                  {task.isCarryForward && <span className="badge badge-warning text-[10px]">carried</span>}
                  {task.priority === 'urgent' && <span className="badge badge-danger text-[10px]">urgent</span>}
                  {task.priority === 'high' && <span className="badge badge-warning text-[10px]">high</span>}
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Leaderboard Preview */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-100">Leaderboard</h2>
            <button onClick={() => navigate('/leaderboard')} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
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
                }`}>{i + 1}</span>
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
