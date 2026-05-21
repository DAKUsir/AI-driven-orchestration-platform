import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Route, CheckCircle, Circle, Sparkles, Trophy, Loader2, Filter, List, LayoutGrid,
  ArrowRight, ArrowLeft, Check, Rocket, Code2, Database, Globe, Smartphone, Brain,
  Server, Layers, Terminal, BarChart3, Cpu
} from 'lucide-react'
import useRoadmapStore from '../store/useRoadmapStore'

const typeColors = {
  'problem-solving': 'badge-accent',
  'project': 'badge-info',
  'mock-interview': 'badge-warning',
  'video': 'badge-neutral',
  'article': 'badge-neutral',
  'quiz': 'badge-success',
  'resume': 'badge-danger',
  'behavioral': 'badge-warning',
  'system-design': 'badge-info',
}

// ── Wizard Data ──────────────────────────────────────────────────────
const tracks = [
  { id: 'frontend', label: 'Frontend Development', icon: Globe, color: 'from-blue-500 to-cyan-500', desc: 'React, Vue, CSS, performance' },
  { id: 'backend', label: 'Backend Development', icon: Server, color: 'from-emerald-500 to-teal-500', desc: 'APIs, databases, microservices' },
  { id: 'fullstack', label: 'Full-Stack', icon: Layers, color: 'from-orange-500 to-orange-500', desc: 'End-to-end web development' },
  { id: 'data-science', label: 'Data Science', icon: BarChart3, color: 'from-amber-500 to-orange-500', desc: 'ML, analytics, visualization' },
  { id: 'devops', label: 'DevOps & Cloud', icon: Terminal, color: 'from-rose-500 to-pink-500', desc: 'CI/CD, Docker, Kubernetes, AWS' },
  { id: 'mobile', label: 'Mobile Development', icon: Smartphone, color: 'from-orange-500 to-orange-500', desc: 'React Native, Flutter, Swift' },
  { id: 'ml-engineer', label: 'ML Engineering', icon: Brain, color: 'from-red-500 to-rose-500', desc: 'Deep learning, MLOps, NLP' },
  { id: 'competitive', label: 'Competitive Programming', icon: Cpu, color: 'from-yellow-500 to-amber-500', desc: 'DSA, contest prep, problem solving' },
]

const rolesByTrack = {
  frontend: ['React Developer', 'Vue.js Developer', 'Angular Developer', 'UI Engineer', 'Frontend Architect'],
  backend: ['Node.js Developer', 'Python Developer', 'Java Developer', 'Go Developer', 'Backend Architect'],
  fullstack: ['MERN Stack Developer', 'MEAN Stack Developer', 'Full-Stack Engineer', 'T-Shaped Developer'],
  'data-science': ['Data Analyst', 'Data Scientist', 'ML Engineer', 'Business Intelligence Analyst'],
  devops: ['DevOps Engineer', 'SRE', 'Cloud Architect', 'Platform Engineer'],
  mobile: ['React Native Developer', 'Flutter Developer', 'iOS Developer', 'Android Developer'],
  'ml-engineer': ['ML Engineer', 'Deep Learning Engineer', 'NLP Engineer', 'Computer Vision Engineer'],
  competitive: ['Competitive Programmer', 'SDE Interview Prep', 'Algorithm Specialist'],
}

const experienceLevels = [
  { value: 'beginner', label: 'Beginner', desc: '0–6 months of coding' },
  { value: 'intermediate', label: 'Intermediate', desc: '6 months – 2 years' },
  { value: 'advanced', label: 'Advanced', desc: '2+ years of experience' },
]

