/**
 * View: Login
 *
 * Tela de login com email/senha e opção de biometria.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Fingerprint } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useBiometric } from '@/shared/hooks/useBiometric';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';
import { signInSchema, type SignInFormData } from '@/shared/lib/mobile-validations';

interface LoginViewProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  onLoginSuccess: () => void;
}

export function LoginView({
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onLoginSuccess,
}: LoginViewProps) {
  const { colors, theme } = useTheme();
  const { handleSignIn, isLoading } = useAuthViewModel();
  const { canUseBiometric, authenticate, biometricType } = useBiometric();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  /**
   * Form submit handler
   */
  const onSubmit = async (data: SignInFormData) => {
    const result = await handleSignIn(data);

    if (result.success) {
      onLoginSuccess();
    }
  };

  /**
   * Biometric authentication handler
   */
  const handleBiometricAuth = async () => {
    const result = await authenticate('Sign in with biometrics');

    if (result.success) {
      // TODO: Fetch saved credentials and auto-login
      console.log('Biometric authentication successful');
    }
  };

  return (
    <Screen scrollable showHeader={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 justify-center px-6 py-8">
          {/* Logo / Título */}
          <View className="items-center mb-8">
            <Text
              className="text-4xl font-bold mb-2"
              style={{ color: theme.colors.primary.DEFAULT }}
            >
              Finance App
            </Text>
            <Text className="text-lg" style={{ color: colors.text.secondary }}>
              Controle suas finanças
            </Text>
          </View>

          {/* Formulário */}
          <View className="mb-6">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="E-mail"
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  containerClassName="mb-4"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  placeholder="••••••••"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  containerClassName="mb-2"
                />
              )}
            />

            {/* Esqueceu a senha */}
            <TouchableOpacity
              onPress={onNavigateToForgotPassword}
              className="self-end"
            >
              <Text
                className="text-sm font-medium"
                style={{ color: theme.colors.primary.DEFAULT }}
              >
                Esqueceu a senha?
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <Button
            title="Entrar"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="mb-4"
          />

          {/* Botão de Biometria */}
          {canUseBiometric() && (
            <Button
              title={`Entrar com ${biometricType}`}
              onPress={handleBiometricAuth}
              variant="outline"
              leftIcon={Fingerprint}
              className="mb-6"
            />
          )}

          {/* Link para Cadastro */}
          <View className="flex-row justify-center items-center">
            <Text className="text-base" style={{ color: colors.text.secondary }}>
              Não tem uma conta?{' '}
            </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text
                className="text-base font-semibold"
                style={{ color: theme.colors.primary.DEFAULT }}
              >
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
