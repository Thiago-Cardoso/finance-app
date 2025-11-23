/**
 * Schema: Transaction
 *
 * Validações Zod para transações.
 */

import { z } from 'zod';

export const transactionTypeEnum = z.enum(['income', 'expense', 'transfer']);

export const transactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(255, 'Descrição deve ter no máximo 255 caracteres'),
  amount: z.number().min(1, 'Valor deve ser maior que zero'),
  transaction_type: transactionTypeEnum,
  date: z.string().min(1, 'Data é obrigatória'),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional().nullable(),
  category_id: z.union([z.string(), z.number()]).optional().nullable(),
  account_id: z.union([z.string(), z.number()]).optional().nullable(),
  transfer_account_id: z.union([z.string(), z.number()]).optional().nullable(),
}).refine(
  (data) => {
    // Transfer must have transfer_account_id
    if (data.transaction_type === 'transfer') {
      return !!data.transfer_account_id;
    }
    return true;
  },
  {
    message: 'Transferência requer conta de destino',
    path: ['transfer_account_id'],
  }
).refine(
  (data) => {
    // Transfer accounts must be different
    if (data.transaction_type === 'transfer' && data.account_id && data.transfer_account_id) {
      return data.account_id !== data.transfer_account_id;
    }
    return true;
  },
  {
    message: 'Conta de origem e destino devem ser diferentes',
    path: ['transfer_account_id'],
  }
);

export const createTransactionSchema = transactionSchema;

export const updateTransactionSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(255, 'Descrição deve ter no máximo 255 caracteres')
    .optional(),
  amount: z.number().min(1, 'Valor deve ser maior que zero').optional(),
  transaction_type: transactionTypeEnum.optional(),
  date: z.string().optional(),
  notes: z.string().max(500, 'Notas devem ter no máximo 500 caracteres').optional().nullable(),
  category_id: z.union([z.string(), z.number()]).optional().nullable(),
  account_id: z.union([z.string(), z.number()]).optional().nullable(),
  transfer_account_id: z.union([z.string(), z.number()]).optional().nullable(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type CreateTransactionFormData = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionFormData = z.infer<typeof updateTransactionSchema>;
