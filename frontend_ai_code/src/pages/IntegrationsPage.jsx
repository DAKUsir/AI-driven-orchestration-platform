import { motion } from 'framer-motion'
import { Puzzle, GitBranch, Briefcase, Globe, ExternalLink, CheckCircle, Calendar, BookOpen, Code2 } from 'lucide-react'

const integrations = [
  {
    name: 'LeetCode',
    icon: Code2,
    desc: 'Sync your problem-solving progress automatically',
    color: 'from-amber-500 to-orange-500',
    connected: false,
  },
  {
    name: 'GitHub',
    icon: GitBranch,
    desc: 'Link your repositories and track contributions',
    color: 'from-zinc-500 to-zinc-600',
    connected: false,
  },
  {
    name: 'GeeksforGeeks',
    icon: BookOpen,
    desc: 'Import solved problems and practice stats',
    color: 'from-emerald-500 to-green-600',
    connected: false,
  },
  {
    name: 'Kaggle',
    icon: Code2,
    desc: 'Connect your data science competitions and notebooks',
    color: 'from-cyan-500 to-blue-500',
    connected: false,
  },
  {
    name: 'Coursera',
    icon: BookOpen,
    desc: 'Track course completions and certificates',
    color: 'from-blue-500 to-indigo-500',
    connected: false,
  },
  {
    name: 'Google Calendar',
    icon: Calendar,
    desc: 'Sync your study schedule with Google Calendar',
    color: 'from-red-500 to-rose-500',
    connected: false,
  },
]

export default function IntegrationsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Integrations</h1>
        <p className="text-sm text-zinc-500 mt-1">Connect your accounts to sync progress across platforms</p>
      </div>

      <div className="space-y-3">
        {integrations.map(({ name, icon: Icon, desc, color, connected }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card p-5 flex items-center gap-4 hover:border-zinc-700 transition-all"
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-zinc-100">{name}</h3>
                {connected && (
                  <span className="badge badge-success text-[10px]">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500">{desc}</p>
            </div>
            <button
              className={`btn btn-sm flex-shrink-0 ${
                connected ? 'btn-secondary text-emerald-400' : 'btn-secondary'
              }`}
            >
              {connected ? 'Connected' : 'Connect'}
              <ExternalLink className="w-3 h-3" />
            </button>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card p-8 text-center"
      >
        <Puzzle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
        <p className="text-sm text-zinc-500">More integrations coming soon</p>
        <p className="text-xs text-zinc-600 mt-1">CSV upload is available as a manual fallback</p>
      </motion.div>
    </div>
  )
}
