/**
 * Budget Schema
 *
 * Validação de orçamentos com Zod.
 */

import { z } from 'zod';

/**
 * Schema para criar/editar orçamento
 */
export const budgetSchema = z.object({
  category_id: z
    .number({ required_error: 'Selecione uma categoria' })
    .positive('Categoria inválida'),

  limit_amount: z
    .number({ required_error: 'Informe o valor limite' })
    .positive('O valor deve ser maior que zero'),

  period_start: z
    .string()
    .optional(),

  period_end: z
    .string()
    .optional(),

  period_type: z
    .enum(['monthly', 'weekly', 'yearly'])
    .default('monthly'),

  alert_threshold: z
    .number()
    .min(0, 'O limite de alerta deve ser entre 0 e 100')
    .max(100, 'O limite de alerta deve ser entre 0 e 100')
    .default(80),

  is_alert_enabled: z
    .boolean()
    .default(true),
});

/**
 * Schema para filtros de orçamentos
 */
export const budgetFiltersSchema = z.object({
  period_start: z.string().optional(),
  period_end: z.string().optional(),
  category_id: z.number().optional(),
  status: z.enum(['on_track', 'warning', 'over_budget', 'critical']).optional(),
  include_expired: z.boolean().optional(),
});

/**
 * Tipos inferidos dos schemas
 */
export type BudgetSchemaType = z.infer<typeof budgetSchema>;
export type BudgetFiltersSchemaType = z.infer<typeof budgetFiltersSchema>;

/**
 * Valores padrão para novo orçamento
 */
export function getDefaultBudgetValues(): BudgetSchemaType {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    category_id: 0,
    limit_amount: 0,
    period_start: firstDay.toISOString().split('T')[0],
    period_end: lastDay.toISOString().split('T')[0],
    period_type: 'monthly',
    alert_threshold: 80,
    is_alert_enabled: true,
  };
}

/**
 * Validação customizada para período
 */
export function validateBudgetPeriod(start: string, end: string): boolean {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return startDate < endDate;
}
