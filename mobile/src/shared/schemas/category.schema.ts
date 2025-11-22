/**
 * Schema: Category
 *
 * Validações Zod para categorias.
 */

import { z } from 'zod';

export const categoryTypeEnum = z.enum(['income', 'expense', 'both']);

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  icon: z.string().min(1, 'Selecione um ícone'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)'),
  category_type: categoryTypeEnum,
});

export const createCategorySchema = categorySchema;

export const updateCategorySchema = categorySchema.partial();

export type CategoryFormData = z.infer<typeof categorySchema>;
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
