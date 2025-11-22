/**
 * Model: User
 *
 * Define a estrutura de dados do usuário.
 */

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpData {
  email: string;
  password: string;
  password_confirmation: string;
  first_name: string;
  last_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
    refresh_token: string;
  };
  message: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  password_confirmation: string;
}
