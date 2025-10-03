import { z } from 'zod'

// Authentication validations
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z
  .object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    password_confirmation: z.string(),
    first_name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    last_name: z.string().min(2, 'Sobrenome deve ter no mínimo 2 caracteres'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Senhas não conferem',
    path: ['password_confirmation'],
  })

// Transaction validations
export const transactionSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().or(z.date()),
  category_id: z.number().optional(),
  account_id: z.number().optional(),
  notes: z.string().optional(),
})

// Shared validation patterns
export const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
