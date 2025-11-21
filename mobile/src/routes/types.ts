/**
 * Navigation Types
 *
 * Define todos os tipos de navegação do aplicativo para type-safety.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';

/**
 * Auth Stack - Rotas de autenticação
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * App Tabs - Rotas principais do app (Bottom Tabs)
 */
export type AppTabsParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Reports: undefined;
  Profile: undefined;
};

/**
 * Root Stack - Stack principal que contém Auth e App
 */
export type RootStackParamList = {
  Onboarding: undefined;
  InitialSetup: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  App: NavigatorScreenParams<AppTabsParamList>;
  TransactionForm: { transactionId?: string };
  TransactionDetails: { transactionId: string };
  AccountForm: { accountId?: string };
  BudgetForm: { budgetId?: string };
  CategoryForm: { categoryId?: string };
};

/**
 * Props de navegação para telas de Auth
 */
export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  StackScreenProps<AuthStackParamList, T>;

/**
 * Props de navegação para telas de App Tabs
 */
export type AppTabsScreenProps<T extends keyof AppTabsParamList> = CompositeScreenProps<
  BottomTabScreenProps<AppTabsParamList, T>,
  StackScreenProps<RootStackParamList>
>;

/**
 * Props de navegação para telas de Root Stack
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

/**
 * Declaração global de tipos de navegação
 * Isso permite usar useNavigation() e useRoute() com type-safety
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
