import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Code2, ChevronDown, RotateCcw, Play, Bot, Send, Lightbulb,
  MessageSquare, Terminal, Loader2, X, Sparkles, Trash2, User, ToggleLeft, ToggleRight
} from 'lucide-react'
import Editor from '@monaco-editor/react'
import api from '../utils/api'

const languages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'cpp', label: 'C++' },
  { id: 'typescript', label: 'TypeScript' },
]

const starters = {
  javascript: `// Start coding here\nconsole.log("Hello, World!");\n`,
  python: `# Start coding here\nprint("Hello, World!")\n`,
  java: `// Start coding here\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}\n`,
  cpp: `// Start coding here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, World!" << endl;\n    return 0;\n}\n`,
  typescript: `// Start coding here\nconsole.log("Hello, World!");\n`,
}

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

export default function CodeEditorPage() {
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(starters.javascript)
  const [showLangMenu, setShowLangMenu] = useState(false)

  // Custom test cases
  const [testInput, setTestInput] = useState('')
  const [testOutput, setTestOutput] = useState('')
  const [running, setRunning] = useState(false)

  // AI panel
  const [showAI, setShowAI] = useState(false)
  const [aiMessages, setAiMessages] = useState([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [hintMode, setHintMode] = useState(true) // true = hints only, false = full solutions
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [aiMessages])

  const handleLanguageChange = (lang) => {
    setLanguage(lang)
    setCode(starters[lang] || '')
    setShowLangMenu(false)
  }

  const handleReset = () => {
    setCode(starters[language] || '')
    setTestOutput('')
  }

  // Run code (JS/TS in browser, others simulated)
  const handleRun = () => {
    setRunning(true)
    setTestOutput('')
    setTimeout(() => {
      if (language === 'javascript' || language === 'typescript') {
        try {
          const logs = []
          const origLog = console.log
          console.log = (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
          const indirectEval = eval
          indirectEval(code)
          console.log = origLog
          setTestOutput(logs.join('\n') || 'No output')
        } catch (err) {
          setTestOutput(`Error: ${err.message}`)
        }
      } else {
        setTestOutput(`[Simulated] ${language} execution requires a backend sandbox.\nOutput would appear here.`)
      }
      setRunning(false)
    }, 400)
  }

  // Send message to AI with code context
  const sendToAI = async (message) => {
    const userMsg = { role: 'user', content: message }
    setAiMessages((prev) => [...prev, userMsg])
    setAiLoading(true)
    setShowAI(true)

    try {
      const modeInstruction = hintMode
        ? '\n\n[IMPORTANT: The user is in HINT MODE. Do NOT give the full solution. Instead, give helpful hints, guiding questions, and explain concepts that will help them solve it themselves. Point them in the right direction without writing the complete code.]'
        : '\n\n[The user wants a full solution. Provide complete, working code with detailed explanations.]'

      const prompt = `[Code Editor Context]\nLanguage: ${language}\n\`\`\`${language}\n${code}\n\`\`\`\n${testInput ? `\nCustom Input:\n${testInput}` : ''}${testOutput ? `\nOutput:\n${testOutput}` : ''}${modeInstruction}\n\nUser: ${message}`

      const { data } = await api.post('/ai/chat', { message: prompt, contextType: 'code-editor' })
      const aiMsg = { role: 'assistant', content: data.response }
      setAiMessages((prev) => [...prev, aiMsg])
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, the AI service is temporarily unavailable. Please try again.' },
      ])
    }
    setAiLoading(false)
  }

  const handleAskHint = () => {
    sendToAI('Give me a hint about how to improve or fix this code. Don\'t give the full solution, just a helpful hint.')
  }

  const handleAIChatSend = (e) => {
    e.preventDefault()
    if (!aiInput.trim() || aiLoading) return
    sendToAI(aiInput.trim())
    setAiInput('')
  }

  const clearAI = () => {
    setAiMessages([])
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Code Editor</h1>
          <p className="text-sm text-zinc-500 mt-1">Write, run, and learn with AI assistance</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAskHint}
            disabled={aiLoading}
            className="btn btn-secondary btn-sm"
            id="ask-hint"
          >
            <Lightbulb className="w-4 h-4" />
            Ask for Hint
          </button>
          <button
            onClick={() => setShowAI(!showAI)}
            className={`btn btn-sm ${showAI ? 'btn-primary' : 'btn-secondary'}`}
            id="toggle-ai-chat"
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* ── Left: Editor + Test Cases ──────────────────────────────────── */}
        <div className={`flex flex-col gap-3 ${showAI ? 'w-1/2' : 'w-full'} transition-all`}>
          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="btn btn-secondary btn-sm"
                id="language-selector"
              >
                {languages.find((l) => l.id === language)?.label}
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showLangMenu && (
                <div className="absolute top-full mt-1 left-0 z-10 card p-1 min-w-[150px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageChange(lang.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        language === lang.id
                          ? 'bg-indigo-500/12 text-indigo-400'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1" />

            <button onClick={handleReset} className="btn btn-ghost btn-sm btn-icon" title="Reset">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRun}
              disabled={running}
              className="btn btn-primary btn-sm"
              id="run-code"
            >
              {running ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="card overflow-hidden" style={{ height: showAI ? '350px' : '450px' }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono', monospace",
                minimap: { enabled: false },
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                renderLineHighlight: 'line',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Custom Test Cases: Input & Output side by side */}
          <div className="grid grid-cols-2 gap-3">
            {/* Input */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-400">Custom Input</span>
              </div>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter test input here..."
                className="w-full bg-transparent border-0 outline-none resize-none text-sm text-zinc-300 font-mono placeholder:text-zinc-700"
                rows={4}
                id="test-input"
              />
            </div>

            {/* Output */}
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Terminal className="w-4 h-4 text-zinc-500" />
                <span className="text-xs font-medium text-zinc-400">Output</span>
              </div>
              <pre className="text-sm text-zinc-300 font-mono whitespace-pre-wrap min-h-[80px]">
                {testOutput || <span className="text-zinc-700">Run your code to see output here...</span>}
              </pre>
            </div>
          </div>
        </div>

        {/* ── Right: AI Chat Panel ──────────────────────────────────────── */}
        <AnimatePresence>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: '50%' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col overflow-hidden"
            >
              <div className="card flex flex-col h-full overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                {/* AI Header */}
                <div className="flex items-center justify-between p-4 border-b border-zinc-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">AI Assistant</h3>
                      <p className="text-[10px] text-zinc-600">Powered by GPT-5</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Hint Mode Toggle */}
                    <button
                      onClick={() => setHintMode(!hintMode)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                        hintMode
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                      title={hintMode ? 'Hint Mode: Only gives hints' : 'Solution Mode: Full solutions'}
                    >
                      <Lightbulb className="w-3 h-3" />
                      {hintMode ? 'Hints' : 'Solutions'}
                    </button>
                    {aiMessages.length > 0 && (
                      <button onClick={clearAI} className="btn btn-ghost btn-sm btn-icon p-1.5 text-zinc-500 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => setShowAI(false)} className="btn btn-ghost btn-sm btn-icon p-1.5">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {aiMessages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-4">
                      <Sparkles className="w-10 h-10 text-zinc-700 mb-3" />
                      <h3 className="text-sm font-semibold text-zinc-300 mb-1">AI Code Assistant</h3>
                      <p className="text-xs text-zinc-600 mb-2 max-w-[250px]">
                        Ask questions about your code, request hints, or get explanations.
                      </p>
                      <div className={`px-2.5 py-1 rounded-lg text-[11px] font-medium mb-5 ${
                        hintMode ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {hintMode ? '💡 Hint Mode — guides without spoiling' : '✅ Solution Mode — full answers'}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          'Explain this code',
                          'How can I optimize?',
                          'Find potential bugs',
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => sendToAI(q)}
                            className="px-3 py-1.5 text-xs rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {aiMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Bot className="w-3 h-3 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[90%] rounded-xl px-3.5 py-2.5 ${
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
                        <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-3 h-3 text-zinc-400" />
                        </div>
                      )}
                    </div>
                  ))}

                  {aiLoading && (
                    <div className="flex gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                      <div className="bg-zinc-800/80 rounded-xl rounded-bl-md px-3.5 py-2.5">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((j) => (
                            <motion.div
                              key={j}
                              className="w-1.5 h-1.5 rounded-full bg-zinc-500"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, repeat: Infinity, delay: j * 0.2 }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleAIChatSend} className="border-t border-zinc-800/60 p-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder="Ask about your code..."
                      disabled={aiLoading}
                      className="input flex-1 text-sm"
                      id="ai-chat-input"
                    />
                    <button
                      type="submit"
                      disabled={!aiInput.trim() || aiLoading}
                      className="btn btn-primary btn-icon px-3"
                      id="ai-chat-send"
                    >
                      {aiLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
