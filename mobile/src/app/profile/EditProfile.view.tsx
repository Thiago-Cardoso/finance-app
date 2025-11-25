/**
 * View: EditProfile
 *
 * Screen for editing user profile information.
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Screen } from '@/shared/components/ui/Screen';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { useTheme } from '@/shared/hooks/useTheme';
import { useProfileViewModel } from '@/viewModels/useProfile.viewModel';
import { editProfileSchema, type EditProfileFormData } from '@/shared/schemas/profile.schema';
import { ArrowLeft, User, Mail, AlertCircle, Check } from 'lucide-react-native';

interface EditProfileViewProps {
  onGoBack: () => void;
}

export function EditProfileView({ onGoBack }: EditProfileViewProps) {
  const { colors, theme } = useTheme();
  const { user, updateProfile, isSubmitting, error, clearError } = useProfileViewModel();

  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user, reset]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: EditProfileFormData) => {
    const result = await updateProfile(data);
    if (result.success) {
      onGoBack();
    }
  };

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
            className="text-lg font-semibold ml-2 flex-1"
            style={{ color: colors.text.primary }}
          >
            Editar Perfil
          </Text>
          {isDirty && (
            <TouchableOpacity
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="p-2 -mr-2"
            >
              <Check
                size={24}
                color={isSubmitting ? colors.text.disabled : theme.colors.primary.DEFAULT}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Form */}
        <View className="flex-1 px-4 pt-6">
          {/* Avatar */}
          <View className="items-center mb-8">
            <View
              className="w-24 h-24 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.colors.primary.DEFAULT }}
            >
              <User size={40} color="white" />
            </View>
            <Text
              className="text-sm mt-2"
              style={{ color: colors.text.secondary }}
            >
              Alterar foto em breve
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

          {/* First Name */}
          <Controller
            control={control}
            name="first_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome"
                placeholder="Digite seu nome"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.first_name?.message}
                autoCapitalize="words"
                returnKeyType="next"
                disabled={isSubmitting}
              />
            )}
          />

          {/* Last Name */}
          <Controller
            control={control}
            name="last_name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Sobrenome"
                placeholder="Digite seu sobrenome"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.last_name?.message}
                autoCapitalize="words"
                returnKeyType="next"
                disabled={isSubmitting}
              />
            )}
          />

          {/* Email */}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-mail"
                placeholder="Digite seu e-mail"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                disabled={isSubmitting}
                leftIcon={Mail}
              />
            )}
          />

          {/* Spacer */}
          <View className="flex-1" />

          {/* Submit Button */}
          <View className="pb-8">
            <Button
              title={isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
              onPress={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={!isDirty || isSubmitting}
              variant="primary"
              size="lg"
              className="w-full"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

export default EditProfileView;
