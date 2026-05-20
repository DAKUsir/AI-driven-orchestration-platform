import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/useAuthStore'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { token, user, loading, authAttempted, loadUser } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Only attempt once — authAttempted prevents infinite retry loop
    if (token && !user && !loading && !authAttempted) {
      loadUser()
    }
  }, [token, user, loading, authAttempted])

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />

  // Still loading the user
  if (loading) return <LoadingSpinner />

  // loadUser ran but failed with network error — show retry instead of infinite spinner
  if (!user && authAttempted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-base)' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Could not connect to server. Please try again.</p>
        <button
          className="btn btn-primary"
          onClick={() => {
            useAuthStore.setState({ authAttempted: false })
            loadUser()
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  // Still waiting for first attempt
  if (!user) return <LoadingSpinner />

  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
