import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, TrendingUp, Loader2 } from 'lucide-react'
import useLeaderboardStore from '../store/useLeaderboardStore'
import useAuthStore from '../store/useAuthStore'

export default function LeaderboardPage() {
  const { entries, myRank, loading, fetchLeaderboard, fetchMyRank } = useLeaderboardStore()
  const { user } = useAuthStore()

  useEffect(() => {
    fetchLeaderboard()
    fetchMyRank()
  }, [])

  const getRankBadge = (i) => {
    if (i === 0) return { icon: <Crown className="w-4 h-4" />, bg: 'bg-amber-500/15 text-amber-400' }
    if (i === 1) return { icon: <Medal className="w-4 h-4" />, bg: 'bg-zinc-400/15 text-zinc-300' }
    if (i === 2) return { icon: <Medal className="w-4 h-4" />, bg: 'bg-orange-500/15 text-orange-400' }
    return { icon: <span className="text-xs font-bold">{i + 1}</span>, bg: 'bg-zinc-800 text-zinc-500' }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Leaderboard</h1>
        <p className="text-sm text-zinc-500 mt-1">Compete with others and earn points by completing tasks</p>
      </div>

      {/* Your rank */}
      {myRank && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5 flex items-center gap-4 border-indigo-500/15"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-lg font-bold text-white">
            #{myRank.rank}
          </div>
          <div>
            <p className="text-xs text-zinc-500">Your Rank</p>
            <p className="text-lg font-bold text-zinc-100">{myRank.name} — <span className="text-amber-400">{myRank.points} pts</span></p>
          </div>
        </motion.div>
      )}

      {/* Podium — Top 3 */}
      {entries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[entries[1], entries[0], entries[2]].map((entry, displayIdx) => {
            const actualIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2
            const heights = ['h-24', 'h-32', 'h-20']
            const colors = ['from-zinc-400 to-zinc-500', 'from-amber-400 to-amber-500', 'from-orange-400 to-orange-500']
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: displayIdx * 0.1 }}
                className="card p-4 flex flex-col items-center text-center"
              >
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[displayIdx]} flex items-center justify-center text-sm font-bold text-white mb-2`}>
                  {entry.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <p className="text-sm font-semibold text-zinc-200 truncate w-full">{entry.name}</p>
                <p className="text-xs font-bold text-amber-400 mt-0.5">{entry.points} pts</p>
                <div className={`w-full ${heights[displayIdx]} bg-gradient-to-t from-zinc-800/50 to-transparent rounded-lg mt-3 flex items-end justify-center pb-2`}>
                  <span className="text-2xl font-bold text-zinc-600">#{actualIdx + 1}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        </div>
      )}

      {/* Remaining entries */}
      {!loading && (
        <div className="space-y-2">
          {entries.slice(3).map((entry, i) => {
            const rank = i + 4
            const isYou = entry._id === user?._id
            return (
              <motion.div
                key={entry._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className={`card p-4 flex items-center gap-4 ${isYou ? 'border-indigo-500/20' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getRankBadge(rank - 1).bg}`}>
                  {rank}
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                  {entry.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">
                    {entry.name}
                    {isYou && <span className="ml-2 badge badge-accent text-[10px]">You</span>}
                  </p>
                  <p className="text-xs text-zinc-600 truncate">{entry.email}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">{entry.points}</span>
                </div>
              </motion.div>
            )
          })}

          {entries.length === 0 && !loading && (
            <div className="card p-12 text-center">
              <Trophy className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500">No leaderboard data yet. Complete tasks to earn points!</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
