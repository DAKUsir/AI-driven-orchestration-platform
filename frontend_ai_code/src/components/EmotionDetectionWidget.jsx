import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Camera, Smile, Frown, Meh, AlertTriangle } from 'lucide-react'

/**
 * EmotionDetectionWidget — Lightweight UI component for webcam-based
 * confidence detection during mock interviews.
 * 
 * Note: Full face-api.js / TensorFlow.js integration is deferred to
 * a future phase to keep bundle size manageable. This component provides
 * the UI framework and simulates detection scores.
 */

export default function EmotionDetectionWidget({ enabled = false, onToggle }) {
  const [active, setActive] = useState(false)
  const [confidence, setConfidence] = useState(null)

  const handleToggle = () => {
    const newState = !active
    setActive(newState)
    onToggle?.(newState)

    if (newState) {
      // Simulate emotion detection (replace with real face-api.js later)
      const interval = setInterval(() => {
        setConfidence({
          score: Math.round(60 + Math.random() * 35),
          emotion: ['Calm', 'Focused', 'Uncertain', 'Confident'][Math.floor(Math.random() * 4)],
        })
      }, 3000)

      // Store interval for cleanup
      window._emotionInterval = interval
    } else {
      clearInterval(window._emotionInterval)
      setConfidence(null)
    }
  }

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'Confident':
      case 'Calm': return <Smile className="w-4 h-4 text-emerald-400" />
      case 'Uncertain': return <Meh className="w-4 h-4 text-amber-400" />
      case 'Stressed': return <Frown className="w-4 h-4 text-red-400" />
      default: return <Meh className="w-4 h-4 text-zinc-400" />
    }
  }

  if (!enabled) return null

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-medium text-zinc-300">Confidence Tracker</span>
        </div>
        <button
          onClick={handleToggle}
          className={`btn btn-sm btn-icon ${active ? 'bg-indigo-500/12 text-indigo-400' : 'btn-ghost'}`}
        >
          {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {active && confidence && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2">
              {getEmotionIcon(confidence.emotion)}
              <span className="text-sm text-zinc-300">{confidence.emotion}</span>
              <span className="text-xs text-zinc-500 ml-auto">{confidence.score}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${confidence.score}%` }}
                className={`h-full rounded-full ${
                  confidence.score >= 75 ? 'bg-emerald-500' :
                  confidence.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-zinc-600 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Processing locally — your camera data never leaves your device
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {active && !confidence && (
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
          Analyzing...
        </div>
      )}
    </div>
  )
}
