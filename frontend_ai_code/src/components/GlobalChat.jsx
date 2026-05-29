import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Globe, Users, Sparkles, Loader2 } from 'lucide-react'
import useGroupChatStore from '../store/useGroupChatStore'
import useAuthStore from '../store/useAuthStore'

function formatTime(ts) {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export default function GlobalChat() {
  const { user } = useAuthStore()
  const {
    globalMessages, globalTypingUsers, globalOnlineCount, globalLoading,
    fetchGlobalMessages, sendGlobalMessage, sendGlobalTyping,
  } = useGroupChatStore()

  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => { fetchGlobalMessages() }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [globalMessages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    sendGlobalMessage(input)
    setInput('')
    sendGlobalTyping(false)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
    sendGlobalTyping(true)
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => sendGlobalTyping(false), 2000)
  }

  return (
    <div className="flex-1 flex flex-col card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Global Chat</h3>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {globalOnlineCount} online
              </span>
              <span className="mx-1.5 opacity-40">·</span>
              Last 100 messages
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {globalLoading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        )}

        {!globalLoading && globalMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Globe className="w-10 h-10 mb-3" style={{ color: 'var(--text-faint)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No messages yet. Be the first!</p>
          </div>
        )}

        {globalMessages.map((msg) => {
          const isMe = msg.sender?._id === user?._id
          return (
            <motion.div
              key={msg._id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2.5 ${isMe ? 'justify-end' : ''} group`}
            >
              {!isMe && (
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0 mt-1" style={{ background: 'var(--bg-elevated)' }}>
                  {msg.sender?.emojiAvatar || '😀'}
                </div>
              )}
              <div className="max-w-[75%]">
                {!isMe && (
                  <p className="text-[11px] mb-0.5 ml-1" style={{ color: 'var(--text-muted)' }}>
                    {msg.sender?.name}
                  </p>
                )}
                <div
                  className="rounded-2xl px-3.5 py-2"
                  style={isMe
                    ? { background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', borderBottomRightRadius: '4px' }
                    : { background: 'var(--bg-elevated)', color: 'var(--text-primary)', borderBottomLeftRadius: '4px' }
                  }
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
                <p className={`text-[10px] mt-0.5 ${isMe ? 'text-right mr-1' : 'ml-1'} opacity-0 group-hover:opacity-100 transition-opacity`} style={{ color: 'var(--text-faint)' }}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          )
        })}

        {globalTypingUsers.length > 0 && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-elevated)' }}>
              <Sparkles className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
            </div>
            <div className="rounded-2xl rounded-bl-sm px-3.5 py-2" style={{ background: 'var(--bg-elevated)' }}>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }}
                    animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <input type="text" value={input} onChange={handleInputChange}
            placeholder="Say something to everyone..." className="input flex-1 text-sm" id="global-chat-input" />
          <button type="submit" disabled={!input.trim()} className="btn btn-primary btn-icon px-3" id="global-chat-send"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : undefined }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
