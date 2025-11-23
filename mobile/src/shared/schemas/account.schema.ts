/**
 * Account Schema
 *
 * Validação de contas com Zod.
 */

import { z } from 'zod';

/**
 * Schema para criar/editar conta
 */
export const accountSchema = z.object({
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome muito curto (mínimo 2 caracteres)')
    .max(50, 'Nome muito longo (máximo 50 caracteres)'),

  account_type: z
    .enum(['checking', 'savings', 'credit_card', 'cash', 'investment'], {
      required_error: 'Selecione um tipo de conta',
    }),

  initial_balance: z
    .number({ required_error: 'Saldo inicial é obrigatório' })
    .min(0, 'Saldo inicial não pode ser negativo'),

  icon: z
    .string()
    .optional(),

  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor inválida')
    .optional(),
});

/**
 * Schema para filtros de contas
 */
export const accountFiltersSchema = z.object({
  account_type: z
    .enum(['checking', 'savings', 'credit_card', 'cash', 'investment'])
    .optional(),
  is_active: z.boolean().optional(),
});

/**
 * Tipos inferidos dos schemas
 */
export type AccountSchemaType = z.infer<typeof accountSchema>;
export type AccountFiltersSchemaType = z.infer<typeof accountFiltersSchema>;

/**
 * Valores padrão para nova conta
 */
export function getDefaultAccountValues(): AccountSchemaType {
  return {
    name: '',
    account_type: 'checking',
    initial_balance: 0,
    icon: undefined,
    color: undefined,
  };
}

/**
 * Validação customizada de nome único
 * (deve ser verificado no backend, mas podemos fazer check local)
 */
export function validateUniqueAccountName(
  name: string,
  existingNames: string[],
  currentName?: string
): boolean {
  const normalizedName = name.toLowerCase().trim();
  const filteredNames = existingNames.filter(
    (n) => n.toLowerCase().trim() !== currentName?.toLowerCase().trim()
  );
  return !filteredNames.some((n) => n.toLowerCase().trim() === normalizedName);
}
