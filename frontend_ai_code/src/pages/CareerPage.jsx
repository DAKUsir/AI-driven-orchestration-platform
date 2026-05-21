import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Briefcase, Upload, FileText, Target, Loader2, Sparkles, AlertCircle,
  X, Copy, Check, RefreshCw, MessageSquare, PenTool, Mail, HelpCircle,
  SlidersHorizontal, ChevronRight
} from 'lucide-react'
import useCareerStore from '../store/useCareerStore'

const tabs = [
  { id: 'upload', label: 'Upload & Parse', icon: Upload, color: 'orange' },
  { id: 'analyze', label: 'ATS Analysis', icon: Target, color: 'emerald' },
  { id: 'rephrase', label: 'Rephrase', icon: PenTool, color: 'amber' },
  { id: 'cover', label: 'Cover Letter', icon: Mail, color: 'cyan' },
  { id: 'interview', label: 'Interview Prep', icon: HelpCircle, color: 'orange' },
]

const colorMap = {
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', ring: 'ring-orange-500/30' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', ring: 'ring-emerald-500/30' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', ring: 'ring-amber-500/30' },
  cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20', ring: 'ring-cyan-500/30' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', ring: 'ring-orange-500/30' },
}

function MarkdownRenderer({ content }) {
  if (!content) return null
  const parts = content.split(/(```[\s\S]*?```)/g)
  return (
    <div className="prose prose-invert prose-sm max-w-none space-y-3">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const code = part.slice(3, -3).replace(/^\w+\n/, '')
          return <pre key={i} className="bg-black/40 rounded-xl p-4 text-xs font-mono text-zinc-300 overflow-x-auto border border-zinc-800">{code}</pre>
        }
        return (
          <div key={i} className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {part.split(/((?:^|\n)#{1,3}\s.+)/g).map((seg, j) => {
              if (/^(#{1,3})\s(.+)/.test(seg.trim())) {
                const m = seg.trim().match(/^(#{1,3})\s(.+)/)
                const level = m[1].length
                const cls = level === 1 ? 'text-lg font-bold text-zinc-100 mt-4 mb-2'
                  : level === 2 ? 'text-base font-semibold text-zinc-200 mt-3 mb-1.5'
                  : 'text-sm font-medium text-zinc-300 mt-2 mb-1'
                return <div key={j} className={cls}>{m[2]}</div>
              }
              const formatted = seg.split(/(\*\*.*?\*\*)/g).map((s, k) => {
                if (s.startsWith('**') && s.endsWith('**')) return <strong key={k} className="font-semibold text-zinc-100">{s.slice(2, -2)}</strong>
                return s
              })
              return <span key={j}>{formatted}</span>
            })}
          </div>
        )
      })}
    </div>
  )
}

function SliderControl({ label, value, onChange, min = 0, max = 1, step = 0.1 }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-zinc-400">{label}</span>
        <span className="text-xs text-zinc-500 font-mono">{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-zinc-800 accent-orange-500 cursor-pointer" />
    </div>
  )
}

