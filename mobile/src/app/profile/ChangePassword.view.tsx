/**
 * View: ChangePassword
 *
 * Screen for changing user password.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProfileViewModel } from '@/viewModels/useProfile.viewModel';
import { changePasswordSchema, type ChangePasswordFormData } from '@/shared/schemas/profile.schema';
import { ArrowLeft, Lock, AlertCircle, CheckCircle } from 'lucide-react-native';

interface ChangePasswordViewProps {
  onGoBack: () => void;
}

export function ChangePasswordView({ onGoBack }: ChangePasswordViewProps) {
  const { colors, theme } = useTheme();
  const { changePassword, isSubmitting, error, clearError } = useProfileViewModel();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  // Watch password for strength indicator
  const newPassword = watch('password');

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: ChangePasswordFormData) => {
    const result = await changePassword(data);
    if (result.success) {
      Alert.alert(
        'Sucesso',
        'Sua senha foi alterada com sucesso!',
        [{ text: 'OK', onPress: onGoBack }]
      );
      reset();
    }
  };

  // Password strength calculation
  const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
    if (!password) return { level: 0, label: '', color: colors.border };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: strength, label: 'Fraca', color: theme.colors.error.DEFAULT };
    if (strength <= 3) return { level: strength, label: 'Média', color: theme.colors.warning.DEFAULT };
    return { level: strength, label: 'Forte', color: theme.colors.success.DEFAULT };
  };

  const passwordStrength = getPasswordStrength(newPassword || '');

  return (
    <Screen showHeader={false} scrollable={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View
          className="flex-row items-center px-4 py-3 border-b"
          style={{ borderBottomColor: colors.border }}
        >
          <TouchableOpacity
            onPress={onGoBack}
            className="p-2 -ml-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            className="text-lg font-semibold ml-2"
            style={{ color: colors.text.primary }}
          >
            Alterar Senha
          </Text>
        </View>

        {/* Form */}
        <ScrollView
          className="flex-1 px-4 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Banner */}
          <View
            className="flex-row items-start p-4 rounded-lg mb-6"
            style={{ backgroundColor: `${theme.colors.primary.DEFAULT}10` }}
          >
            <Lock size={20} color={theme.colors.primary.DEFAULT} />
            <Text
              className="ml-3 flex-1 text-sm"
              style={{ color: colors.text.secondary }}
            >
              Por segurança, sua senha deve ter pelo menos 8 caracteres, incluindo letras maiúsculas, minúsculas e números.
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View
              className="flex-row items-center p-3 rounded-lg mb-4"
              style={{ backgroundColor: `${theme.colors.error.DEFAULT}20` }}
            >
              <AlertCircle size={20} color={theme.colors.error.DEFAULT} />
              <Text
                className="ml-2 flex-1"
                style={{ color: theme.colors.error.DEFAULT }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Current Password */}
          <Controller
            control={control}
            name="current_password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Senha Atual"
                placeholder="Digite sua senha atual"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.current_password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="next"
                disabled={isSubmitting}
                leftIcon={Lock}
              />
            )}
          />

          {/* New Password */}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  label="Nova Senha"
                  placeholder="Digite sua nova senha"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="new-password"
                  returnKeyType="next"
                  disabled={isSubmitting}
                  leftIcon={Lock}
                />
                {/* Password Strength Indicator */}
                {newPassword && (
                  <View className="mt-2 mb-4">
                    <View className="flex-row items-center justify-between mb-1">
                      <Text
                        className="text-xs"
                        style={{ color: colors.text.secondary }}
                      >
                        Força da senha:
                      </Text>
                      <Text
                        className="text-xs font-medium"
                        style={{ color: passwordStrength.color }}
                      >
                        {passwordStrength.label}
                      </Text>
                    </View>
                    <View className="flex-row h-1 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <View
                          key={i}
                          className="flex-1 mr-0.5"
                          style={{
                            backgroundColor: i <= passwordStrength.level ? passwordStrength.color : colors.border,
                          }}
                        />
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}
          />

          {/* Confirm Password */}
          <Controller
            control={control}
            name="password_confirmation"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmar Nova Senha"
                placeholder="Confirme sua nova senha"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password_confirmation?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="done"
                disabled={isSubmitting}
                leftIcon={Lock}
              />
            )}
          />

          {/* Password Requirements Checklist */}
          <View className="mt-2 mb-4">
            <PasswordRequirement
              met={(newPassword?.length || 0) >= 8}
              text="Mínimo 8 caracteres"
              colors={colors}
              theme={theme}
            />
            <PasswordRequirement
              met={/[a-z]/.test(newPassword || '')}
              text="Letra minúscula"
              colors={colors}
              theme={theme}
            />
            <PasswordRequirement
              met={/[A-Z]/.test(newPassword || '')}
              text="Letra maiúscula"
              colors={colors}
              theme={theme}
            />
            <PasswordRequirement
              met={/\d/.test(newPassword || '')}
              text="Número"
              colors={colors}
              theme={theme}
            />
          </View>

          {/* Submit Button */}
          <View className="pb-8 mt-4">
            <Button
              title={isSubmitting ? 'Alterando...' : 'Alterar Senha'}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!isValid || isSubmitting}
              variant="primary"
              size="lg"
              className="w-full"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/**
 * Password Requirement Item
 */
interface PasswordRequirementProps {
  met: boolean;
  text: string;
  colors: any;
  theme: any;
}

function PasswordRequirement({ met, text, colors, theme }: PasswordRequirementProps) {
  return (
    <View className="flex-row items-center py-1">
      <CheckCircle
        size={14}
        color={met ? theme.colors.success.DEFAULT : colors.text.disabled}
      />
      <Text
        className="ml-2 text-xs"
        style={{ color: met ? colors.text.primary : colors.text.disabled }}
      >
        {text}
      </Text>
    </View>
  );
}

export default ChangePasswordView;
