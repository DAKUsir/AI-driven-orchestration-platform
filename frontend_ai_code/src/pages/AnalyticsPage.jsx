import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Target, Code2, TrendingUp, BookOpen, Trophy, Flame, Clock, Zap } from 'lucide-react'
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import useAnalyticsStore from '../store/useAnalyticsStore'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg px-3 py-2 text-sm shadow-xl" style={{ background: '#1c1c1e', border: '1px solid #27272a' }}>
        <p className="text-zinc-200 font-medium">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs" style={{ color: p.color || p.fill }}>{p.name}: {p.value}</p>
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

  const stats = analytics || {}
  const skills = stats.skills || []
  const diffDist = stats.difficultyDistribution || []
  const platformComp = stats.platformComparison || []
  const platformStats = stats.platformStats || {}
  const interviewStats = stats.interviewStats || { total: 0, avgScore: 0 }

  const radarData = skills.map((s) => ({
    skill: s.name,
    value: s.score,
  }))

  const hasData = stats.totalSolved > 0 || skills.length > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">
          {hasData
            ? 'Your real performance data from connected platforms'
            : 'Connect your coding platforms to see real analytics'}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: Code2, label: 'Total Solved', value: stats.totalSolved || 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
          { icon: Trophy, label: 'Points', value: stats.points || 0, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: Flame, label: 'Streak', value: `${stats.streak || 0}d`, color: 'text-orange-400', bg: 'bg-orange-500/10' },
          { icon: Target, label: 'Tasks Done', value: `${stats.completedTasks || 0}/${stats.totalTasks || 0}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: BarChart3, label: 'Interviews', value: interviewStats.total, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card p-4"
          >
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-2`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-xl font-bold text-zinc-100">{value}</p>
            <p className="text-[11px] text-zinc-500 uppercase tracking-wider">{label}</p>
          </motion.div>
        ))}
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
          {radarData.length > 0 ? (
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
          ) : (
            <div className="h-72 flex items-center justify-center">
              <p className="text-sm text-zinc-600">Sync platforms to see your skills</p>
            </div>
          )}
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Difficulty Breakdown</h2>
          </div>
          {diffDist.some((d) => d.value > 0) ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={diffDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {diffDist.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => <span className="text-xs text-zinc-400">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <p className="text-sm text-zinc-600">No problem solving data yet</p>
            </div>
          )}
        </motion.div>

        {/* Platform Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Platform Comparison</h2>
          </div>
          {platformComp.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformComp}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis dataKey="platform" tick={{ fill: '#a1a1aa', fontSize: 11 }} axisLine={{ stroke: '#27272a' }} />
                  <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={{ stroke: '#27272a' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="easy" name="Easy" fill="#10b981" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="medium" name="Medium" fill="#f59e0b" radius={[2, 2, 0, 0]} stackId="a" />
                  <Bar dataKey="hard" name="Hard" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center">
              <p className="text-sm text-zinc-600">Connect platforms to compare</p>
            </div>
          )}
        </motion.div>

        {/* Platform Details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold text-zinc-100">Platform Details</h2>
          </div>
          {Object.keys(platformStats).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(platformStats).map(([platform, data]) => (
                <div key={platform} className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        platform === 'LeetCode' ? 'bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className="text-sm font-medium text-zinc-200">{platform}</span>
                      <span className="text-xs text-zinc-600">@{data.username}</span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      Rank: {data.ranking}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center">
                      <p className="text-base font-bold text-zinc-100">{data.totalSolved}</p>
                      <p className="text-[10px] text-zinc-600">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-emerald-400">{data.easySolved}</p>
                      <p className="text-[10px] text-zinc-600">Easy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-amber-400">{data.mediumSolved}</p>
                      <p className="text-[10px] text-zinc-600">Medium</p>
                    </div>
                    <div className="text-center">
                      <p className="text-base font-bold text-red-400">{data.hardSolved}</p>
                      <p className="text-[10px] text-zinc-600">Hard</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <Zap className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No platforms connected</p>
              <p className="text-xs text-zinc-600 mt-1">Go to Integrations to connect LeetCode or GFG</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
