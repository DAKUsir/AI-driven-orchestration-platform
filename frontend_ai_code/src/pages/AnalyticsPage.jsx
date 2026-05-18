import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Target, Code2, TrendingUp, BookOpen } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts'
import useAnalyticsStore from '../store/useAnalyticsStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-sm shadow-xl" style={{ background: '#1c1c1e', border: '1px solid #27272a' }}>
        <p className="text-zinc-200 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color }}>{p.name}: {p.value}</p>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { analytics, loading, fetchAnalytics } = useAnalyticsStore()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const radarData = analytics?.skills?.map((s) => ({
    skill: s.name,
    value: s.score,
  })) || [
    { skill: 'Algorithms', value: 75 },
    { skill: 'Data Structures', value: 80 },
    { skill: 'System Design', value: 55 },
    { skill: 'Frontend', value: 70 },
    { skill: 'Backend', value: 60 },
    { skill: 'Databases', value: 65 },
  ]

  const weeklyData = analytics?.weeklyActivity || [
    { day: 'Mon', tasks: 3 },
    { day: 'Tue', tasks: 5 },
    { day: 'Wed', tasks: 2 },
    { day: 'Thu', tasks: 7 },
    { day: 'Fri', tasks: 4 },
    { day: 'Sat', tasks: 6 },
    { day: 'Sun', tasks: 1 },
  ]

  const progressData = analytics?.progress || [
    { month: 'Jan', score: 60 },
    { month: 'Feb', score: 65 },
    { month: 'Mar', score: 72 },
    { month: 'Apr', score: 78 },
    { month: 'May', score: 82 },
    { month: 'Jun', score: 88 },
  ]

  const topicBreakdown = analytics?.topics || [
    { topic: 'Arrays & Hashing', pct: 85 },
    { topic: 'Two Pointers', pct: 70 },
    { topic: 'Dynamic Programming', pct: 45 },
    { topic: 'Graphs', pct: 60 },
    { topic: 'Trees', pct: 75 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Track your performance and progress over time</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Skills Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Skills Radar</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#27272a" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} />
                <Radar name="Skills" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Weekly Activity</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="day" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="tasks" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Progress Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Progress Over Time</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="month" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={2} dot={{ fill: '#06b6d4', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Topic Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Topic Breakdown</h2>
          </div>
          <div className="space-y-4">
            {topicBreakdown.map(({ topic, pct }) => (
              <div key={topic}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-zinc-400">{topic}</span>
                  <span className="text-xs font-medium text-zinc-500">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${pct}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
