'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, RegisterData } from '@/types/auth'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    if (storedToken) {
      setToken(storedToken)
      // TODO: Validate token and get user data - will be implemented in Task 6.0
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    // TODO: Implementation will be added in Task 6.0
    // Placeholder for login logic
    void email
    void password
  }

  const register = async (userData: RegisterData) => {
    // TODO: Implementation will be added in Task 6.0
    // Placeholder for register logic
    void userData
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
