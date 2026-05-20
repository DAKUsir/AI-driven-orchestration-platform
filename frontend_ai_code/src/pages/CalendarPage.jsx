import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Clock, Plus, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useTaskStore from '../store/useTaskStore'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const categoryColors = {
  youtube:       { bg: 'rgba(239,68,68,0.15)',   text: '#f87171',  border: 'rgba(239,68,68,0.3)' },
  coursera:      { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa',  border: 'rgba(59,130,246,0.3)' },
  github:        { bg: 'rgba(113,113,122,0.15)', text: '#a1a1aa',  border: 'rgba(113,113,122,0.3)' },
  leetcode:      { bg: 'rgba(245,158,11,0.15)',  text: '#fbbf24',  border: 'rgba(245,158,11,0.3)' },
  gfg:           { bg: 'rgba(34,197,94,0.15)',   text: '#4ade80',  border: 'rgba(34,197,94,0.3)' },
  kaggle:        { bg: 'rgba(6,182,212,0.15)',   text: '#22d3ee',  border: 'rgba(6,182,212,0.3)' },
  'interview-prep': { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  other:         { bg: 'rgba(113,113,122,0.1)',  text: '#a1a1aa',  border: 'rgba(113,113,122,0.2)' },
}

export default function CalendarPage() {
  const { tasks, fetchTasks } = useTaskStore()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => { fetchTasks() }, [])

  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const calendarDays = useMemo(() => {
    const firstDay    = new Date(year, month, 1)
    const lastDay     = new Date(year, month + 1, 0)
    const startDow    = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
    const days        = []

    for (let i = 0; i < startDow; i++) {
      days.push({ date: new Date(year, month, -startDow + i + 1), isCurrentMonth: false })
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true })
    }
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false })
    }
    return days
  }, [year, month])

  const getTasksForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(t => {
      if (!t.dueDate) return false
      return new Date(t.dueDate).toISOString().split('T')[0] === dateStr
    })
  }

  const isToday = (date) => {
    const today = new Date()
    return (
      date.getDate()     === today.getDate()     &&
      date.getMonth()    === today.getMonth()    &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToday   = () => setCurrentDate(new Date())

  const scheduledIds   = new Set(tasks.filter(t => t.dueDate).map(t => t._id))
  const unscheduled    = tasks.filter(t => !t.dueDate && t.status !== 'done' && t.status !== 'skipped')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Calendar
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Visualize your tasks across the month
          </p>
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
        <button onClick={prevMonth} className="btn btn-ghost btn-icon">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          {MONTH_NAMES[month]} {year}
        </h2>
        <button onClick={nextMonth} className="btn btn-ghost btn-icon">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="card overflow-hidden"
      >
        {/* Day headers */}
        <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
          {DAY_NAMES.map(d => (
            <div
              key={d}
              className="py-3 text-center text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-muted)' }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            const dayTasks    = getTasksForDate(date)
            const totalMin    = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0)
            const isOverloaded = totalMin > 240
            const today       = isToday(date)

            return (
              <div
                key={i}
                className="min-h-[100px] lg:min-h-[110px] p-1.5 transition-colors"
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  borderRight:  '1px solid var(--border-subtle)',
                  opacity:       isCurrentMonth ? 1 : 0.3,
                  background:    today ? 'var(--accent-muted)' : 'transparent',
                  cursor:        'default',
                }}
              >
                <div className="flex items-center justify-between mb-1 px-0.5">
                  <span
                    className="text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full"
                    style={{
                      color:      today ? '#fff' : 'var(--text-secondary)',
                      background: today ? 'var(--accent)' : 'transparent',
                      fontWeight: today ? 700 : 500,
                    }}
                  >
                    {date.getDate()}
                  </span>
                  {isOverloaded && isCurrentMonth && (
                    <span title="Overloaded day" style={{ fontSize: 10, color: '#fbbf24' }}>⚠</span>
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  {dayTasks.slice(0, 3).map(task => {
                    const c = categoryColors[task.category] || categoryColors.other
                    return (
                      <div
                        key={task._id}
                        className="text-[10px] px-1.5 py-0.5 rounded truncate"
                        title={`${task.title} (${task.estimatedMinutes || 30}min)`}
                        style={{
                          background:    c.bg,
                          color:         c.text,
                          border:        `1px solid ${c.border}`,
                          textDecoration: task.status === 'done' ? 'line-through' : 'none',
                          opacity:        task.status === 'done' ? 0.5 : 1,
                        }}
                      >
                        {task.title}
                      </div>
                    )
                  })}
                  {dayTasks.length > 3 && (
                    <span className="text-[10px] px-1" style={{ color: 'var(--text-faint)' }}>
                      +{dayTasks.length - 3} more
                    </span>
                  )}
                </div>
                {totalMin > 0 && isCurrentMonth && (
                  <div className="flex items-center gap-0.5 mt-1 px-0.5">
                    <Clock className="w-2.5 h-2.5" style={{ color: isOverloaded ? '#fbbf24' : 'var(--text-faint)' }} />
                    <span
                      className="text-[9px]"
                      style={{ color: isOverloaded ? '#fbbf24' : 'var(--text-faint)' }}
                    >
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
        {Object.entries(categoryColors).map(([cat, c]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: c.bg, border: `1px solid ${c.border}` }}
            />
            <span className="text-[11px] capitalize" style={{ color: 'var(--text-muted)' }}>
              {cat.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Unscheduled tasks */}
      {unscheduled.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4" style={{ color: '#fbbf24' }} />
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              Unscheduled Tasks
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded-full ml-auto"
              style={{ background: 'var(--warning-muted)', color: '#fbbf24' }}
            >
              {unscheduled.length}
            </span>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            These tasks don't have a due date — set one in the Task Planner to see them on the calendar.
          </p>
          <div className="flex flex-wrap gap-2">
            {unscheduled.slice(0, 10).map(task => {
              const c = categoryColors[task.category] || categoryColors.other
              return (
                <div
                  key={task._id}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
                >
                  {task.title}
                </div>
              )
            })}
            {unscheduled.length > 10 && (
              <button
                onClick={() => navigate('/planner')}
                className="text-xs px-2.5 py-1 rounded-lg transition-colors"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
              >
                +{unscheduled.length - 10} more → Go to Planner
              </button>
            )}
          </div>
        </motion.div>
      )}

      {tasks.length === 0 && (
        <div className="text-center py-16">
          <Calendar className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-faint)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No tasks yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>
            Add tasks in the planner with a due date to see them here
          </p>
          <button onClick={() => navigate('/planner')} className="btn btn-primary btn-sm">
            <Plus className="w-4 h-4" /> Go to Task Planner
          </button>
        </div>
      )}
    </div>
  )
}
