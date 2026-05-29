import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Crown, Medal, TrendingUp, Loader2, Users, Globe2, Flame, Code2 } from 'lucide-react'
import useLeaderboardStore from '../store/useLeaderboardStore'
import useAuthStore from '../store/useAuthStore'
import UserProfilePanel from '../components/UserProfilePanel'
import api from '../utils/api'

export default function LeaderboardPage() {
  const {
    entries, groupEntries, myRank, loading, activeTab,
    fetchLeaderboard, fetchMyRank, fetchGroupLeaderboard,
    setActiveTab, setSelectedGroupId, selectedGroupId,
    fetchUserProfile,
  } = useLeaderboardStore()
  const { user } = useAuthStore()

  const [groups, setGroups] = useState([])
  const [groupsLoading, setGroupsLoading] = useState(false)

  useEffect(() => {
    fetchLeaderboard()
    fetchMyRank()
    loadGroups()
  }, [])

  const loadGroups = async () => {
    setGroupsLoading(true)
    try {
      const { data } = await api.get('/groups')
      setGroups(data)
      if (data.length > 0 && !selectedGroupId) {
        setSelectedGroupId(data[0]._id)
      }
    } catch {}
    setGroupsLoading(false)
  }

  useEffect(() => {
    if (activeTab === 'group' && selectedGroupId) {
      fetchGroupLeaderboard(selectedGroupId)
    }
  }, [activeTab, selectedGroupId])

  const displayEntries = activeTab === 'global' ? entries : groupEntries

  const handleUserClick = (userId) => {
    if (userId) fetchUserProfile(userId)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <UserProfilePanel />

      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Leaderboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Compete with others and earn points by completing tasks</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button onClick={() => setActiveTab('global')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeTab === 'global' ? 'border-orange-500/25' : 'border-zinc-800 hover:border-zinc-700'}`}
          style={activeTab === 'global' ? { background: 'rgba(249,115,22,0.1)', color: '#f97316' } : { color: 'var(--text-muted)' }}>
          <Globe2 className="w-4 h-4" /> Global
        </button>
        <button onClick={() => setActiveTab('group')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${activeTab === 'group' ? 'border-orange-500/25' : 'border-zinc-800 hover:border-zinc-700'}`}
          style={activeTab === 'group' ? { background: 'rgba(249,115,22,0.1)', color: '#f97316' } : { color: 'var(--text-muted)' }}>
          <Users className="w-4 h-4" /> My Groups
        </button>
      </div>

      {/* Group Selector */}
      {activeTab === 'group' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {groups.length === 0 && !groupsLoading && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No groups yet.</p>}
          {groups.map((g) => (
            <button key={g._id} onClick={() => { setSelectedGroupId(g._id); fetchGroupLeaderboard(g._id) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${selectedGroupId === g._id ? 'border-orange-500/25' : 'border-zinc-800 hover:border-zinc-700'}`}
              style={selectedGroupId === g._id ? { background: 'rgba(249,115,22,0.12)', color: '#f97316' } : { color: 'var(--text-muted)' }}>
              {g.name}
            </button>
          ))}
        </div>
      )}

      {/* Your rank */}
      {myRank && activeTab === 'global' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center gap-4" style={{ borderColor: 'rgba(249,115,22,0.15)' }}>
          <div className="text-3xl">{myRank.emojiAvatar || '😀'}</div>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
            #{myRank.rank}
          </div>
          <div className="flex-1">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your Rank</p>
            <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{myRank.name}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1" style={{ color: '#f59e0b' }}><Trophy className="w-4 h-4" />{myRank.points}</span>
            <span className="flex items-center gap-1" style={{ color: '#ef4444' }}><Flame className="w-4 h-4" />{myRank.streak}</span>
            <span className="flex items-center gap-1" style={{ color: '#10b981' }}><Code2 className="w-4 h-4" />{myRank.totalSolved}</span>
          </div>
        </motion.div>
      )}

      {/* Podium */}
      {displayEntries.length >= 3 && (
        <div className="grid grid-cols-3 gap-3">
          {[displayEntries[1], displayEntries[0], displayEntries[2]].map((entry, displayIdx) => {
            const actualIdx = displayIdx === 0 ? 1 : displayIdx === 1 ? 0 : 2
            const heights = ['h-24', 'h-32', 'h-20']
            const colors = ['from-zinc-400 to-zinc-500', 'from-amber-400 to-amber-500', 'from-orange-400 to-orange-500']
            return (
              <motion.div key={entry._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: displayIdx * 0.1 }}
                className="card p-4 flex flex-col items-center text-center cursor-pointer hover:border-orange-500/20 transition-colors"
                onClick={() => handleUserClick(entry._id)}>
                <div className="text-3xl mb-1">{entry.emojiAvatar || '😀'}</div>
                <p className="text-sm font-semibold truncate w-full" style={{ color: 'var(--text-primary)' }}>{entry.name}</p>
                {entry.college && <p className="text-[10px] truncate w-full" style={{ color: 'var(--text-faint)' }}>{entry.college}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold" style={{ color: '#f59e0b' }}>{entry.points} pts</span>
                  <span className="text-[10px] flex items-center gap-0.5" style={{ color: '#ef4444' }}><Flame className="w-3 h-3" />{entry.streak}</span>
                </div>
                <div className={`w-full ${heights[displayIdx]} bg-gradient-to-t from-zinc-800/50 to-transparent rounded-lg mt-3 flex items-end justify-center pb-2`}>
                  <span className="text-2xl font-bold" style={{ color: 'var(--text-faint)' }}>#{actualIdx + 1}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {loading && <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#f97316' }} /></div>}

      {/* Remaining entries */}
      {!loading && (
        <div className="space-y-2">
          {displayEntries.slice(3).map((entry, i) => {
            const rank = i + 4
            const isYou = entry._id === user?._id
            return (
              <motion.div key={entry._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                className={`card p-4 flex items-center gap-4 cursor-pointer hover:border-orange-500/20 transition-colors ${isYou ? 'border-orange-500/20' : ''}`}
                onClick={() => handleUserClick(entry._id)}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: rank <= 3 ? 'rgba(249,115,22,0.15)' : 'var(--bg-elevated)', color: rank <= 3 ? '#f97316' : 'var(--text-muted)' }}>
                  {rank}
                </div>
                <div className="text-xl">{entry.emojiAvatar || '😀'}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                    {entry.name}
                    {isYou && <span className="ml-2 badge badge-accent text-[10px]">You</span>}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-faint)' }}>
                    {entry.college || entry.email}
                    {entry.totalSolved > 0 && <span className="ml-2">{entry.totalSolved} solved</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {entry.streak > 0 && <span className="text-xs flex items-center gap-0.5" style={{ color: '#ef4444' }}><Flame className="w-3.5 h-3.5" />{entry.streak}</span>}
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
                    <span className="text-sm font-bold" style={{ color: '#f59e0b' }}>{entry.points}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {displayEntries.length === 0 && !loading && (
            <div className="card p-12 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {activeTab === 'group' ? 'No group members found.' : 'No leaderboard data yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
