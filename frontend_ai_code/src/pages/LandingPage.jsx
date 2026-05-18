import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Sparkles, Code2, GraduationCap, Route, Bot,
  BarChart3, Trophy, Puzzle, Columns3, Eye, Shield, ChevronRight,
  Zap, Users, BookOpen, CheckCircle,
} from 'lucide-react'

const features = [
  {
    icon: Route,
    title: 'AI-Driven Roadmaps',
    desc: 'Personalized multi-week study schedules that adapt to your progress and skill gaps in real time.',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    icon: Columns3,
    title: 'Kanban Task Planner',
    desc: 'Drag-and-drop task board pulling curated problems from LeetCode, GFG, Kaggle, and more.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: Puzzle,
    title: 'Seamless Integrations',
    desc: 'Auto-sync progress across LeetCode, GitHub, Coursera, and Google Calendar.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: Bot,
    title: 'AI Mentor Chat',
    desc: 'Context-aware tutoring and interview simulations with follow-up questions on your solutions.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Code2,
    title: 'Monaco Code Editor',
    desc: 'Practice coding with the same editor that powers VS Code, right inside the platform.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Eye,
    title: 'Emotion Detection',
    desc: 'Real-time confidence analytics via webcam during mock interviews to improve your composure.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Rich Analytics',
    desc: 'Track coding accuracy, interview confidence, and topic mastery with interactive visualizations.',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    icon: Shield,
    title: 'Secure Auth',
    desc: 'Email/password with bcrypt hashing and Google OAuth. JWT-secured sessions.',
    color: 'from-zinc-500 to-zinc-600',
  },
]

const stats = [
  { value: '10K+', label: 'Active Learners' },
  { value: '50K+', label: 'Problems Curated' },
  { value: '95%', label: 'Interview Success' },
  { value: '4.9', label: 'User Rating' },
]

const steps = [
  { num: '01', title: 'Set Your Goals', desc: 'Tell us your target role, experience level, and timeline.' },
  { num: '02', title: 'Get Your Roadmap', desc: 'AI generates a personalized study plan across multiple platforms.' },
  { num: '03', title: 'Practice & Track', desc: 'Solve problems, attend mock interviews, and watch your progress grow.' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: '#09090b' }}>
      {/* ── Navigation ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'border-b border-zinc-800/60' : ''
        }`}
        style={{
          background: scrolled ? 'rgba(9, 9, 11, 0.85)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-100 text-[15px]">CodeMentor AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="btn btn-ghost btn-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[100px]" />

        <div className="relative max-w-7xl mx-auto px-5">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 text-xs text-zinc-400 mb-8">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                AI-Powered Interview Preparation
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-zinc-100 leading-[1.1] tracking-tight mb-6 text-balance"
            >
              Ace your coding{' '}
              <span className="gradient-text">interview</span>
              <br className="hidden sm:block" />
              {' '}with AI
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-zinc-500 mb-10 max-w-xl mx-auto leading-relaxed"
            >
              Personalized roadmaps, AI mentor, mock interviews, and real-time analytics — unified in one platform.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary btn-lg w-full sm:w-auto"
              >
                Start Free <ArrowRight className="w-4 h-4" />
              </button>
              <button className="btn btn-secondary btn-lg w-full sm:w-auto">
                Watch Demo
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 border-y border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl lg:text-4xl font-bold text-zinc-100 tracking-tight">{value}</p>
                <p className="text-sm text-zinc-500 mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3"
            >
              Features
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl lg:text-4xl font-bold text-zinc-100 tracking-tight"
            >
              Everything you need to land
              <br className="hidden sm:block" />
              {' '}your dream job
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map(({ icon: Icon, title, desc, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="card p-6 hover:border-zinc-700 group cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-[15px] font-semibold text-zinc-100 mb-2">{title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center mb-16">
            <p className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3">How It Works</p>
            <h2 className="text-3xl lg:text-4xl font-bold text-zinc-100 tracking-tight">
              Three steps to interview mastery
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {steps.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative card p-8 text-center"
              >
                <div className="text-5xl font-bold text-zinc-800 mb-4">{num}</div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500">{desc}</p>
                {i < 2 && (
                  <ChevronRight className="hidden lg:block absolute right-[-20px] top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-700" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-28 border-t border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-zinc-100 tracking-tight mb-6">
              Ready to start your journey?
            </h2>
            <p className="text-lg text-zinc-500 mb-10 max-w-lg mx-auto">
              Join thousands of developers who've landed roles at top tech companies.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn btn-primary btn-lg"
            >
              Get Started Free <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800/60 py-12">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-zinc-400 text-sm">CodeMentor AI</span>
            </div>
            <p className="text-xs text-zinc-600">
              © {new Date().getFullYear()} CodeMentor AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
