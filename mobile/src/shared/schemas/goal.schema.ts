/**
 * Goal Schema
 *
 * Validação de metas financeiras com Zod.
 */

import { z } from 'zod';

/**
 * Schema para criar/editar meta
 */
export const goalSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome muito longo (máximo 100 caracteres)'),

  description: z.string().max(500, 'Descrição muito longa (máximo 500 caracteres)').optional(),

  target_amount: z
    .number({ required_error: 'Valor alvo é obrigatório' })
    .positive('Valor deve ser positivo')
    .min(1, 'Valor mínimo é R$ 1,00'),

  target_date: z
    .string({ required_error: 'Data limite é obrigatória' })
    .refine((date) => new Date(date) > new Date(), {
      message: 'Data deve ser futura',
    }),

  goal_type: z.enum(['savings', 'debt_payoff', 'investment', 'expense_reduction', 'general'], {
    required_error: 'Selecione um tipo de meta',
  }),

  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),

  category_id: z.number().positive().optional(),

  baseline_amount: z.number().min(0).optional(),

  auto_track_progress: z.boolean().default(false),
});

/**
 * Schema para contribuição
 */
export const contributionSchema = z.object({
  amount: z
    .number({ required_error: 'Valor é obrigatório' })
    .positive('Valor deve ser positivo')
    .min(0.01, 'Valor mínimo é R$ 0,01'),

  description: z
    .string()
    .max(255, 'Descrição muito longa (máximo 255 caracteres)')
    .optional(),
});

/**
 * Schema para filtros de metas
 */
export const goalFiltersSchema = z.object({
  status: z.enum(['active', 'paused', 'completed', 'failed', 'cancelled']).optional(),
  goal_type: z.enum(['savings', 'debt_payoff', 'investment', 'expense_reduction', 'general']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category_id: z.number().optional(),
});

/**
 * Tipos inferidos dos schemas
 */
export type GoalFormData = z.infer<typeof goalSchema>;
export type ContributionFormData = z.infer<typeof contributionSchema>;
export type GoalFiltersFormData = z.infer<typeof goalFiltersSchema>;

/**
 * Valores padrão para nova meta
 */
export function getDefaultGoalValues(): Partial<GoalFormData> {
  const now = new Date();
  const threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  return {
    name: '',
    description: '',
    target_amount: 0,
    target_date: threeMonthsFromNow.toISOString().split('T')[0],
    goal_type: 'savings',
    priority: 'medium',
    auto_track_progress: false,
  };
}

/**
 * Valores padrão para nova contribuição
 */
export function getDefaultContributionValues(): Partial<ContributionFormData> {
  return {
    amount: 0,
    description: '',
  };
}

/**
 * Validação customizada para data de meta
 */
export function validateGoalDate(date: string): boolean {
  const targetDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Resetar horas para comparar apenas datas
  return targetDate > now;
}
