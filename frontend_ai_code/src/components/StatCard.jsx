import { motion } from 'framer-motion'

export default function StatCard({ icon: Icon, label, value, color = 'primary', delay = 0 }) {
  const colorMap = {
    primary: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/10' },
    accent: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/10' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/10' },
    green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/10' },
  }

  const c = colorMap[color] || colorMap.primary

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={`card p-5 hover:border-zinc-700 transition-all duration-200`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-zinc-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </motion.div>
  )
}
