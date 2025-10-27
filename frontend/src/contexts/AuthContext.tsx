'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, RegisterData } from '@/types/auth'
import { parseApiError } from '@/lib/errorUtils'
import { useLocale } from '@/contexts/LocaleContext'
import toast from 'react-hot-toast'

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
  const { t } = useLocale()

  useEffect(() => {
    // Only access localStorage in the browser
    const initAuth = async () => {
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('token')
        if (storedToken) {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/validate`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${storedToken}`,
                'Content-Type': 'application/json',
              },
            })

            if (response.ok) {
              const result = await response.json()
              setToken(storedToken)
              setUser(result.data.user || null)
            } else {
              console.log('Token inválido ou expirado. Fazendo logout...')
              localStorage.removeItem('token')
              setToken(null)
              setUser(null)
              if (!window.location.pathname.startsWith('/auth/')) {
                toast.error('Sua sessão expirou. Por favor, faça login novamente.')
                setTimeout(() => {
                  window.location.href = '/auth/login'
                }, 1000)
              }
            }
          } catch (error) {
            console.error('Error validating token:', error)
            localStorage.removeItem('token')
            setToken(null)
            setUser(null)
            if (!window.location.pathname.startsWith('/auth/')) {
              toast.error('Sua sessão expirou. Por favor, faça login novamente.')
              setTimeout(() => {
                window.location.href = '/auth/login'
              }, 1000)
            }
          }
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: t('errors.network') }))
        throw new Error(parseApiError(errorData, t) || t('auth.login.error'))
      }      const result = await response.json()

      const accessToken = result.data.access_token

      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser(result.data.user || null)
    } catch (error) {
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
        const errorData = await response.json().catch(() => ({ message: t('errors.network') }))
        throw new Error(parseApiError(errorData, t) || t('auth.register.error'))
      }

      const result = await response.json()
      const accessToken = result.data.access_token

      localStorage.setItem('token', accessToken)
      setToken(accessToken)
      setUser(result.data.user || null)
    } catch (error) {
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
