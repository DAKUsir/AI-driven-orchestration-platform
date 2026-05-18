import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Target, ArrowRight, ArrowLeft, Check, GraduationCap, Terminal, Globe, Layers, Code2, Sparkles } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../store/useAuthStore'

const steps = [
  {
    title: 'Your Goal',
    subtitle: 'What do you want to achieve?',
    options: [
      { value: 'faang', label: 'FAANG Prep', desc: 'Ace interviews at top tech companies' },
      { value: 'fullstack', label: 'Full-Stack Mastery', desc: 'Become a confident full-stack developer' },
      { value: 'dsa', label: 'DSA Fundamentals', desc: 'Master data structures & algorithms' },
      { value: 'career', label: 'Career Switch', desc: 'Transition into software engineering' },
    ],
  },
  {
    title: 'Experience Level',
    subtitle: 'Where are you in your journey?',
    options: [
      { value: 'beginner', label: 'Beginner', desc: '0–6 months of coding' },
      { value: 'intermediate', label: 'Intermediate', desc: '6 months – 2 years' },
      { value: 'advanced', label: 'Advanced', desc: '2+ years of experience' },
    ],
  },
  {
    title: 'Focus Areas',
    subtitle: 'What topics interest you most?',
    options: [
      { value: 'algorithms', label: 'Algorithms', desc: 'Sorting, searching, DP, graphs' },
      { value: 'system-design', label: 'System Design', desc: 'Scalability, architecture, patterns' },
      { value: 'frontend', label: 'Frontend', desc: 'React, CSS, performance' },
      { value: 'backend', label: 'Backend', desc: 'APIs, databases, microservices' },
    ],
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { loadUser } = useAuthStore()

  const selectOption = (key) => {
    setAnswers((prev) => ({ ...prev, [steps[step].title]: key }))
  }

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1)
  }

  const handleFinish = async () => {
    setLoading(true)
    try {
      const payload = {
        onboardingCompleted: true,
        targetRole: answers['Your Goal'],
        experienceLevel: answers['Experience Level'],
        skills: answers['Focus Areas'] ? [answers['Focus Areas']] : [],
      }
      await api.patch('/users/profile', payload)
      await loadUser()
      navigate('/dashboard')
    } catch {
      navigate('/dashboard')
    }
  }

  const currentStep = steps[step]
  const selected = answers[currentStep.title]

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#09090b' }}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-100 text-[15px]">CodeMentor AI</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-10 bg-indigo-500' : i < step ? 'w-6 bg-indigo-500/40' : 'w-6 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="card p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-6">
                <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">
                  Step {step + 1} of {steps.length}
                </p>
                <h2 className="text-xl font-bold text-zinc-100">{currentStep.title}</h2>
                <p className="text-sm text-zinc-500 mt-1">{currentStep.subtitle}</p>
              </div>

              <div className="space-y-2.5">
                {currentStep.options.map((opt) => {
                  const isSelected = selected === opt.value
                  return (
                    <button
                      key={opt.value}
                      onClick={() => selectOption(opt.value)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                        isSelected
                          ? 'bg-indigo-500/8 border-indigo-500/25'
                          : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                        isSelected ? 'border-indigo-500 bg-indigo-500' : 'border-zinc-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => step > 0 ? setStep(step - 1) : navigate('/dashboard')}
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 0 ? 'Skip' : 'Back'}
            </button>

            {step < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!selected}
                className="btn btn-primary btn-sm"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={loading || !selected}
                className="btn btn-primary btn-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
