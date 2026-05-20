import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Header from './Header'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const mainRef = useRef(null)

  // Apply saved theme on mount before first paint
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'dark'
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  // Scroll to top on every route change
  useEffect(() => {
    setSidebarOpen(false)
    if (mainRef.current) mainRef.current.scrollTop = 0
  }, [location.pathname])

  return (
    <div className="flex min-h-screen min-h-[100dvh] theme-transition" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main ref={mainRef} className="flex-1 overflow-auto" style={{ background: 'var(--bg-primary)' }}>
          <div className="max-w-[1400px] mx-auto px-4 py-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}
