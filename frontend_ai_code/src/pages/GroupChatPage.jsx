import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare, Send, Plus, Hash, Users, UserPlus, LogOut, Copy, Check,
  Loader2, ChevronRight, X, Sparkles, Crown, Search
} from 'lucide-react'
import useGroupChatStore from '../store/useGroupChatStore'
import useAuthStore from '../store/useAuthStore'
import VoiceChannel from '../components/VoiceChannel'

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

  // Group messages by date
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
      {/* ── Left: Group List ─────────────────── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-zinc-100">Groups</h1>
          <div className="flex gap-1.5">
            <button onClick={() => { setShowJoin(true); setShowCreate(false); setError('') }}
              className="btn btn-ghost btn-sm btn-icon" title="Join Group">
              <UserPlus className="w-4 h-4" />
            </button>
            <button onClick={() => { setShowCreate(true); setShowJoin(false); setError('') }}
              className="btn btn-primary btn-sm btn-icon" title="Create Group">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="input input-with-icon text-sm py-2"
            id="group-search"
          />
        </div>

        {/* Create / Join Modal */}
        <AnimatePresence>
          {(showCreate || showJoin) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card p-4 mb-3 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-200">
                  {showCreate ? 'Create Group' : 'Join Group'}
                </h3>
                <button onClick={() => { setShowCreate(false); setShowJoin(false); setError('') }}
                  className="text-zinc-500 hover:text-zinc-300">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {showCreate && (
                <div className="space-y-2">
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name" className="input text-sm" id="create-group-name" />
                  <input type="text" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)}
                    placeholder="Description (optional)" className="input text-sm" id="create-group-desc" />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button onClick={handleCreate} disabled={!groupName.trim() || creating}
                    className="btn btn-primary btn-sm w-full">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Create
                  </button>
                </div>
              )}

              {showJoin && (
                <div className="space-y-2">
                  <input type="text" value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Enter invite code" className="input text-sm font-mono tracking-widest text-center"
                    maxLength={6} id="join-group-code" />
                  {error && <p className="text-xs text-red-400">{error}</p>}
                  <button onClick={handleJoin} disabled={!joinCode.trim() || joining}
                    className="btn btn-primary btn-sm w-full">
                    {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Join
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Group List */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {loading && groups.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          )}

          {!loading && filteredGroups.length === 0 && (
            <div className="card p-8 text-center">
              <MessageSquare className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No groups yet</p>
              <p className="text-xs text-zinc-600 mt-1">Create or join a group to start competing</p>
            </div>
          )}

          {filteredGroups.map((group) => (
            <button
              key={group._id}
              onClick={() => setActiveGroup(group)}
              className={`w-full text-left p-3 rounded-xl transition-all ${activeGroup?._id === group._id
                ? 'bg-indigo-500/10 border border-indigo-500/20'
                : 'hover:bg-zinc-800/60 border border-transparent'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{group.name}</p>
                  <p className="text-xs text-zinc-600 truncate">
                    {group.memberCount || group.members?.length || 0} members
                    {group.lastMessage?.type === 'text' && ` · ${group.lastMessage.content.slice(0, 30)}`}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Center: Chat Area ────────────────── */}
      <div className="flex-1 flex flex-col card overflow-hidden">
        {!activeGroup ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold text-zinc-100 mb-2">Group Chat</h2>
            <p className="text-sm text-zinc-500 max-w-sm">
              Select a group to start chatting, or create a new one to compete with friends.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold">
                  {activeGroup.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100">{activeGroup.name}</h3>
                  <p className="text-[11px] text-zinc-500">
                    {activeGroup.members?.length || 0} members
                    {typingUsers.length > 0 && (
                      <span className="text-indigo-400 ml-1">
                        · {typingUsers.map(u => u.userName).join(', ')} typing...
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={copyCode}
                  className="btn btn-ghost btn-sm text-xs font-mono" title="Copy invite code">
                  <Hash className="w-3.5 h-3.5" />
                  {activeGroup.code}
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => setShowMembers(!showMembers)}
                  className={`btn btn-sm btn-icon ${showMembers ? 'btn-primary' : 'btn-ghost'}`}>
                  <Users className="w-4 h-4" />
                </button>
                <button onClick={() => leaveGroup(activeGroup._id)}
                  className="btn btn-ghost btn-sm btn-icon text-zinc-500 hover:text-red-400">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 flex">
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                {hasMore && (
                  <button onClick={loadMoreMessages}
                    className="btn btn-ghost btn-sm w-full text-xs text-zinc-500 mb-2">
                    Load earlier messages
                  </button>
                )}

                {messagesLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                  </div>
                )}

                {groupedMessages.map((item, idx) => {
                  if (item.type === 'date') {
                    return (
                      <div key={`date-${idx}`} className="flex items-center justify-center py-3">
                        <span className="px-3 py-1 rounded-full bg-zinc-800/60 text-[11px] text-zinc-500 font-medium">
                          {item.date}
                        </span>
                      </div>
                    )
                  }

                  if (item.type === 'system') {
                    return (
                      <div key={item._id} className="flex items-center justify-center py-1">
                        <p className="text-[11px] text-zinc-600 italic">
                          {item.sender?.name || ''} {item.content}
                        </p>
                      </div>
                    )
                  }

                  const isMe = item.sender?._id === user?._id
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isMe ? 'justify-end' : ''} group`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-1">
                          {item.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className={`max-w-[75%]`}>
                        {!isMe && (
                          <p className="text-[11px] text-zinc-500 mb-0.5 ml-1">{item.sender?.name}</p>
                        )}
                        <div className={`rounded-2xl px-3.5 py-2 ${isMe
                          ? 'bg-indigo-500 text-white rounded-br-md'
                          : 'bg-zinc-800/80 text-zinc-200 rounded-bl-md'
                          }`}>
                          <p className="text-sm leading-relaxed">{item.content}</p>
                        </div>
                        <p className={`text-[10px] text-zinc-700 mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                          {formatTime(item.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}

                {typingUsers.length > 0 && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3 h-3 text-zinc-500" />
                    </div>
                    <div className="bg-zinc-800/60 rounded-2xl rounded-bl-md px-3.5 py-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Members Sidebar */}
              <AnimatePresence>
                {showMembers && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-zinc-800/60 overflow-hidden flex-shrink-0"
                  >
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                        Members ({activeGroup.members?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {activeGroup.members?.map((member) => (
                          <div key={member._id || member} className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                              {member.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-zinc-300 truncate">
                                {member.name || 'User'}
                                {member._id === activeGroup.createdBy?._id && (
                                  <Crown className="w-3 h-3 text-amber-400 inline ml-1" />
                                )}
                              </p>
                              <p className="text-[10px] text-zinc-600 truncate">
                                {member.points || 0} pts
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Voice Channel */}
            <VoiceChannel groupId={activeGroup._id} />

            {/* Input */}
            <form onSubmit={handleSend} className="border-t border-zinc-800/60 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="input flex-1 text-sm"
                  id="group-chat-input"
                />
                <button type="submit" disabled={!input.trim()}
                  className="btn btn-primary btn-icon px-3" id="group-chat-send">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
