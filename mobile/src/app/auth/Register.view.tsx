/**
 * View: Register
 *
 * Tela de cadastro de novo usuário.
 */

import React from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';
import { signUpSchema, type SignUpFormData } from '@/shared/lib/mobile-validations';

interface RegisterViewProps {
  onNavigateBack: () => void;
  onRegisterSuccess: () => void;
}

export function RegisterView({
  onNavigateBack,
  onRegisterSuccess,
}: RegisterViewProps) {
  const { colors, theme } = useTheme();
  const { handleSignUp, isLoading } = useAuthViewModel();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  /**
   * Submit do formulário
   */
  const onSubmit = async (data: SignUpFormData) => {
    const result = await handleSignUp(data);

    if (result.success) {
      onRegisterSuccess();
    }
  };

  return (
    <Screen
      scrollable
      showHeader
      title="Criar Conta"
      showBackButton
      onBack={onNavigateBack}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {/* Descrição */}
          <Text className="text-base mb-6" style={{ color: colors.text.secondary }}>
            Preencha os dados abaixo para criar sua conta
          </Text>

          {/* Formulário */}
          <View className="mb-6">
            <Controller
              control={control}
              name="first_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome"
                  placeholder="Seu nome"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.first_name?.message}
                  containerClassName="mb-4"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="last_name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Sobrenome"
                  placeholder="Seu sobrenome"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.last_name?.message}
                  containerClassName="mb-4"
                  required
                />
              )}
            />

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
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  placeholder="Mínimo 8 caracteres"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  helperText="Deve conter maiúscula, minúscula e número"
                  containerClassName="mb-4"
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="password_confirmation"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Confirmar Senha"
                  placeholder="Digite a senha novamente"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password_confirmation?.message}
                  containerClassName="mb-4"
                  required
                />
              )}
            />
          </View>

          {/* Botão de Cadastro */}
          <Button
            title="Criar Conta"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            className="mb-6"
          />

          {/* Termos de Uso */}
          <Text
            className="text-xs text-center"
            style={{ color: colors.text.disabled }}
          >
            Ao criar uma conta, você concorda com nossos{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              Termos de Uso
            </Text>{' '}
            e{' '}
            <Text style={{ color: theme.colors.primary.DEFAULT }}>
              Política de Privacidade
            </Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
