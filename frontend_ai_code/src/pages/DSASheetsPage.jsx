import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, Loader2, Star, Filter, CheckCircle } from 'lucide-react'
import useSheetStore from '../store/useSheetStore'

const tagColors = {
  beginner: 'badge-success',
  revision: 'badge-accent',
  'interview-ready': 'badge-warning',
  mixed: 'badge-info',
  'company-specific': 'badge-danger',
}

const tagLabels = {
  beginner: 'Beginner',
  revision: 'Revision',
  'interview-ready': 'Interview Ready',
  mixed: 'Mixed',
  'company-specific': 'Company Specific',
}

export default function DSASheetsPage() {
  const { sheets, loading, fetchSheets, seedSheets } = useSheetStore()
  const [activeTag, setActiveTag] = useState('')

  useEffect(() => {
    fetchSheets(activeTag)
  }, [activeTag])

  const allTags = ['beginner', 'revision', 'interview-ready', 'mixed', 'company-specific']

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" /> DSA Sheets
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Curated problem sheets from top educators — everything in one place</p>
        </div>
      </div>

      {/* Tag filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTag('')}
          className={`btn btn-sm ${!activeTag ? 'btn-primary' : 'btn-secondary'}`}
        >
          All Sheets
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag === activeTag ? '' : tag)}
            className={`btn btn-sm ${activeTag === tag ? 'btn-primary' : 'btn-ghost'}`}
          >
            {tagLabels[tag] || tag}
          </button>
        ))}
      </div>

      {/* Sheet Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : sheets.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No sheets found. Try a different filter.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sheets.map((sheet, i) => (
            <motion.div
              key={sheet._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card p-6 hover:border-zinc-700 group transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                {sheet.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <CheckCircle className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>

              <h3 className="text-[15px] font-semibold text-zinc-100 mb-1 group-hover:text-emerald-300 transition-colors line-clamp-2">
                {sheet.title}
              </h3>
              <p className="text-xs text-zinc-500 mb-2">by {sheet.author}</p>
              <p className="text-[13px] text-zinc-400 leading-relaxed mb-4 line-clamp-3 flex-1">
                {sheet.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {sheet.tags?.map((tag) => (
                  <span key={tag} className={`badge text-[10px] ${tagColors[tag] || 'badge-neutral'}`}>
                    {tag}
                  </span>
                ))}
                <span className="badge badge-neutral text-[10px]">
                  {sheet.problemCount} problems
                </span>
              </div>

              <a
                href={sheet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm w-full mt-auto"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open Sheet
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
