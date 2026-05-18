import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import Dashboard from './pages/Dashboard'
import RoadmapPage from './pages/RoadmapPage'
import KanbanPage from './pages/KanbanPage'
import MentorPage from './pages/MentorPage'
import CareerPage from './pages/CareerPage'
import AnalyticsPage from './pages/AnalyticsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import InterviewPage from './pages/InterviewPage'
import CodeEditorPage from './pages/CodeEditorPage'
import SettingsPage from './pages/SettingsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import DashboardLayout from './components/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/kanban" element={<KanbanPage />} />
        <Route path="/mentor" element={<MentorPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/editor" element={<CodeEditorPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
