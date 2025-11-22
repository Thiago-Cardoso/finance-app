/**
 * Mobile-specific Validation Schemas
 *
 * Schemas de validação específicos do mobile que não existem no frontend.
 * Usam os helpers e funções base do frontend via symlink.
 */

import { z } from 'zod';
import { emailSchema } from './validations';

/**
 * Schema de recuperação de senha (Forgot Password)
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

/**
 * Tipo inferido do schema de recuperação
 */
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Schema de reset de senha
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .max(100, 'Senha deve ter no máximo 100 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
      ),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'As senhas não coincidem',
    path: ['password_confirmation'],
  });

/**
 * Tipo inferido do schema de reset
 */
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Re-export frontend schemas with mobile aliases
export {
  loginFormSchema as signInSchema,
  registerFormSchema as signUpSchema,
  type LoginFormData as SignInFormData,
  type RegisterFormData as SignUpFormData,
} from './validations';
