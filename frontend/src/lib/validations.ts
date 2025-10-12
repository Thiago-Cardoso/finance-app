import { z } from 'zod'

// ====================
// Base Schemas
// ====================

export const requiredStringSchema = z.string().min(1, 'Campo obrigatório')
export const emailSchema = z.string().email('Email inválido')
export const passwordSchema = z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')

// ====================
// Financial Schemas
// ====================

export const amountSchema = z
  .number({ invalid_type_error: 'Valor deve ser um número' })
  .positive('Valor deve ser positivo')
  .max(999999.99, 'Valor máximo é R$ 999.999,99')

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string()
})

// ====================
// Transaction Schemas
// ====================

export const transactionFormSchema = z.object({
  description: z
    .string()
    .min(3, 'Descrição deve ter pelo menos 3 caracteres')
    .max(100, 'Descrição não pode ter mais de 100 caracteres'),
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Valor deve ser um número positivo'
    }),
  transaction_type: z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Tipo de transação é obrigatório'
  }),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  transfer_account_id: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().max(500, 'Notas não podem ter mais de 500 caracteres').optional()
}).refine((data) => {
  if (data.transaction_type === 'transfer') {
    return !!data.transfer_account_id
  }
  return true
}, {
  message: 'Conta de destino é obrigatória para transferências',
  path: ['transfer_account_id']
})

export type TransactionFormData = z.infer<typeof transactionFormSchema>

// Legacy schema for backward compatibility
export const transactionSchema = z.object({
  description: z.string().min(3, 'Descrição deve ter no mínimo 3 caracteres'),
  amount: z.number().positive('Valor deve ser positivo'),
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().or(z.date()),
  category_id: z.number().optional(),
  account_id: z.number().optional(),
  notes: z.string().optional(),
})

// ====================
// Category Schemas
// ====================

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal'),
  description: z.string().max(200, 'Descrição não pode ter mais de 200 caracteres').optional()
})

export type CategoryFormData = z.infer<typeof categoryFormSchema>

// ====================
// Auth Schemas
// ====================

export const loginFormSchema = z.object({
  email: emailSchema,
  password: requiredStringSchema
})

export const registerFormSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome não pode ter mais de 50 caracteres'),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
    .max(50, 'Sobrenome não pode ter mais de 50 caracteres'),
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: passwordSchema
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Senhas não coincidem',
  path: ['password_confirmation']
})

export type LoginFormData = z.infer<typeof loginFormSchema>
export type RegisterFormData = z.infer<typeof registerFormSchema>

// Legacy schemas for backward compatibility
export const loginSchema = loginFormSchema
export const registerSchema = registerFormSchema

// ====================
// Filter Schemas
// ====================

export const transactionFilterSchema = z.object({
  search: z.string().optional(),
  category_id: z.number().optional(),
  transaction_type: z.enum(['income', 'expense']).optional(),
  date_filter: z.enum(['this_month', 'last_month', 'this_year', 'custom']).optional(),
  start_date: z.date().optional(),
  end_date: z.date().optional(),
  min_amount: z.number().positive().optional(),
  max_amount: z.number().positive().optional()
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return data.start_date <= data.end_date
  }
  return true
}, {
  message: 'Data inicial deve ser anterior à data final',
  path: ['end_date']
}).refine((data) => {
  if (data.min_amount && data.max_amount) {
    return data.min_amount <= data.max_amount
  }
  return true
}, {
  message: 'Valor mínimo deve ser menor que o valor máximo',
  path: ['max_amount']
})

export type TransactionFilterData = z.infer<typeof transactionFilterSchema>

// ====================
// Shared Patterns
// ====================

export const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// ====================
// Legacy Type Exports
// ====================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