const skillsByTrack = {
  frontend: ['HTML/CSS', 'JavaScript', 'React', 'Vue.js', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Testing', 'Performance'],
  backend: ['Node.js', 'Express', 'Python', 'Django', 'SQL', 'MongoDB', 'Redis', 'Docker', 'GraphQL'],
  fullstack: ['React', 'Node.js', 'MongoDB', 'SQL', 'TypeScript', 'Docker', 'REST APIs', 'GraphQL', 'Testing'],
  'data-science': ['Python', 'Pandas', 'NumPy', 'SQL', 'Machine Learning', 'Deep Learning', 'Visualization', 'Statistics'],
  devops: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform', 'Linux', 'Monitoring', 'Networking'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'App Store', 'UI/UX', 'REST APIs'],
  'ml-engineer': ['Python', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision', 'MLOps', 'Data Pipelines', 'Math/Stats'],
  competitive: ['Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Greedy', 'Binary Search', 'Sorting', 'Math'],
}

export default function RoadmapPage() {
  const { roadmap, tasks, loading, error, generateRoadmap, fetchTasks, toggleTask, clearRoadmap } = useRoadmapStore()
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('list')
  const [showWizard, setShowWizard] = useState(false)

  // Wizard state
  const [wizStep, setWizStep] = useState(0)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [selectedRole, setSelectedRole] = useState(null)
  const [selectedExp, setSelectedExp] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [dailyHours, setDailyHours] = useState(2)

  useEffect(() => {
    fetchTasks()
  }, [])

  // Show wizard if no tasks and no roadmap
  useEffect(() => {
    if (!loading && tasks.length === 0 && !roadmap && !error) {
      setShowWizard(true)
    }
  }, [loading, tasks, roadmap, error])

  const completedTasks = tasks.filter((t) => t.completed).length
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  const taskTypes = ['all', ...new Set(tasks.map(t => t.taskType || t.type).filter(Boolean))]
  const filteredTasks = filter === 'all' ? tasks : tasks.filter(t => (t.taskType || t.type) === filter)

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  const handleGenerate = () => {
    const params = {
      targetRole: selectedRole || selectedTrack || 'Software Engineer',
      specificTrack: selectedTrack,
      specificRole: selectedRole,
      experienceLevel: selectedExp || 'beginner',
      skills: selectedSkills,
      dailyStudyHours: dailyHours,
    }
    generateRoadmap(params)
    setShowWizard(false)
  }

  const resetWizard = () => {
    setWizStep(0)
    setSelectedTrack(null)
    setSelectedRole(null)
    setSelectedExp(null)
    setSelectedSkills([])
    setDailyHours(2)
    clearRoadmap()
    setShowWizard(true)
  }

  const currentSkills = selectedTrack ? (skillsByTrack[selectedTrack] || []) : []
  const currentRoles = selectedTrack ? (rolesByTrack[selectedTrack] || []) : []

  // ── Wizard Rendering ─────────────────────────────────────────────
  if (showWizard) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-7 h-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-zinc-100">Build Your Roadmap</h1>
          <p className="text-sm text-zinc-500 mt-1">AI will generate a personalized learning path just for you</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
              i === wizStep ? 'w-10 bg-orange-500' : i < wizStep ? 'w-6 bg-orange-500/40' : 'w-6 bg-zinc-800'
            }`} />
          ))}
        </div>

        <div className="card p-6">
          <AnimatePresence mode="wait">
            {/* Step 0: Track */}
            {wizStep === 0 && (
              <motion.div key="track" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-1">Step 1 of 4</p>
                <h2 className="text-lg font-bold text-zinc-100 mb-1">Choose Your Track</h2>
                <p className="text-sm text-zinc-500 mb-5">What area do you want to specialize in?</p>
                <div className="grid grid-cols-2 gap-2.5">
                  {tracks.map((t) => {
                    const Icon = t.icon
                    const isSelected = selectedTrack === t.id
                    return (
                      <button key={t.id} onClick={() => { setSelectedTrack(t.id); setSelectedRole(null); setSelectedSkills([]) }}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isSelected ? 'bg-orange-500/8 border-orange-500/25' : 'border-zinc-800 hover:border-zinc-700'
                        }`}>
                        <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>{t.label}</p>
                          <p className="text-[11px] text-zinc-600">{t.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 1: Specific Role */}
            {wizStep === 1 && (
              <motion.div key="role" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-1">Step 2 of 4</p>
                <h2 className="text-lg font-bold text-zinc-100 mb-1">Target Role</h2>
                <p className="text-sm text-zinc-500 mb-5">Which specific role are you aiming for?</p>
                <div className="space-y-2">
                  {currentRoles.map((r) => {
                    const isSelected = selectedRole === r
                    return (
                      <button key={r} onClick={() => setSelectedRole(r)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isSelected ? 'bg-orange-500/8 border-orange-500/25' : 'border-zinc-800 hover:border-zinc-700'
                        }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-orange-500 bg-orange-500' : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <p className={`text-sm font-medium ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>{r}</p>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 2: Experience + Hours */}
            {wizStep === 2 && (
              <motion.div key="exp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-1">Step 3 of 4</p>
                <h2 className="text-lg font-bold text-zinc-100 mb-1">Experience & Availability</h2>
                <p className="text-sm text-zinc-500 mb-5">Help us calibrate difficulty and pace</p>
                <div className="space-y-2 mb-6">
                  {experienceLevels.map((lvl) => {
                    const isSelected = selectedExp === lvl.value
                    return (
                      <button key={lvl.value} onClick={() => setSelectedExp(lvl.value)}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          isSelected ? 'bg-orange-500/8 border-orange-500/25' : 'border-zinc-800 hover:border-zinc-700'
                        }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-orange-500 bg-orange-500' : 'border-zinc-700'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isSelected ? 'text-zinc-100' : 'text-zinc-300'}`}>{lvl.label}</p>
                          <p className="text-[11px] text-zinc-600">{lvl.desc}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-300 mb-2 block">Daily study hours: <span className="text-orange-400 font-bold">{dailyHours}h</span></label>
                  <input type="range" min={1} max={8} value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value))}
                    className="w-full accent-orange-500" />
                  <div className="flex justify-between text-[11px] text-zinc-600 mt-1">
                    <span>1h</span><span>4h</span><span>8h</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Skills */}
            {wizStep === 3 && (
              <motion.div key="skills" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-xs font-medium text-orange-400 uppercase tracking-wider mb-1">Step 4 of 4</p>
                <h2 className="text-lg font-bold text-zinc-100 mb-1">Current Skills</h2>
                <p className="text-sm text-zinc-500 mb-5">Select skills you already know (so AI can skip basics)</p>
                <div className="flex flex-wrap gap-2">
                  {currentSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill)
                    return (
                      <button key={skill} onClick={() => toggleSkill(skill)}
                        className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all border ${
                          isSelected
                            ? 'bg-orange-500/12 text-orange-400 border-orange-500/25'
                            : 'text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                        }`}>
                        {isSelected && <Check className="w-3.5 h-3.5 inline mr-1.5" />}
                        {skill}
                      </button>
                    )
                  })}
                </div>
                {currentSkills.length === 0 && (
                  <p className="text-sm text-zinc-600 text-center py-4">Select a track first to see relevant skills</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => wizStep > 0 ? setWizStep(wizStep - 1) : setShowWizard(false)}
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              {wizStep === 0 ? 'Cancel' : 'Back'}
            </button>

            {wizStep < 3 ? (
              <button
                onClick={() => setWizStep(wizStep + 1)}
                disabled={wizStep === 0 && !selectedTrack}
                className="btn btn-primary btn-sm"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleGenerate} disabled={loading}
                className="btn btn-primary btn-sm">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Roadmap
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Main Roadmap View ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Your Roadmap</h1>
          <p className="text-sm text-zinc-500 mt-1">Personalized learning path generated by AI</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={resetWizard} className="btn btn-secondary btn-sm">
            <Sparkles className="w-4 h-4" /> New Roadmap
          </button>
          <button
            onClick={() => setView(view === 'list' ? 'grid' : 'list')}
            className="btn btn-secondary btn-sm btn-icon"
            title="Toggle view"
          >
            {view === 'list' ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Tasks', value: tasks.length, color: 'text-orange-400' },
          { label: 'Completed', value: completedTasks, color: 'text-emerald-400' },
          { label: 'Progress', value: `${progress}%`, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-zinc-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500">Overall Progress</span>
            <span className="text-xs font-semibold text-zinc-300">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-orange-500 to-orange-500 rounded-full"
            />
          </div>
        </div>
      )}

      {/* Filter */}
      {tasks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Filter className="w-4 h-4 text-zinc-600 flex-shrink-0" />
          {taskTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                filter === type
                  ? 'bg-orange-500/12 text-orange-400 border border-orange-500/25'
                  : 'text-zinc-500 hover:text-zinc-300 border border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {type === 'all' ? 'All' : type}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <p className="text-sm text-zinc-500">Generating your personalized roadmap with AI...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="card p-8 text-center">
          <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-zinc-300 mb-3">{error}</p>
          <button onClick={resetWizard} className="btn btn-primary btn-sm">
            <Sparkles className="w-4 h-4" /> Setup Roadmap
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && tasks.length === 0 && !showWizard && (
        <div className="card p-10 text-center">
          <Route className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500 mb-3">No tasks yet. Generate a personalized roadmap.</p>
          <button onClick={resetWizard} className="btn btn-primary btn-sm">
            <Sparkles className="w-4 h-4" /> Create Roadmap
          </button>
        </div>
      )}

      {/* Tasks */}
      {!loading && filteredTasks.length > 0 && (
        <div className={view === 'grid' ? 'grid sm:grid-cols-2 gap-3' : 'space-y-2'}>
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={`card p-4 transition-all ${
                task.completed ? 'border-emerald-500/15 opacity-70' : 'hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTask(task._id, !task.completed)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-700 hover:text-orange-400 transition-colors" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className={`text-sm font-medium ${task.completed ? 'text-zinc-600 line-through' : 'text-zinc-200'}`}>
                      {task.title}
                    </h3>
                    <span className={`badge text-[11px] ${typeColors[task.taskType || task.type] || 'badge-neutral'}`}>
                      {task.taskType || task.type}
                    </span>
                    {task.difficulty && (
                      <span className={`badge text-[11px] ${
                        task.difficulty === 'easy' ? 'badge-success' :
                        task.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {task.difficulty}
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-xs text-zinc-600 line-clamp-2">{task.description}</p>
                  )}
                  {task.platformLink && (
                    <a
                      href={task.platformLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-400 hover:text-orange-300 mt-1 inline-block"
                    >
                      Open on {task.platform || 'Platform'} →
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-400/70 flex-shrink-0">
                  <Trophy className="w-3 h-3" />
                  +{task.points || 10}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
