/**
 * Auth Routes - Stack Navigator
 *
 * Navegação para fluxo de autenticação (Login, Cadastro, Recuperação de Senha).
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginView, RegisterView, ForgotPasswordView } from '@/app/auth';
import type { AuthStackParamList } from './types';

const Stack = createStackNavigator<AuthStackParamList>();

export function AuthRoutes() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="Login" component={LoginViewWrapper} />
      <Stack.Screen name="Register" component={RegisterViewWrapper} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordViewWrapper} />
    </Stack.Navigator>
  );
}

/**
 * Wrappers para integrar Views com navegação
 */
function LoginViewWrapper({ navigation }: any) {
  return (
    <LoginView
      onNavigateToRegister={() => navigation.navigate('Register')}
      onNavigateToForgotPassword={() => navigation.navigate('ForgotPassword')}
      onLoginSuccess={() => {
        // A navegação condicional no Root Navigator cuida da troca
      }}
    />
  );
}

function RegisterViewWrapper({ navigation }: any) {
  return (
    <RegisterView
      onNavigateBack={() => navigation.goBack()}
      onRegisterSuccess={() => {
        // A navegação condicional no Root Navigator cuida da troca
      }}
    />
  );
}

function ForgotPasswordViewWrapper({ navigation }: any) {
  return (
    <ForgotPasswordView onNavigateBack={() => navigation.goBack()} />
  );
}
