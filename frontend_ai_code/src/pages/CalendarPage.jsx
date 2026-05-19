import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Loader2, Clock, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useTaskStore from '../store/useTaskStore'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const categoryColors = {
  youtube: 'bg-red-500/20 border-red-500/30 text-red-300',
  coursera: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  github: 'bg-zinc-500/20 border-zinc-500/30 text-zinc-300',
  leetcode: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  gfg: 'bg-green-500/20 border-green-500/30 text-green-300',
  kaggle: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-300',
  'interview-prep': 'bg-violet-500/20 border-violet-500/30 text-violet-300',
  other: 'bg-zinc-600/20 border-zinc-600/30 text-zinc-400',
}

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTaskStore()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState('month') // month | week

  useEffect(() => { fetchTasks() }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDow = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const days = []

    // Previous month padding
    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, -startDow + i + 1)
      days.push({ date: d, isCurrentMonth: false })
    }
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    // Next month padding
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    return days
  }, [year, month])

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter((t) => {
      if (!t.dueDate) return false
      return new Date(t.dueDate).toISOString().split('T')[0] === dateStr
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday = () => setCurrentDate(new Date())

  // Calculate total estimated time for each day
  const getDayLoad = (date) => {
    const dayTasks = getTasksForDate(date)
    return dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Calendar</h1>
          <p className="text-sm text-zinc-500 mt-1">Visualize your tasks across the month</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="btn btn-secondary btn-sm">Today</button>
          <button onClick={() => navigate('/planner')} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="btn btn-ghost btn-icon"><ChevronLeft className="w-5 h-5" /></button>
        <h2 className="text-lg font-semibold text-zinc-100">{MONTH_NAMES[month]} {year}</h2>
        <button onClick={nextMonth} className="btn btn-ghost btn-icon"><ChevronRight className="w-5 h-5" /></button>
      </div>

      {/* Calendar grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-zinc-800">
          {DAY_NAMES.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            const dayTasks = getTasksForDate(date)
            const totalMin = getDayLoad(date)
            const isOverloaded = totalMin > 240 // > 4 hours
            const today = isToday(date)

            return (
              <div
                key={i}
                className={`min-h-[100px] lg:min-h-[120px] p-1.5 border-b border-r border-zinc-800/50 transition-colors ${
                  !isCurrentMonth ? 'opacity-30' : ''
                } ${today ? 'bg-indigo-500/5' : 'hover:bg-zinc-800/20'}`}
              >
                <div className="flex items-center justify-between mb-1 px-1">
                  <span className={`text-xs font-medium ${
                    today ? 'text-indigo-400 bg-indigo-500/15 w-6 h-6 rounded-full flex items-center justify-center' : 'text-zinc-500'
                  }`}>
                    {date.getDate()}
                  </span>
                  {isOverloaded && isCurrentMonth && (
                    <span className="text-[9px] text-amber-400" title="Day is overloaded">⚠️</span>
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task._id}
                      className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${
                        categoryColors[task.category] || categoryColors.other
                      } ${task.status === 'done' ? 'line-through opacity-50' : ''}`}
                      title={`${task.title} (${task.estimatedMinutes || 30}min)`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] text-zinc-600 px-1">+{dayTasks.length - 3} more</span>
                  )}
                </div>
                {totalMin > 0 && isCurrentMonth && (
                  <div className="flex items-center gap-0.5 mt-1 px-1">
                    <Clock className="w-2.5 h-2.5 text-zinc-600" />
                    <span className={`text-[9px] ${isOverloaded ? 'text-amber-400' : 'text-zinc-600'}`}>
                      {Math.round(totalMin / 60)}h
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(categoryColors).map(([cat, cls]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${cls.split(' ')[0]}`} />
            <span className="text-[11px] text-zinc-500 capitalize">{cat.replace('-', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
