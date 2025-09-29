export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
}

export interface RegisterData {
  email: string
  password: string
  password_confirmation: string
  first_name: string
  last_name: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    user: User
    token: string
  }
  message?: string
}
