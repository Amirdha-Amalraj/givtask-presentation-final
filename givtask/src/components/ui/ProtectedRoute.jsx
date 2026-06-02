import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useRole } from '../../context/RoleContext.jsx'

/**
 * Wraps a route to require authentication.
 * If not logged in → redirect to /login (with return path).
 * If logged in but wrong role → redirect to the user's correct dashboard.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, roleInfo } = useRole()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to the user's correct dashboard
    return <Navigate to={roleInfo?.dashboard || '/login'} replace />
  }

  return children
}
