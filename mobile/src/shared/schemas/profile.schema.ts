/**
 * Profile Schemas
 *
 * Zod validation schemas for profile forms.
 */

import { z } from 'zod';

/**
 * Schema for editing user profile
 */
export const editProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  last_name: z
    .string()
    .min(2, 'Sobrenome deve ter no mínimo 2 caracteres')
    .max(50, 'Sobrenome deve ter no máximo 50 caracteres'),
  email: z
    .string()
    .email('E-mail inválido')
    .min(1, 'E-mail é obrigatório'),
});

export type EditProfileFormData = z.infer<typeof editProfileSchema>;

/**
 * Schema for changing password
 */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, 'Senha atual é obrigatória'),
    password: z
      .string()
      .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter letra maiúscula, minúscula e número'
      ),
    password_confirmation: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
