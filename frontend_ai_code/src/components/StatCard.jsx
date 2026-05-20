import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: { bg: 'rgba(99,102,241,0.1)', icon: '#818cf8' },
    accent:  { bg: 'rgba(6,182,212,0.1)',  icon: '#22d3ee' },
    amber:   { bg: 'rgba(245,158,11,0.1)', icon: '#fbbf24' },
    green:   { bg: 'rgba(34,197,94,0.1)',  icon: '#4ade80' },
  }
  const c = colorMap[color] || colorMap.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="card p-5 transition-all duration-200 theme-transition"
      style={{ cursor: 'default' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] mb-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
          <p className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
        </div>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: c.bg }}
        >
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </div>
      </div>
    </motion.div>
  )
}
