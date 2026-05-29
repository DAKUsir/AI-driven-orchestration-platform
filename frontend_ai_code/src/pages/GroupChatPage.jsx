import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Plus, Hash, Users, UserPlus, LogOut, Copy, Check,
  Loader2, X, Sparkles, Crown, Search, Globe
} from 'lucide-react'
import useGroupChatStore from '../store/useGroupChatStore'
import useAuthStore from '../store/useAuthStore'
import VoiceChannel from '../components/VoiceChannel'
import GlobalChat from '../components/GlobalChat'

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts) {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Today'
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function GroupChatPage() {
  const { user } = useAuthStore()
  const {
    groups, activeGroup, messages, typingUsers, loading, messagesLoading,
    fetchGroups, createGroup, joinGroup, leaveGroup, setActiveGroup,
    sendMessage, sendTyping, connectSocket, disconnectSocket, hasMore, loadMoreMessages,
    activeView, setActiveView, globalOnlineCount,
  } = useGroupChatStore()

  const [input, setInput] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupDesc, setGroupDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [showMembers, setShowMembers] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    connectSocket()
    fetchGroups()
    return () => disconnectSocket()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendMessage(input)
    setInput('')
    sendTyping(false)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    sendTyping(true)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => sendTyping(false), 2000)
  }

  const handleCreate = async () => {
    if (!groupName.trim()) return
    setCreating(true)
    setError('')
    try {
      const group = await createGroup(groupName.trim(), groupDesc.trim())
      setActiveGroup(group)
      setShowCreate(false)
      setGroupName('')
      setGroupDesc('')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to create group')
    }
    setCreating(false)
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    setError('')
    try {
      const group = await joinGroup(joinCode.trim())
      setActiveGroup(group)
      setShowJoin(false)
      setJoinCode('')
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to join group')
    }
    setJoining(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(activeGroup?.code || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedMessages = []
  let lastDate = ''
  messages.forEach((msg) => {
    const date = formatDate(msg.timestamp)
    if (date !== lastDate) {
      groupedMessages.push({ type: 'date', date })
      lastDate = date
    }
    groupedMessages.push(msg)
  })

  return (
    <div className="flex gap-4 h-[calc(100vh-100px)]">
      {/* ── Left Sidebar ── */}
      <div className="w-[280px] flex-shrink-0 flex flex-col">
        {/* View Tabs */}
        <div className="flex gap-1 mb-3 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
          <button onClick={() => setActiveView('global')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${activeView === 'global' ? '' : 'opacity-60 hover:opacity-80'}`}
            style={activeView === 'global' ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff' } : { color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5" /> Global
            {globalOnlineCount > 0 && <span className="ml-0.5 text-[10px] opacity-80">{globalOnlineCount}</span>}
          </button>
          <button onClick={() => setActiveView('groups')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${activeView === 'groups' ? '' : 'opacity-60 hover:opacity-80'}`}
            style={activeView === 'groups' ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-secondary)' }}>
            <Users className="w-3.5 h-3.5" /> Groups
          </button>
        </div>

        {activeView === 'groups' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>Groups</h1>
              <div className="flex gap-1">
                <button onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }} className="btn btn-ghost btn-sm btn-icon" title="Join Group">
                  <UserPlus className="w-4 h-4" />
                </button>
                <button onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }} className="btn btn-primary btn-sm btn-icon" title="Create Group">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search groups..." className="input input-with-icon text-sm" id="group-search" />
            </div>

            <AnimatePresence>
              {(showCreate || showJoin) && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="card p-4 mb-3 overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{showCreate ? 'Create Group' : 'Join Group'}</h3>
                    <button onClick={() => { setShowCreate(false); setShowJoin(false); setError('') }} className="btn btn-ghost btn-icon btn-sm"><X className="w-4 h-4" /></button>
                  </div>
                  {showCreate && (
                    <div className="space-y-2">
                      <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name" className="input text-sm" id="create-group-name" />
                      <input type="text" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} placeholder="Description (optional)" className="input text-sm" id="create-group-desc" />
                      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
                      <button onClick={handleCreate} disabled={!groupName.trim() || creating} className="btn btn-primary btn-sm w-full">
                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Create
                      </button>
                    </div>
                  )}
                  {showJoin && (
                    <div className="space-y-2">
                      <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} placeholder="Enter invite code" className="input text-sm font-mono tracking-widest text-center" maxLength={6} id="join-group-code" />
                      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
                      <button onClick={handleJoin} disabled={!joinCode.trim() || joining} className="btn btn-primary btn-sm w-full">
                        {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />} Join
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 overflow-y-auto space-y-0.5">
              {loading && groups.length === 0 && <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} /></div>}
              {!loading && filteredGroups.length === 0 && (
                <div className="card p-8 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No groups yet</p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>Create or join a group to start</p>
                </div>
              )}
              {filteredGroups.map((group) => (
                <button key={group._id} onClick={() => setActiveGroup(group)} className="w-full text-left p-3 rounded-xl transition-all"
                  style={{ background: activeGroup?._id === group._id ? 'var(--accent-muted)' : 'transparent', border: `1px solid ${activeGroup?._id === group._id ? 'var(--accent-border)' : 'transparent'}` }}
                  onMouseEnter={e => { if (activeGroup?._id !== group._id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (activeGroup?._id !== group._id) e.currentTarget.style.background = 'transparent' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                      {group.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{group.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                        {group.memberCount || group.members?.length || 0} members
                        {group.lastMessage?.type === 'text' && ` · ${group.lastMessage.content.slice(0, 28)}`}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {activeView === 'global' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(109,40,217,0.15))' }}>
              <Globe className="w-7 h-7" style={{ color: '#8b5cf6' }} />
            </div>
            <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Global Chat</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)', maxWidth: '220px' }}>
              Chat with everyone on the platform. Only the last 100 messages are kept.
            </p>
            <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {globalOnlineCount} online now
            </div>
          </div>
        )}
      </div>

      {/* ── Center: Chat Area ── */}
      {activeView === 'global' ? (
        <GlobalChat />
      ) : !activeGroup ? (
        <div className="flex-1 flex flex-col card overflow-hidden">
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-muted)' }}>
              <MessageSquare className="w-7 h-7" style={{ color: 'var(--accent)' }} />
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Group Chat</h2>
            <p className="text-sm" style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>Select a group to start chatting, or create a new one.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col card overflow-hidden">
          {/* Group Chat Header */}
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                {activeGroup.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{activeGroup.name}</h3>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  {activeGroup.members?.length || 0} members
                  {typingUsers.length > 0 && <span style={{ color: 'var(--accent)' }} className="ml-1">· {typingUsers.map(u => u.userName).join(', ')} typing...</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={copyCode} className="btn btn-ghost btn-sm text-xs font-mono" title="Copy invite code">
                <Hash className="w-3.5 h-3.5" />{activeGroup.code}
                {copied ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setShowMembers(!showMembers)} className={`btn btn-sm btn-icon ${showMembers ? 'btn-primary' : 'btn-ghost'}`}>
                <Users className="w-4 h-4" />
              </button>
              <button onClick={() => leaveGroup(activeGroup._id)} className="btn btn-ghost btn-sm btn-icon" style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--danger)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Group Messages */}
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {hasMore && <button onClick={loadMoreMessages} className="btn btn-ghost btn-sm w-full text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Load earlier messages</button>}
              {messagesLoading && <div className="flex items-center justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} /></div>}
              {groupedMessages.map((item, idx) => {
                if (item.type === 'date') return <div key={`date-${idx}`} className="flex items-center justify-center py-3"><span className="px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}>{item.date}</span></div>
                if (item.type === 'system') return <div key={item._id} className="flex items-center justify-center py-1"><p className="text-[11px] italic" style={{ color: 'var(--text-faint)' }}>{item.sender?.name || ''} {item.content}</p></div>
                const isMe = item.sender?._id === user?._id
                return (
                  <motion.div key={item._id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${isMe ? 'justify-end' : ''} group`}>
                    {!isMe && <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-1" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>{item.sender?.name?.charAt(0)?.toUpperCase() || 'U'}</div>}
                    <div className="max-w-[75%]">
                      {!isMe && <p className="text-[11px] mb-0.5 ml-1" style={{ color: 'var(--text-muted)' }}>{item.sender?.name}</p>}
                      <div className="rounded-2xl px-3.5 py-2" style={isMe ? { background: 'var(--accent)', color: '#ffffff', borderBottomRightRadius: '4px' } : { background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderBottomLeftRadius: '4px' }}>
                        <p className="text-sm leading-relaxed">{item.content}</p>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`} style={{ color: 'var(--text-faint)' }}>{formatTime(item.timestamp)}</p>
                    </div>
                  </motion.div>
                )
              })}
              {typingUsers.length > 0 && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-elevated)' }}><Sparkles className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /></div>
                  <div className="rounded-2xl rounded-bl-sm px-3.5 py-2" style={{ background: 'var(--bg-elevated)' }}>
                    <div className="flex gap-1">{[0,1,2].map(i => <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i*0.2 }} />)}</div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <AnimatePresence>
              {showMembers && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="overflow-hidden flex-shrink-0" style={{ borderLeft: '1px solid var(--border)' }}>
                  <div className="p-3">
                    <h4 className="section-label mb-3">Members ({activeGroup.members?.length || 0})</h4>
                    <div className="space-y-2">
                      {activeGroup.members?.map((member) => (
                        <div key={member._id || member} className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>{member.name?.charAt(0)?.toUpperCase() || 'U'}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                              {member.name || 'User'}
                              {member._id === activeGroup.createdBy?._id && <Crown className="w-3 h-3 inline ml-1" style={{ color: '#f59e0b' }} />}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--text-faint)' }}>{member.points || 0} pts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <VoiceChannel groupId={activeGroup._id} />

          <form onSubmit={handleSend} className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-2">
              <input type="text" value={input} onChange={handleInputChange} placeholder="Type a message..." className="input flex-1 text-sm" id="group-chat-input" />
              <button type="submit" disabled={!input.trim()} className="btn btn-primary btn-icon px-3" id="group-chat-send"><Send className="w-4 h-4" /></button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
