import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Upload, FileText, Target, CheckCircle, Loader2, Sparkles, AlertCircle, X, TerminalSquare, Copy, Check } from 'lucide-react'
import useCareerStore from '../store/useCareerStore'

export default function CareerPage() {
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const { analysis, uploading, error, uploadResume, clearAnalysis } = useCareerStore()
  const fileRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  
  // API Docs state
  const [showApiDocs, setShowApiDocs] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const apiEndpoints = [
    {
      name: '/process_resume',
      description: 'Upload Resume (PDF or DOCX)',
      params: 'file: filepath (Required)',
      returns: 'str (Parsed Resume Content)',
      code: `from gradio_client import Client, handle_file

client = Client("girishwangikar/ResumeATS")
result = client.predict(
\t\tfile=handle_file('path/to/resume.pdf'),
\t\tapi_name="/process_resume"
)
print(result)`
    },
    {
      name: '/analyze_resume',
      description: 'Analyze resume against job description',
      params: 'resume_text: str (Req), job_description: str (Req), with_job_description: bool (Default: True), temperature: float (0.5), max_tokens: float (1024)',
      returns: 'str (Analysis Markdown)',
      code: `from gradio_client import Client

client = Client("girishwangikar/ResumeATS")
result = client.predict(
\t\tresume_text="Parsed content...",
\t\tjob_description="Job desc...",
\t\twith_job_description=True,
\t\ttemperature=0.5,
\t\tmax_tokens=1024,
\t\tapi_name="/analyze_resume"
)
print(result)`
    },
    {
      name: '/rephrase_text',
      description: 'Rephrase resume text for impact',
      params: 'text: str (Req), temperature: float (0.5), max_tokens: float (1024)',
      returns: 'str (Rephrased Text)',
      code: `from gradio_client import Client

client = Client("girishwangikar/ResumeATS")
result = client.predict(
\t\ttext="Text to rephrase...",
\t\ttemperature=0.5,
\t\tmax_tokens=1024,
\t\tapi_name="/rephrase_text"
)
print(result)`
    },
    {
      name: '/generate_cover_letter',
      description: 'Generate tailored cover letter',
      params: 'resume_text: str (Req), job_description: str (Req), temperature: float (0.5), max_tokens: float (1024)',
      returns: 'str (Cover Letter)',
      code: `from gradio_client import Client

client = Client("girishwangikar/ResumeATS")
result = client.predict(
\t\tresume_text="Parsed content...",
\t\tjob_description="Job desc...",
\t\ttemperature=0.5,
\t\tmax_tokens=1024,
\t\tapi_name="/generate_cover_letter"
)
print(result)`
    },
    {
      name: '/generate_interview_questions',
      description: 'Generate role-specific interview questions',
      params: 'job_description: str (Req), temperature: float (0.5), max_tokens: float (1024)',
      returns: 'str (Interview Questions)',
      code: `from gradio_client import Client

client = Client("girishwangikar/ResumeATS")
result = client.predict(
\t\tjob_description="Job desc...",
\t\ttemperature=0.5,
\t\tmax_tokens=1024,
\t\tapi_name="/generate_interview_questions"
)
print(result)`
    },
    {
      name: '/update_job_description_visibility',
      description: 'Toggle job description requirement',
      params: 'with_job_description: bool (Default: True)',
      returns: 'str (Job Description)',
      code: `from gradio_client import Client

client = Client("girishwangikar/ResumeATS")
result = client.predict(
\t\twith_job_description=True,
\t\tapi_name="/update_job_description_visibility"
)
print(result)`
    }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!file || !targetRole) return
    uploadResume(file, targetRole)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  return (
    <div className="space-y-6 max-w-3xl relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Career Accelerator</h1>
          <p className="text-sm text-zinc-500 mt-1">Upload your resume and get AI-powered insights</p>
        </div>
        <button
          onClick={() => setShowApiDocs(true)}
          className="btn btn-secondary btn-sm"
        >
          <TerminalSquare className="w-4 h-4" />
          API Docs
        </button>
      </div>

      {!analysis ? (
        <motion.form
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card p-6"
        >
          {/* Upload area */}
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              dragOver ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <Upload className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-300 mb-1">
              {file ? file.name : 'Drop your resume here or click to browse'}
            </p>
            <p className="text-xs text-zinc-600">PDF or DOCX, max 10MB</p>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="hidden"
              id="resume-upload"
            />
          </div>

          {file && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <FileText className="w-5 h-5 text-indigo-400" />
              <span className="text-sm text-zinc-300 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-zinc-600">{(file.size / 1024).toFixed(1)} KB</span>
              <button type="button" onClick={() => setFile(null)} className="text-zinc-600 hover:text-zinc-400">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          <div className="mt-4">
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Target Role</label>
            <div className="relative">
              <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="input input-with-icon"
                id="target-role"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-4 text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!file || !targetRole || uploading}
            className="btn btn-primary w-full mt-6"
            id="analyze-resume"
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analyze Resume</>
            )}
          </button>
        </motion.form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-zinc-100">Analysis Results</h2>
              <button onClick={clearAnalysis} className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Analyze another
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <FileText className="w-4 h-4 text-zinc-500" />
              <span className="text-sm text-zinc-300">{analysis.filename}</span>
              <span className="text-zinc-700">•</span>
              <span className="text-xs text-zinc-500">{analysis.targetRole}</span>
            </div>

            {analysis.matchScore !== undefined && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-zinc-500">Match Score</span>
                  <span className="text-sm font-bold text-zinc-200">{analysis.matchScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${analysis.matchScore}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                  />
                </div>
              </div>
            )}

            {analysis.skills?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-medium text-zinc-400 mb-2">Matched Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.skills.map((s) => (
                    <span key={s} className="badge badge-accent">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.gaps?.length > 0 && (
              <div className="mb-5">
                <h3 className="text-xs font-medium text-zinc-400 mb-2">Skill Gaps</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.gaps.map((g) => (
                    <span key={g} className="badge badge-warning">{g}</span>
                  ))}
                </div>
              </div>
            )}

            {analysis.suggestions?.length > 0 && (
              <div>
                <h3 className="text-xs font-medium text-zinc-400 mb-2">Suggestions</h3>
                <ul className="space-y-2">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── API Documentation Modal ── */}
      <AnimatePresence>
        {showApiDocs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setShowApiDocs(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="card w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden bg-[#18181b]"
            >
              <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-bold text-zinc-100">API Documentation</h3>
                  <p className="text-xs text-zinc-500">Gradio Client Snippets for girishwangikar/ResumeATS</p>
                </div>
                <button
                  onClick={() => setShowApiDocs(false)}
                  className="btn btn-ghost btn-sm btn-icon"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                  <p className="text-sm text-indigo-300">
                    <strong>1. Install the python client:</strong> <code>pip install gradio_client</code>
                  </p>
                </div>

                {apiEndpoints.map((endpoint, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-emerald-400 font-mono">
                        {endpoint.name}
                      </h4>
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">{endpoint.description}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-zinc-500 block mb-1">Parameters:</span>
                        <code className="text-amber-300/80">{endpoint.params}</code>
                      </div>
                      <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                        <span className="text-zinc-500 block mb-1">Returns:</span>
                        <code className="text-cyan-300/80">{endpoint.returns}</code>
                      </div>
                    </div>

                    <div className="relative group">
                      <div className="absolute right-2 top-2">
                        <button
                          onClick={() => copyToClipboard(endpoint.code, i)}
                          className="btn btn-ghost btn-sm btn-icon text-zinc-500 hover:text-zinc-300"
                        >
                          {copiedKey === i ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                      <pre className="text-xs font-mono bg-black/40 p-4 rounded-xl border border-zinc-800 overflow-x-auto text-zinc-300">
                        {endpoint.code}
                      </pre>
                    </div>
                    {i < apiEndpoints.length - 1 && <hr className="border-zinc-800/60 my-6" />}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
