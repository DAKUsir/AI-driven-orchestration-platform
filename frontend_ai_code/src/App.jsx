import { Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import Dashboard from './pages/Dashboard'
import TaskPlannerPage from './pages/TaskPlannerPage'
import CalendarPage from './pages/CalendarPage'
import CompetitionsPage from './pages/CompetitionsPage'
import DSASheetsPage from './pages/DSASheetsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import SettingsPage from './pages/SettingsPage'
import IntegrationsPage from './pages/IntegrationsPage'
import GroupChatPage from './pages/GroupChatPage'
import CourseTrackerPage from './pages/CourseTrackerPage'
import CareerPage from './pages/CareerPage'
import CodeEditorPage from './pages/CodeEditorPage'
import YoutubeDashboard from './pages/YoutubeDashboard'
import YoutubeCoursePage from './pages/YoutubeCoursePage'
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
        <Route path="/planner" element={<TaskPlannerPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/competitions" element={<CompetitionsPage />} />
        <Route path="/dsa-sheets" element={<DSASheetsPage />} />
        <Route path="/groups" element={<GroupChatPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/courses" element={<CourseTrackerPage />} />
        <Route path="/career" element={<CareerPage />} />
        <Route path="/editor" element={<CodeEditorPage />} />
        <Route path="/youtube" element={<YoutubeDashboard />} />
        <Route path="/youtube/:id" element={<YoutubeCoursePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
