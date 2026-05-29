import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Swords, ExternalLink, Bell, BellOff, Loader2, Clock, Zap, Trophy, Code, Terminal, Cpu, Box, Hexagon, Circle, RefreshCw } from 'lucide-react'
import useCompetitionStore from '../store/useCompetitionStore'

const platformColors = {
  codeforces: 'from-blue-500 to-cyan-500', leetcode: 'from-amber-500 to-yellow-500',
  codechef: 'from-emerald-500 to-green-500', techgig: 'from-orange-500 to-orange-500',
  hackerrank: 'from-green-500 to-emerald-500', hackerearth: 'from-orange-500 to-blue-500',
  other: 'from-zinc-500 to-zinc-600',
}

const platformLogos = {
  codeforces: <Terminal className="w-5 h-5 text-white" />, leetcode: <Code className="w-5 h-5 text-white" />,
  codechef: <Box className="w-5 h-5 text-white" />, techgig: <Cpu className="w-5 h-5 text-white" />,
  hackerrank: <Hexagon className="w-5 h-5 text-white" />, hackerearth: <Trophy className="w-5 h-5 text-white" />,
  other: <Circle className="w-5 h-5 text-white" />,
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

function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target - now
      if (diff <= 0) { setTimeLeft('Started!'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`)
      else setTimeLeft(`${h}h ${m}m ${s}s`)
    }
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetDate])
  return <span>{timeLeft}</span>
}

export default function CompetitionsPage() {
  const { competitions, loading, refreshing, fetchCompetitions, setReminder, refreshCompetitions } = useCompetitionStore()
  const [platformFilter, setPlatformFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('upcoming')

  useEffect(() => {
    const filters = {}
    if (platformFilter) filters.platform = platformFilter
    if (statusFilter) filters.status = statusFilter
    fetchCompetitions(filters)
  }, [platformFilter, statusFilter])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const filters = {}
      if (platformFilter) filters.platform = platformFilter
      if (statusFilter) filters.status = statusFilter
      fetchCompetitions(filters)
    }, 300000)
    return () => clearInterval(interval)
  }, [platformFilter, statusFilter])

  const platforms = ['codeforces', 'leetcode', 'codechef', 'techgig', 'hackerrank']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Swords className="w-6 h-6" style={{ color: '#f97316' }} /> Competitions
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Discover and track coding contests across platforms</p>
        </div>
        <button onClick={refreshCompetitions} disabled={refreshing}
          className="btn btn-secondary btn-sm flex items-center gap-2" id="refresh-competitions-btn">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Competitions'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setStatusFilter('upcoming')} className={`btn btn-sm ${statusFilter === 'upcoming' ? 'btn-primary' : 'btn-secondary'}`}>Upcoming</button>
        <button onClick={() => setStatusFilter('ongoing')} className={`btn btn-sm ${statusFilter === 'ongoing' ? 'btn-primary' : 'btn-secondary'}`}>Live</button>
        <button onClick={() => setStatusFilter('')} className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-secondary'}`}>All</button>
        <div className="w-px mx-1" style={{ background: 'var(--border)' }} />
        <button onClick={() => setPlatformFilter('')} className={`btn btn-sm ${!platformFilter ? 'btn-primary' : 'btn-ghost'}`}>All Platforms</button>
        {platforms.map((p) => (
          <button key={p} onClick={() => setPlatformFilter(p === platformFilter ? '' : p)} className={`btn btn-sm ${platformFilter === p ? 'btn-primary' : 'btn-ghost'}`}>
            {platformLogos[p]} {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f97316' }} /></div>
      ) : competitions.length === 0 ? (
        <div className="text-center py-20">
          <Swords className="w-12 h-12 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No competitions found. Try changing filters or refresh.</p>
          <button onClick={refreshCompetitions} className="btn btn-primary btn-sm mt-3"><RefreshCw className="w-4 h-4" /> Refresh</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitions.map((comp, i) => {
            const { label, cls } = getStatusBadge(comp)
            const startDate = new Date(comp.startTime)
            const gradient = platformColors[comp.platform] || platformColors.other
            const isUpcoming = new Date(comp.startTime) > new Date()

            return (
              <motion.div key={comp._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="card p-5 hover:border-zinc-700 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-lg flex-shrink-0`}>
                    {platformLogos[comp.platform] || <Circle className="w-5 h-5 text-white" />}
                  </div>
                  <span className={`badge text-[10px] ${cls}`}>{label}</span>
                </div>

                <h3 className="text-sm font-semibold mb-1 line-clamp-2 group-hover:text-orange-300 transition-colors" style={{ color: 'var(--text-primary)' }}>{comp.title}</h3>
                <p className="text-xs capitalize mb-3" style={{ color: 'var(--text-muted)' }}>{comp.platform}</p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>{startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {isUpcoming && (
                    <div className="flex items-center gap-2 text-xs font-medium" style={{ color: '#f97316' }}>
                      <Zap className="w-3.5 h-3.5" />
                      <Countdown targetDate={comp.startTime} />
                    </div>
                  )}
                  {comp.duration && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Duration: {comp.duration}</span>
                    </div>
                  )}
                  {comp.eligibility && comp.eligibility !== 'Open to all' && (
                    <p className="text-[11px]" style={{ color: 'var(--text-faint)' }}>{comp.eligibility}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <a href={comp.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm flex-1">
                    <ExternalLink className="w-3.5 h-3.5" /> Open
                  </a>
                  <button onClick={() => setReminder(comp._id)} className={`btn btn-sm ${comp.hasReminder ? 'btn-primary' : 'btn-secondary'}`} title={comp.hasReminder ? 'Reminder set' : 'Set reminder'}>
                    {comp.hasReminder ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
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
