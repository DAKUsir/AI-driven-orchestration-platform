import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Upload, FileText, Target, CheckCircle, Loader2, Sparkles, AlertCircle, X } from 'lucide-react'
import useCareerStore from '../store/useCareerStore'

export default function CareerPage() {
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const { analysis, uploading, error, uploadResume, clearAnalysis } = useCareerStore()
  const fileRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Career Accelerator</h1>
        <p className="text-sm text-zinc-500 mt-1">Upload your resume and get AI-powered insights</p>
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
    </div>
  )
}
