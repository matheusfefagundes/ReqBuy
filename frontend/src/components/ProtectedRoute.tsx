import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import LoadingSpinner from './ui/LoadingSpinner'
import AccessDeniedPage from '../pages/AccessDeniedPage'

interface Props {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner />

  if (!user) return <Navigate to="/login" replace />

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDeniedPage />
  }

  return <>{children}</>
}

