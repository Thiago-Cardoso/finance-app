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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Only access localStorage in the browser
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
        // TODO: Validate token and get user data
        // For now, we just set the token
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log('[AuthContext] Attempting login...', { email, API_BASE_URL })

      const response = await fetch(`${API_BASE_URL}/auth/sign_in`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            email,
            password,
          },
        }),
      })

      console.log('[AuthContext] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }))
        console.error('[AuthContext] Login error response:', errorData)
        throw new Error(errorData.message || 'Email ou senha inválidos')
      }

      const result = await response.json()
      console.log('[AuthContext] Login successful:', { user: result.data?.user })

      const accessToken = result.data.access_token

      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser(result.data.user || null)
    } catch (error) {
      console.error('[AuthContext] Login error:', error)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/sign_up`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: userData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Erro ao criar conta')
      }

      const result = await response.json()
      const accessToken = result.data.access_token

      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser(result.data.user || null)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
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
