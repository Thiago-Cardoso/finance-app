/**
 * Tests for profile.schema
 */

import { editProfileSchema, changePasswordSchema } from '../profile.schema';

describe('profile.schema', () => {
  describe('editProfileSchema', () => {
    describe('first_name', () => {
      it('should accept valid first name', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        });

        expect(result.success).toBe(true);
      });

      it('should reject first name with less than 2 characters', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'J',
          last_name: 'Doe',
          email: 'john@example.com',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Nome deve ter no mínimo 2 caracteres');
        }
      });

      it('should reject first name with more than 50 characters', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'A'.repeat(51),
          last_name: 'Doe',
          email: 'john@example.com',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Nome deve ter no máximo 50 caracteres');
        }
      });
    });

    describe('last_name', () => {
      it('should accept valid last name', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        });

        expect(result.success).toBe(true);
      });

      it('should reject last name with less than 2 characters', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'D',
          email: 'john@example.com',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Sobrenome deve ter no mínimo 2 caracteres');
        }
      });

      it('should reject last name with more than 50 characters', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'D'.repeat(51),
          email: 'john@example.com',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Sobrenome deve ter no máximo 50 caracteres');
        }
      });
    });

    describe('email', () => {
      it('should accept valid email', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'Doe',
          email: 'john@example.com',
        });

        expect(result.success).toBe(true);
      });

      it('should reject invalid email', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'Doe',
          email: 'invalid-email',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('E-mail inválido');
        }
      });

      it('should reject empty email', () => {
        const result = editProfileSchema.safeParse({
          first_name: 'John',
          last_name: 'Doe',
          email: '',
        });

        expect(result.success).toBe(false);
      });
    });
  });

  describe('changePasswordSchema', () => {
    describe('current_password', () => {
      it('should accept valid current password', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'NewPassword1',
          password_confirmation: 'NewPassword1',
        });

        expect(result.success).toBe(true);
      });

      it('should reject empty current password', () => {
        const result = changePasswordSchema.safeParse({
          current_password: '',
          password: 'NewPassword1',
          password_confirmation: 'NewPassword1',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Senha atual é obrigatória');
        }
      });
    });

    describe('password', () => {
      it('should accept valid password with uppercase, lowercase and number', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'NewPassword1',
          password_confirmation: 'NewPassword1',
        });

        expect(result.success).toBe(true);
      });

      it('should reject password with less than 8 characters', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'Pass1',
          password_confirmation: 'Pass1',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Nova senha deve ter no mínimo 8 caracteres');
        }
      });

      it('should reject password without uppercase letter', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'password123',
          password_confirmation: 'password123',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Senha deve conter letra maiúscula, minúscula e número'
          );
        }
      });

      it('should reject password without lowercase letter', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'PASSWORD123',
          password_confirmation: 'PASSWORD123',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Senha deve conter letra maiúscula, minúscula e número'
          );
        }
      });

      it('should reject password without number', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'PasswordABC',
          password_confirmation: 'PasswordABC',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe(
            'Senha deve conter letra maiúscula, minúscula e número'
          );
        }
      });
    });

    describe('password_confirmation', () => {
      it('should accept matching passwords', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'NewPassword1',
          password_confirmation: 'NewPassword1',
        });

        expect(result.success).toBe(true);
      });

      it('should reject non-matching passwords', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'NewPassword1',
          password_confirmation: 'DifferentPassword1',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('As senhas não coincidem');
        }
      });

      it('should reject empty password confirmation', () => {
        const result = changePasswordSchema.safeParse({
          current_password: 'oldPassword123',
          password: 'NewPassword1',
          password_confirmation: '',
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Confirmação de senha é obrigatória');
        }
      });
    });
  });
});
