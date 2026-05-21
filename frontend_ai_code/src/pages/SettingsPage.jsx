import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Mail, Bell, Shield, Save, Loader2, AlertTriangle, GraduationCap, Building2 } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api from '../utils/api'

const yearOptions = [
  { value: '', label: 'Select Year' },
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
]

const departmentOptions = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Biotechnology',
  'Mathematics',
  'Physics',
  'Other',
]

export default function SettingsPage() {
  const { user, loadUser } = useAuthStore()
  const [name, setName] = useState('')
  const [year, setYear] = useState('')
  const [department, setDepartment] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    tasks: true,
    leaderboard: true,
  })

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setYear(user.year || '')
      setDepartment(user.department || '')
    }
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/users/profile', {
        name,
        year: year ? Number(year) : undefined,
        department: department || undefined,
      })
      await loadUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {} finally {
      setSaving(false)
    }
  }

  const toggleNotif = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Profile</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              id="settings-name"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Email</label>
            <div className="flex items-center gap-2 w-full rounded-lg px-3.5 py-2.5 text-sm text-zinc-500 border border-zinc-800 bg-zinc-900/50">
              <Mail className="w-4 h-4" />
              {user?.email || 'N/A'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Academic Details */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap className="w-4 h-4 text-orange-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Academic Details</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="input"
              id="settings-year"
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-400 mb-1.5 block">Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="input"
              id="settings-department"
            >
              <option value="">Select Department</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Notifications</h2>
        </div>

        <div className="space-y-4">
          {[
            { key: 'email', label: 'Email Notifications', desc: 'Receive updates via email' },
            { key: 'tasks', label: 'Task Reminders', desc: 'Get reminded about pending tasks' },
            { key: 'leaderboard', label: 'Leaderboard Updates', desc: 'When someone passes you' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-300">{label}</p>
                <p className="text-xs text-zinc-600">{desc}</p>
              </div>
              <button
                onClick={() => toggleNotif(key)}
                className={`toggle ${notifications[key] ? 'active' : ''}`}
                id={`toggle-${key}`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Account */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card p-6"
      >
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Account</h2>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div>
              <p className="text-sm text-zinc-300">Member Since</p>
              <p className="text-xs text-zinc-600">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <div>
              <p className="text-sm text-zinc-300">Total Points</p>
              <p className="text-xs font-semibold text-amber-400">{user?.points || 0} pts</p>
            </div>
          </div>
          {(user?.year || user?.department) && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50 border border-zinc-800">
              <div>
                <p className="text-sm text-zinc-300">Academic Info</p>
                <p className="text-xs text-zinc-600">
                  {user.year ? `Year ${user.year}` : ''}{user.year && user.department ? ' · ' : ''}{user.department || ''}
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 border-red-500/10"
      >
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-sm font-semibold text-zinc-100">Danger Zone</h2>
        </div>
        <p className="text-xs text-zinc-500 mb-3">Once you delete your account, there is no going back.</p>
        <button className="btn btn-danger btn-sm">Delete Account</button>
      </motion.div>

      {/* Save */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary w-full"
        id="save-settings"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : saved ? (
          <><Save className="w-4 h-4" /> Saved!</>
        ) : (
          <><Save className="w-4 h-4" /> Save Changes</>
        )}
      </motion.button>
    </div>
  )
}
