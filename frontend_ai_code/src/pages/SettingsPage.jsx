import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, User, Mail, Bell, Shield, Save, Loader2, AlertTriangle } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import api from '../utils/api'

export default function SettingsPage() {
  const { user, loadUser } = useAuthStore()
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    tasks: true,
    leaderboard: true,
  })

  useEffect(() => {
    if (user) setName(user.name || '')
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('/users/profile', { name })
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
          <User className="w-4 h-4 text-indigo-400" />
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

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
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
        transition={{ delay: 0.1 }}
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
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
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
        transition={{ delay: 0.2 }}
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
