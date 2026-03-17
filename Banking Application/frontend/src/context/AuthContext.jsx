import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    // Simple authentication (in production, this should be server-side)
    const users = {
      admin: { username: 'admin', password: 'admin123', role: 'ADMIN', fullName: 'System Administrator' },
      analyst1: { username: 'analyst1', password: 'analyst123', role: 'ANALYST', fullName: 'John Analyst' },
      analyst2: { username: 'analyst2', password: 'analyst123', role: 'ANALYST', fullName: 'Sarah Analyst' }
    }

    const foundUser = users[username]
    if (foundUser && foundUser.password === password) {
      const userData = {
        username: foundUser.username,
        role: foundUser.role,
        fullName: foundUser.fullName
      }
      setUser(userData)
      localStorage.setItem('currentUser', JSON.stringify(userData))
      return { success: true }
    }
    return { success: false, error: 'Invalid credentials' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('currentUser')
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
