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
        const errorData = await response.json().catch(() => ({ message: 'Erro de conexão' }))

        // Extrair mensagem de erro específica
        let errorMessage = 'Usuário ou senha inválidos'

        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map((err: any) => err.message || err).join(', ')
        }

        throw new Error(errorMessage)
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
        const errorData = await response.json().catch(() => ({ message: 'Erro de conexão' }))

        // Extrair mensagem de erro específica
        let errorMessage = 'Erro ao criar conta'

        if (errorData.message) {
          errorMessage = errorData.message
        }

        // Se houver erros específicos de campos, mostrar detalhes
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          const fieldErrors = errorData.errors.map((err: any) => {
            if (err.field && err.message) {
              const fieldName = err.field === 'email' ? 'Email' :
                               err.field === 'password' ? 'Senha' :
                               err.field === 'first_name' ? 'Nome' :
                               err.field === 'last_name' ? 'Sobrenome' : err.field

              let message = err.message
              if (message === 'has already been taken') {
                message = 'já está em uso'
              } else if (message === 'is too short') {
                message = 'é muito curto'
              } else if (message === 'is invalid') {
                message = 'é inválido'
              } else if (message === 'can\'t be blank') {
                message = 'não pode ficar em branco'
              }

              return `${fieldName} ${message}`
            }
            return err.message || err
          })
          errorMessage = fieldErrors.join('. ')
        }

        throw new Error(errorMessage)
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
