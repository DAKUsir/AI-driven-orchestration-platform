import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Swords, ExternalLink, Bell, BellOff, Filter, Loader2, Clock, Zap } from 'lucide-react'
import useCompetitionStore from '../store/useCompetitionStore'

const platformColors = {
  codeforces: 'from-blue-500 to-cyan-500',
  leetcode: 'from-amber-500 to-yellow-500',
  codechef: 'from-emerald-500 to-green-500',
  techgig: 'from-violet-500 to-purple-500',
  hackerrank: 'from-green-500 to-emerald-500',
  hackerearth: 'from-indigo-500 to-blue-500',
  other: 'from-zinc-500 to-zinc-600',
}

const platformLogos = {
  codeforces: '🔵', leetcode: '🟡', codechef: '🟢', techgig: '🟣',
  hackerrank: '💚', hackerearth: '🔷', other: '⚪',
}

function getStatusBadge(comp) {
  const now = new Date()
  const start = new Date(comp.startTime)
  const end = comp.endTime ? new Date(comp.endTime) : new Date(start.getTime() + 7200000)

  if (now >= start && now <= end) return { label: 'Live Now', cls: 'badge-danger animate-pulse-soft' }
  const hoursUntil = (start - now) / 3600000
  if (hoursUntil > 0 && hoursUntil <= 24) return { label: 'Starting Soon', cls: 'badge-warning' }
  if (hoursUntil > 0) return { label: 'Upcoming', cls: 'badge-accent' }
  return { label: 'Ended', cls: 'badge-neutral' }
}

export default function CompetitionsPage() {
  const { competitions, loading, fetchCompetitions, setReminder, seedCompetitions } = useCompetitionStore()
  const [platformFilter, setPlatformFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('upcoming')

  useEffect(() => {
    // Seed then fetch
    seedCompetitions().then(() => fetchCompetitions({ status: statusFilter }))
  }, [])

  useEffect(() => {
    const filters = {}
    if (platformFilter) filters.platform = platformFilter
    if (statusFilter) filters.status = statusFilter
    fetchCompetitions(filters)
  }, [platformFilter, statusFilter])

  const platforms = ['codeforces', 'leetcode', 'codechef', 'techgig', 'hackerrank']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <Swords className="w-6 h-6 text-indigo-400" /> Competitions
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Discover and track coding contests across platforms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('upcoming')}
          className={`btn btn-sm ${statusFilter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setStatusFilter('ongoing')}
          className={`btn btn-sm ${statusFilter === 'ongoing' ? 'btn-primary' : 'btn-secondary'}`}
        >
          🔴 Live
        </button>
        <button
          onClick={() => setStatusFilter('')}
          className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`}
        >
          All
        </button>

        <div className="w-px bg-zinc-800 mx-1" />

        <button
          onClick={() => setPlatformFilter('')}
          className={`btn btn-sm ${!platformFilter ? 'btn-primary' : 'btn-ghost'}`}
        >
          All Platforms
        </button>
        {platforms.map((p) => (
          <button
            key={p}
            onClick={() => setPlatformFilter(p === platformFilter ? '' : p)}
            className={`btn btn-sm ${platformFilter === p ? 'btn-primary' : 'btn-ghost'}`}
          >
            {platformLogos[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Competition Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-20">
          <Swords className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No competitions found. Try changing filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((comp, i) => {
            const { label, cls } = getStatusBadge(comp)
            const startDate = new Date(comp.startTime)
            const gradient = platformColors[comp.platform] || platformColors.other

            return (
              <motion.div
                key={comp._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="card p-5 hover:border-zinc-700 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                    {platformLogos[comp.platform] || '⚪'}
                  </div>
                  <span className={`badge text-[10px] ${cls}`}>{label}</span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-100 mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                  {comp.title}
                </h3>

                <p className="text-xs text-zinc-500 capitalize mb-3">{comp.platform}</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {comp.duration && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Duration: {comp.duration}</span>
                    </div>
                  )}
                  {comp.eligibility && comp.eligibility !== 'Open to all' && (
                    <p className="text-[11px] text-zinc-600">{comp.eligibility}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={comp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm flex-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <button
                    onClick={() => setReminder(comp._id)}
                    className="btn btn-secondary btn-sm"
                    title="Set reminder"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