function ResultCard({ title, content, copyable = true }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  if (!content) return null
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
        {copyable && (
          <button onClick={handleCopy} className="btn btn-ghost btn-sm btn-icon text-zinc-500 hover:text-zinc-300">
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>
      <MarkdownRenderer content={content} />
    </motion.div>
  )
}

export default function CareerPage() {
  const store = useCareerStore()
  const { activeTab, error, parsedText, setParsedText, clearError, setActiveTab } = store
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  // Analyze form state
  const [jobDesc, setJobDesc] = useState('')
  const [withJD, setWithJD] = useState(true)
  const [temperature, setTemperature] = useState(0.5)
  const [maxTokens, setMaxTokens] = useState(1024)

  // Rephrase form state
  const [rephraseInput, setRephraseInput] = useState('')
  const [repTemp, setRepTemp] = useState(0.5)
  const [repTokens, setRepTokens] = useState(1024)

  // Cover letter form state
  const [coverResumeText, setCoverResumeText] = useState('')
  const [coverJD, setCoverJD] = useState('')
  const [coverTemp, setCoverTemp] = useState(0.5)
  const [coverTokens, setCoverTokens] = useState(1024)

  // Interview form state
  const [interviewJD, setInterviewJD] = useState('')
  const [intTemp, setIntTemp] = useState(0.5)
  const [intTokens, setIntTokens] = useState(1024)

  const [showSettings, setShowSettings] = useState(false)
  const currentTab = tabs.find(t => t.id === activeTab) || tabs[0]
  const colors = colorMap[currentTab.color]

  const handleUpload = () => {
    if (!file) return
    store.uploadResume(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Resume Analyzer</h1>
        <p className="text-sm text-zinc-500 mt-1">AI-powered resume analysis, cover letters, and interview prep</p>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-xl p-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={clearError} className="text-red-400/60 hover:text-red-400"><X className="w-3.5 h-3.5" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Navigation */}
      <div className="flex gap-1.5 p-1 bg-zinc-900/50 rounded-xl border border-zinc-800/60 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          const c = colorMap[tab.color]
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive ? `${c.bg} ${c.text} ${c.border} border` : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
              }`} id={`tab-${tab.id}`}>
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* ── Upload & Parse ────────────────────────────────── */}
        {activeTab === 'upload' && (
          <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl ${colors.bg} flex items-center justify-center`}>
                <Upload className={`w-4 h-4 ${colors.text}`} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-zinc-100">Upload Resume</h2>
                <p className="text-[11px] text-zinc-500">Upload PDF or DOCX to extract text</p>
              </div>
            </div>

            <div onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)} onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? 'border-orange-500/50 bg-orange-500/5' : 'border-zinc-800 hover:border-zinc-700'
              }`}>
              <Upload className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-sm text-zinc-300">{file ? file.name : 'Drop your resume or click to browse'}</p>
              <p className="text-xs text-zinc-600 mt-1">PDF or DOCX, max 5MB</p>
              <input ref={fileRef} type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0] || null)} className="hidden" id="resume-upload" />
            </div>

            {file && (
              <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <FileText className="w-5 h-5 text-orange-400" />
                <span className="text-sm text-zinc-300 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-zinc-600">{(file.size / 1024).toFixed(1)} KB</span>
                <button onClick={() => setFile(null)} className="text-zinc-600 hover:text-zinc-400"><X className="w-4 h-4" /></button>
              </div>
            )}

            <button onClick={handleUpload} disabled={!file || store.parsing}
              className="btn btn-primary w-full mt-4" id="parse-resume">
              {store.parsing ? <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</> : <><Sparkles className="w-4 h-4" /> Parse Resume</>}
            </button>

            {parsedText && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-zinc-400">Extracted Text</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Ready</span>
                </div>
                <textarea value={parsedText} onChange={(e) => setParsedText(e.target.value)} rows={8}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 font-mono resize-y outline-none focus:border-zinc-700"
                  id="parsed-text" />
                <button onClick={() => setActiveTab('analyze')} className="btn btn-secondary btn-sm mt-2">
                  <ChevronRight className="w-3.5 h-3.5" /> Continue to Analysis
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── ATS Analysis ──────────────────────────────────── */}
        {activeTab === 'analyze' && (
          <motion.div key="analyze" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-xl ${colorMap.emerald.bg} flex items-center justify-center`}>
                  <Target className={`w-4 h-4 ${colorMap.emerald.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-zinc-100">ATS Resume Analysis</h2>
                  <p className="text-[11px] text-zinc-500">Get ATS score, feedback, and suggestions</p>
                </div>
                <button onClick={() => setShowSettings(!showSettings)} className="btn btn-ghost btn-sm btn-icon">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Resume Text</label>
                  <textarea value={parsedText} onChange={(e) => setParsedText(e.target.value)} rows={5}
                    placeholder="Paste your resume text or upload in the Upload tab..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 resize-y outline-none focus:border-zinc-700"
                    id="analyze-resume-text" />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={withJD} onChange={(e) => setWithJD(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 text-orange-500 focus:ring-orange-500/30" />
                  <span className="text-xs text-zinc-400">Analyze with Job Description</span>
                </label>

                {withJD && (
                  <div>
                    <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Job Description</label>
                    <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} rows={4}
                      placeholder="Paste the job description here..."
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 resize-y outline-none focus:border-zinc-700"
                      id="job-description" />
                  </div>
                )}

                <AnimatePresence>
                  {showSettings && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-2 gap-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                      <SliderControl label="Temperature" value={temperature} onChange={setTemperature} min={0} max={1} step={0.1} />
                      <SliderControl label="Max Tokens" value={maxTokens} onChange={setMaxTokens} min={256} max={4096} step={256} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={() => store.analyzeResume(parsedText, jobDesc, withJD, temperature, maxTokens)}
                  disabled={!parsedText || store.analyzing} className="btn btn-primary w-full" id="run-analysis">
                  {store.analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze Resume</>}
                </button>
              </div>
            </div>
            <ResultCard title="Analysis Results" content={store.analysis} />
          </motion.div>
        )}

        {/* ── Rephrase ──────────────────────────────────────── */}
        {activeTab === 'rephrase' && (
          <motion.div key="rephrase" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-xl ${colorMap.amber.bg} flex items-center justify-center`}>
                  <PenTool className={`w-4 h-4 ${colorMap.amber.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-zinc-100">Rephrase Text</h2>
                  <p className="text-[11px] text-zinc-500">Rephrase resume bullets for maximum impact</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Text to Rephrase</label>
                  <textarea value={rephraseInput} onChange={(e) => setRephraseInput(e.target.value)} rows={5}
                    placeholder="Paste the text you want rephrased..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 resize-y outline-none focus:border-zinc-700"
                    id="rephrase-input" />
                </div>
                <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <SliderControl label="Temperature" value={repTemp} onChange={setRepTemp} min={0} max={1} step={0.1} />
                  <SliderControl label="Max Tokens" value={repTokens} onChange={setRepTokens} min={256} max={4096} step={256} />
                </div>
                <button onClick={() => store.rephraseText(rephraseInput, repTemp, repTokens)}
                  disabled={!rephraseInput || store.rephrasing} className="btn btn-primary w-full" id="run-rephrase">
                  {store.rephrasing ? <><Loader2 className="w-4 h-4 animate-spin" /> Rephrasing...</> : <><PenTool className="w-4 h-4" /> Rephrase</>}
                </button>
              </div>
            </div>
            <ResultCard title="Rephrased Text" content={store.rephrased} />
          </motion.div>
        )}

        {/* ── Cover Letter ──────────────────────────────────── */}
        {activeTab === 'cover' && (
          <motion.div key="cover" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-xl ${colorMap.cyan.bg} flex items-center justify-center`}>
                  <Mail className={`w-4 h-4 ${colorMap.cyan.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-zinc-100">Cover Letter Generator</h2>
                  <p className="text-[11px] text-zinc-500">Generate a tailored cover letter</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Resume Text</label>
                  <textarea value={coverResumeText || parsedText} onChange={(e) => setCoverResumeText(e.target.value)} rows={4}
                    placeholder="Paste your resume text..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 resize-y outline-none focus:border-zinc-700"
                    id="cover-resume" />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Job Description</label>
                  <textarea value={coverJD} onChange={(e) => setCoverJD(e.target.value)} rows={4}
                    placeholder="Paste the target job description..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 resize-y outline-none focus:border-zinc-700"
                    id="cover-jd" />
                </div>
                <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <SliderControl label="Temperature" value={coverTemp} onChange={setCoverTemp} min={0} max={1} step={0.1} />
                  <SliderControl label="Max Tokens" value={coverTokens} onChange={setCoverTokens} min={256} max={4096} step={256} />
                </div>
                <button onClick={() => store.generateCoverLetter(coverResumeText || parsedText, coverJD, coverTemp, coverTokens)}
                  disabled={!(coverResumeText || parsedText) || !coverJD || store.generatingCover} className="btn btn-primary w-full" id="gen-cover">
                  {store.generatingCover ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Mail className="w-4 h-4" /> Generate Cover Letter</>}
                </button>
              </div>
            </div>
            <ResultCard title="Cover Letter" content={store.coverLetter} />
          </motion.div>
        )}

        {/* ── Interview Prep ────────────────────────────────── */}
        {activeTab === 'interview' && (
          <motion.div key="interview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-xl ${colorMap.orange.bg} flex items-center justify-center`}>
                  <HelpCircle className={`w-4 h-4 ${colorMap.orange.text}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-zinc-100">Interview Question Generator</h2>
                  <p className="text-[11px] text-zinc-500">Generate role-specific interview questions</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Job Description</label>
                  <textarea value={interviewJD} onChange={(e) => setInterviewJD(e.target.value)} rows={5}
                    placeholder="Paste the job description for interview questions..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 resize-y outline-none focus:border-zinc-700"
                    id="interview-jd" />
                </div>
                <div className="grid grid-cols-2 gap-4 p-3 bg-zinc-900/50 rounded-xl border border-zinc-800">
                  <SliderControl label="Temperature" value={intTemp} onChange={setIntTemp} min={0} max={1} step={0.1} />
                  <SliderControl label="Max Tokens" value={intTokens} onChange={setIntTokens} min={256} max={4096} step={256} />
                </div>
                <button onClick={() => store.generateInterviewQuestions(interviewJD, intTemp, intTokens)}
                  disabled={!interviewJD || store.generatingQuestions} className="btn btn-primary w-full" id="gen-questions">
                  {store.generatingQuestions ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><HelpCircle className="w-4 h-4" /> Generate Questions</>}
                </button>
              </div>
            </div>
            <ResultCard title="Interview Questions" content={store.interviewQuestions} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
