import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/types/auth.types'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { AlertCircle, LogOut } from 'lucide-react'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children?: React.ReactNode
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, loading, role, isDisabled, logout } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="w-full max-w-md space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (isDisabled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)]">
        <div className="w-full max-w-md p-6 bg-[var(--card-bg)] rounded-xl border border-[var(--border)] text-center space-y-4 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text)]">Account Deactivated</h2>
          <p className="text-sm text-[var(--text-2)]">
            Your account has been disabled by an administrator. Please contact support.
          </p>
          <Button onClick={logout} variant="outline" className="w-full justify-center gap-2">
            <LogOut size={16} /> Sign Out
          </Button>
        </div>
      </div>
    )
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect based on Personal ERP role hierarchy
    const roleRedirects: Record<UserRole, string> = {
      owner: '/',
      admin: '/',
      employee: '/workspace',
      client: '/client',
    }
    const target = roleRedirects[role] || '/'
    return <Navigate to={target} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
