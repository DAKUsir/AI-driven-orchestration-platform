import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, Trash2, Loader2, User } from 'lucide-react'
import useMentorStore from '../store/useMentorStore'

function formatMessage(content) {
  // Split by code blocks
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
    // Bold
    const formatted = part.split(/(\*\*.*?\*\*)/g).map((segment, j) => {
      if (segment.startsWith('**') && segment.endsWith('**')) {
        return <strong key={j} className="font-semibold text-zinc-100">{segment.slice(2, -2)}</strong>
      }
      return segment
    })
    return <span key={i}>{formatted}</span>
  })
}

const suggestions = [
  'Explain dynamic programming',
  'How to reverse a linked list?',
  'Tips for system design interviews',
  'Explain Big O notation',
]

export default function MentorPage() {
  const [input, setInput] = useState('')
  const { messages, loading, sendMessage, clearMessages } = useMentorStore()
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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">AI Mentor</h1>
          <p className="text-sm text-zinc-500 mt-1">Your 24/7 coding companion</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} className="btn btn-ghost btn-sm text-zinc-500 hover:text-red-400">
            <Trash2 className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Chat */}
      <div className="card overflow-hidden">
        <div className="h-[calc(100vh-280px)] min-h-[400px] overflow-y-auto p-5 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4">
                <Bot className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100 mb-1">Ask me anything</h3>
              <p className="text-sm text-zinc-500 max-w-sm mb-6">
                I can help you debug code, explain concepts, or prepare for interviews.
              </p>
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-indigo-500 text-white rounded-br-md'
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
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
              placeholder="Ask your AI mentor anything..."
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
