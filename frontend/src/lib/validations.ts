import { z } from 'zod'

// Type for translation function
type TranslateFn = (key: string, params?: Record<string, string | number>) => string

// ====================
// Base Schemas Factories
// ====================

export const createRequiredStringSchema = (t: TranslateFn) =>
  z.string().min(1, t('validation.required'))

export const createEmailSchema = (t: TranslateFn) =>
  z.string().email(t('validation.email'))

export const createPasswordSchema = (t: TranslateFn) =>
  z.string().min(6, t('validation.minLength', { min: '6' }))

// ====================
// Financial Schemas Factories
// ====================

export const createAmountSchema = (t: TranslateFn) =>
  z
    .number({ invalid_type_error: t('validation.invalidNumber') })
    .positive(t('validation.positiveNumber'))
    .max(999999.99, t('validation.maxAmount', { max: '999999.99' }))

export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string()
})

// ====================
// Transaction Schemas Factories
// ====================

export const createTransactionFormSchema = (t: TranslateFn) =>
  z.object({
    description: z
      .string()
      .min(3, t('validation.minLength', { min: '3' }))
      .max(100, t('validation.maxLength', { max: '100' })),
    amount: z.string()
      .min(1, t('validation.required'))
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: t('validation.positiveNumber')
      }),
    transaction_type: z.enum(['income', 'expense', 'transfer'], {
      required_error: t('validation.required')
    }),
    category_id: z.string().optional(),
    account_id: z.string().optional(),
    transfer_account_id: z.string().optional(),
    date: z.string().min(1, t('validation.required')),
    notes: z.string().max(500, t('validation.maxLength', { max: '500' })).optional()
  }).refine((data) => {
    if (data.transaction_type === 'transfer') {
      return !!data.transfer_account_id
    }
    return true
  }, {
    message: t('validation.transferAccountRequired'),
    path: ['transfer_account_id']
  })

export type TransactionFormData = z.infer<ReturnType<typeof createTransactionFormSchema>>

// Legacy schema for backward compatibility
export const createTransactionSchema = (t: TranslateFn) =>
  z.object({
    description: z.string().min(3, t('validation.minLength', { min: '3' })),
    amount: z.number().positive(t('validation.positiveNumber')),
    transaction_type: z.enum(['income', 'expense', 'transfer']),
    date: z.string().or(z.date()),
    category_id: z.number().optional(),
    account_id: z.number().optional(),
    notes: z.string().optional(),
  })

// ====================
// Category Schemas Factories
// ====================

export const createCategoryFormSchema = (t: TranslateFn) =>
  z.object({
    name: z
      .string()
      .min(2, t('validation.minLength', { min: '2' }))
      .max(50, t('validation.maxLength', { max: '50' })),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, t('categories.validation.invalidColor')),
    description: z.string().max(200, t('validation.maxLength', { max: '200' })).optional()
  })

export type CategoryFormData = z.infer<ReturnType<typeof createCategoryFormSchema>>

// ====================
// Auth Schemas Factories
// ====================

export const createLoginFormSchema = (t: TranslateFn) =>
  z.object({
    email: createEmailSchema(t),
    password: createRequiredStringSchema(t)
  })

export const createRegisterFormSchema = (t: TranslateFn) =>
  z.object({
    first_name: z
      .string()
      .min(2, t('validation.minLength', { min: '2' }))
      .max(50, t('validation.maxLength', { max: '50' })),
    last_name: z
      .string()
      .min(2, t('validation.minLength', { min: '2' }))
      .max(50, t('validation.maxLength', { max: '50' })),
    email: createEmailSchema(t),
    password: createPasswordSchema(t),
    password_confirmation: createPasswordSchema(t)
  }).refine((data) => data.password === data.password_confirmation, {
    message: t('validation.passwordMatch'),
    path: ['password_confirmation']
  })

export type LoginFormData = z.infer<ReturnType<typeof createLoginFormSchema>>
export type RegisterFormData = z.infer<ReturnType<typeof createRegisterFormSchema>>

// Legacy schemas for backward compatibility
export const createLoginSchema = createLoginFormSchema
export const createRegisterSchema = createRegisterFormSchema

// ====================
// Filter Schemas Factories
// ====================

export const createTransactionFilterSchema = (t: TranslateFn) =>
  z.object({
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
    message: t('validation.startDateBeforeEndDate'),
    path: ['end_date']
  }).refine((data) => {
    if (data.min_amount && data.max_amount) {
      return data.min_amount <= data.max_amount
    }
    return true
  }, {
    message: t('validation.minAmountLessThanMax'),
    path: ['max_amount']
  })

export type TransactionFilterData = z.infer<ReturnType<typeof createTransactionFilterSchema>>

// ====================
// Shared Patterns
// ====================

export const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

// ====================
// Static Schemas (backward compatibility)
// ====================

// These are kept for backward compatibility but use default English messages
// New code should use the factory functions above
export const requiredStringSchema = z.string().min(1, 'Required field')
export const emailSchema = z.string().email('Invalid email')
export const passwordSchema = z.string().min(6, 'Password must be at least 6 characters')

export const amountSchema = z
  .number({ invalid_type_error: 'Value must be a number' })
  .positive('Value must be positive')
  .max(999999.99, 'Maximum value is 999,999.99')

export const transactionFormSchema = z.object({
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(100, 'Description cannot be more than 100 characters'),
  amount: z.string()
    .min(1, 'Amount is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be a positive number'
    }),
  transaction_type: z.enum(['income', 'expense', 'transfer'], {
    required_error: 'Transaction type is required'
  }),
  category_id: z.string().optional(),
  account_id: z.string().optional(),
  transfer_account_id: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500, 'Notes cannot be more than 500 characters').optional()
}).refine((data) => {
  if (data.transaction_type === 'transfer') {
    return !!data.transfer_account_id
  }
  return true
}, {
  message: 'Transfer account is required for transfers',
  path: ['transfer_account_id']
})

export const transactionSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.number().positive('Amount must be positive'),
  transaction_type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().or(z.date()),
  category_id: z.number().optional(),
  account_id: z.number().optional(),
  notes: z.string().optional(),
})

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot be more than 50 characters'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Color must be in hexadecimal format'),
  description: z.string().max(200, 'Description cannot be more than 200 characters').optional()
})

export const loginFormSchema = z.object({
  email: emailSchema,
  password: requiredStringSchema
})

export const registerFormSchema = z.object({
  first_name: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot be more than 50 characters'),
  last_name: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot be more than 50 characters'),
  email: emailSchema,
  password: passwordSchema,
  password_confirmation: passwordSchema
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation']
})

export const loginSchema = loginFormSchema
export const registerSchema = registerFormSchema

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
  message: 'Start date must be before end date',
  path: ['end_date']
}).refine((data) => {
  if (data.min_amount && data.max_amount) {
    return data.min_amount <= data.max_amount
  }
  return true
}, {
  message: 'Minimum amount must be less than maximum amount',
  path: ['max_amount']
})

// ====================
// Legacy Type Exports
// ====================

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
