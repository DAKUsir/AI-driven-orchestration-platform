import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Trash2, Loader2, User, Sparkles, BookOpen, Code2, Briefcase, MessageCircle } from 'lucide-react'
import useMentorStore from '../store/useMentorStore'

function formatMessage(content) {
  const parts = content.split(/(```[\s\S]*?```)/g)
  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const lines = part.slice(3, -3)
      const firstNewline = lines.indexOf('\n')
      const code = firstNewline > -1 ? lines.slice(firstNewline + 1) : lines
      return (
        <pre key={i} className="chat-code my-2 text-[13px]">
          <code>{code}</code>
        </pre>
      )
    }
    const formatted = part.split(/(\*\*.*?\*\*)/g).map((segment, j) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return <strong key={j} className="font-semibold text-zinc-100">{segment.slice(2, -2)}</strong>
      }
      return segment
    })
    return <span key={i}>{formatted}</span>
  })
}

const modes = [
  { id: 'general', label: 'General', icon: MessageCircle, desc: 'Ask anything', color: 'from-orange-500 to-orange-500' },
  { id: 'dsa', label: 'DSA Help', icon: Code2, desc: 'Data structures & algorithms', color: 'from-emerald-500 to-teal-500' },
  { id: 'interview', label: 'Interview Prep', icon: Briefcase, desc: 'Mock questions & feedback', color: 'from-amber-500 to-orange-500' },
  { id: 'code-review', label: 'Code Review', icon: BookOpen, desc: 'Debug & optimize code', color: 'from-rose-500 to-pink-500' },
]

const suggestionsMap = {
  general: ['Explain dynamic programming', 'Tips for system design interviews', 'How to prepare for FAANG?', 'Explain Big O notation'],
  dsa: ['Explain binary search', 'How to approach graph problems?', 'What is a sliding window?', 'Explain recursion vs iteration'],
  interview: ['Give me a behavioral question', 'System design: design a chat app', 'What are common React interview Q&A?', 'How to answer "Tell me about yourself"'],
  'code-review': ['Review my sorting algorithm', 'How to optimize this SQL query?', 'Is my code following best practices?', 'Find bugs in my code'],
}

export default function MentorPage() {
  const [input, setInput] = useState('')
  const { messages, loading, mode, setMode, sendMessage, clearMessages } = useMentorStore()
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    sendMessage(input.trim())
    setInput('')
  }

  const suggestions = suggestionsMap[mode] || suggestionsMap.general
  const activeMode = modes.find((m) => m.id === mode) || modes[0]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">AI Mentor</h1>
          <p className="text-sm text-zinc-500 mt-1">Your 24/7 coding companion — powered by GPT-4o</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} className="btn btn-ghost btn-sm text-zinc-500 hover:text-red-400">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {modes.map((m) => {
          const Icon = m.icon
          const isActive = mode === m.id
          return (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/25'
                  : 'text-zinc-500 hover:text-zinc-300 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          )
        })}
      </div>

      {/* Chat */}
      <div className="card overflow-hidden">
        <div className="h-[calc(100vh-330px)] min-h-[400px] overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeMode.color} flex items-center justify-center mb-4`}>
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">{activeMode.label} Mode</h3>
              <p className="text-sm text-zinc-500 max-w-sm mb-6">{activeMode.desc}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeMode.color} flex items-center justify-center flex-shrink-0`}>
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-orange-500 text-white rounded-br-md'
                      : 'bg-zinc-800/80 text-zinc-200 rounded-bl-md'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {msg.role === 'assistant' ? formatMessage(msg.content) : msg.content}
                  </div>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-zinc-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${activeMode.color} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-zinc-800/80 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-zinc-500"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="border-t border-zinc-800/60 p-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask your AI mentor anything (${activeMode.label} mode)...`}
              disabled={loading}
              className="input flex-1"
              id="mentor-input"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="btn btn-primary btn-icon px-4"
              id="mentor-send"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
