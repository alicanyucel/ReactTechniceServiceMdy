import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

const TOKEN_KEY = 'authToken'

const RequireAuth: React.FC = () => {
  const location = useLocation()
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default RequireAuth
