import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const ROLES = {
  volunteer:  { label: 'Volunteer',  dashboard: '/dashboard/volunteer', profile: '/profile/volunteer' },
  freelancer: { label: 'Freelancer', dashboard: '/dashboard/freelancer', profile: '/profile/freelancer' },
  ngo:        { label: 'NGO Admin',  dashboard: '/dashboard/ngo',        profile: '/profile/ngo' },
  admin:      { label: 'Admin',      dashboard: '/admin',                profile: '/admin' },
}

const SESSION_KEY = 'givtask_session'

const RoleContext = createContext(null)

export function RoleProvider({ children }) {
  // Initialise from localStorage so session survives page refresh
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      return saved ? JSON.parse(saved) : { role: null, userId: null, userName: '', userEmail: '', userSkills: [] }
    } catch {
      return { role: null, userId: null, userName: '', userEmail: '', userSkills: [] }
    }
  })

  const { role, userId, userName, userEmail, userSkills } = session

  const login = useCallback((roleKey, name = '', email = '', id = null, skills = []) => {
    if (!ROLES[roleKey]) return
    const newSession = {
      role:       roleKey,
      userId:     id,
      userName:   name  || ROLES[roleKey].label + ' User',
      userEmail:  email || roleKey + '@demo.com',
      userSkills: Array.isArray(skills) ? skills : [],
    }
    setSession(newSession)
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
  }, [])

  const updateSkills = useCallback((skills = []) => {
    setSession(prev => {
      const updated = { ...prev, userSkills: Array.isArray(skills) ? skills : [] }
      localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const logout = useCallback(() => {
    setSession({ role: null, userId: null, userName: '', userEmail: '', userSkills: [] })
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const roleInfo = role ? ROLES[role] : null
  const isAuthenticated = !!role

  return (
    <RoleContext.Provider value={{
      role, roleInfo, userId, userName, userEmail, userSkills,
      isAuthenticated, login, logout, updateSkills, ROLES,
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const ctx = useContext(RoleContext)
  if (!ctx) throw new Error('useRole must be used within RoleProvider')
  return ctx
}

export { ROLES }
