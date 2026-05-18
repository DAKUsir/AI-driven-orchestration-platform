import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Code2, Play, Clock, CheckCircle, Loader2, ChevronRight, RotateCcw, History } from 'lucide-react'
import useInterviewStore from '../store/useInterviewStore'

const topics = ['Algorithms', 'Data Structures', 'System Design', 'Frontend', 'JavaScript', 'Python', 'SQL', 'React']

export default function InterviewPage() {
  const {
    questions, currentIndex, inProgress, loading, result,
    startInterview, submitAnswer, reset,
  } = useInterviewStore()
  const [topic, setTopic] = useState('')
  const [answer, setAnswer] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!inProgress || timeLeft <= 0) return
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [inProgress, timeLeft])

  useEffect(() => {
    if (inProgress && questions.length > 0 && timeLeft === 0) {
      setTimeLeft(120)
    }
  }, [inProgress, questions])

  const handleStart = () => {
    if (!topic.trim()) return
    startInterview(topic)
    setTimeLeft(120)
  }

  const handleSubmit = () => {
    if (!answer.trim()) return
    submitAnswer(answer.trim())
    setAnswer('')
    setTimeLeft(120)
  }

  const progressPct = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Mock Interview</h1>
        <p className="text-sm text-zinc-500 mt-1">Practice with AI-generated technical questions</p>
      </div>

      {/* Topic Selection */}
      {!inProgress && !result && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 max-w-2xl"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-5">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-1">Ready to practice?</h2>
          <p className="text-sm text-zinc-500 mb-6">Choose a topic and start your mock interview session.</p>

          <div className="mb-4">
            <p className="text-xs font-medium text-zinc-400 mb-2">Select Topic</p>
            <div className="flex flex-wrap gap-2">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                    topic === t
                      ? 'bg-indigo-500/12 border-indigo-500/25 text-indigo-400'
                      : 'border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Or type a custom topic..."
              className="input mt-3"
            />
          </div>

          <button
            onClick={handleStart}
            disabled={!topic.trim() || loading}
            className="btn btn-primary w-full"
            id="start-interview"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
            ) : (
              <><Play className="w-4 h-4" /> Start Interview</>
            )}
          </button>
        </motion.div>
      )}

      {/* Active Interview */}
      {inProgress && questions.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-2xl">
          {/* Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Question {currentIndex + 1} of {questions.length}
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-medium ${
              timeLeft <= 30 ? 'text-red-400' : 'text-zinc-400'
            }`}>
              <Clock className="w-4 h-4" />
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${progressPct}%` }}
              className="h-full bg-indigo-500 rounded-full"
            />
          </div>

          {/* Question */}
          <div className="card p-6">
            <p className="text-zinc-200 text-[15px] leading-relaxed mb-6">
              {questions[currentIndex]}
            </p>

            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer here..."
              rows={6}
              className="input"
              style={{ minHeight: '150px', resize: 'vertical' }}
              id="interview-answer"
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-zinc-600">{answer.length} characters</span>
              <button
                onClick={handleSubmit}
                disabled={!answer.trim()}
                className="btn btn-primary btn-sm"
                id="submit-answer"
              >
                Submit Answer <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card p-8 text-center max-w-lg mx-auto"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-zinc-100 mb-2">Interview Complete!</h2>

          {/* Score display */}
          <div className="my-6">
            <p className="text-5xl font-bold text-indigo-400 mb-1">{result.score}%</p>
            <p className="text-sm text-zinc-500">Overall Score</p>
          </div>

          {/* Score breakdown */}
          {(result.technicalScore || result.communicationScore || result.confidenceScore) && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Technical', value: result.technicalScore },
                { label: 'Communication', value: result.communicationScore },
                { label: 'Confidence', value: result.confidenceScore },
              ].filter(s => s.value).map(({ label, value }) => (
                <div key={label} className="card-sm p-3">
                  <p className="text-lg font-bold text-zinc-200">{value}%</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {result.feedback && (
            <p className="text-sm text-zinc-400 mb-6">{result.feedback}</p>
          )}

          <button onClick={reset} className="btn btn-primary">
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </motion.div>
      )}
    </div>
  )
}
