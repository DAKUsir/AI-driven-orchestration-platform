import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { token, user, loading, loadUser } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    if (token && !user && !loading) {
      loadUser()
    }
  }, [token, user, loading, loadUser])

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />
  if (loading && !user) return <LoadingSpinner />
  if (!user) return <LoadingSpinner />

  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
