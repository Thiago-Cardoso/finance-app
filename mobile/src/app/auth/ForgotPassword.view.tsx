/**
 * View: Forgot Password
 *
 * Tela de recuperação de senha.
 */

import React from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react-native';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Alert as AlertComponent } from '@/shared/components/ui/Alert';
import { useTheme } from '@/shared/hooks/useTheme';
import { useAuthViewModel } from '@/viewModels/useAuth.viewModel';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/shared/lib/mobile-validations';

interface ForgotPasswordViewProps {
  onNavigateBack: () => void;
}

export function ForgotPasswordView({ onNavigateBack }: ForgotPasswordViewProps) {
  const { colors } = useTheme();
  const { handleForgotPassword, isLoading } = useAuthViewModel();
  const [emailSent, setEmailSent] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  /**
   * Submit do formulário
   */
  const onSubmit = async (data: ForgotPasswordFormData) => {
    const result = await handleForgotPassword(data);

    if (result.success) {
      setEmailSent(true);
    }
  };

  return (
    <Screen
      scrollable
      showHeader
      title="Recuperar Senha"
      showBackButton
      onBack={onNavigateBack}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 py-8">
          {!emailSent ? (
            <>
              {/* Descrição */}
              <Text
                className="text-base mb-6"
                style={{ color: colors.text.secondary }}
              >
                Digite seu e-mail para receber instruções de recuperação de senha
              </Text>

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
                      leftIcon={Mail}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      required
                    />
                  )}
                />
              </View>

              {/* Botão */}
              <Button
                title="Enviar Instruções"
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </>
          ) : (
            <>
              {/* Mensagem de sucesso */}
              <AlertComponent
                variant="success"
                title="E-mail Enviado!"
                message="Verifique sua caixa de entrada e siga as instruções para redefinir sua senha."
                className="mb-6"
              />

              <Button
                title="Voltar para Login"
                onPress={onNavigateBack}
                variant="outline"
              />
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
