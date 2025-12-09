/**
 * Root Navigator
 *
 * Main app navigation with conditional navigation based on authentication.
 */

import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/shared/stores/authStore';
import { usePreferencesStore } from '@/shared/stores/preferencesStore';
import { useTheme } from '@/shared/hooks/useTheme';
import { navigationRef } from '@/shared/utils/navigation';
import { AuthRoutes } from './auth.routes';
import { AppRoutes } from './app.routes';
// TEMPORARY: Onboarding disabled due to reanimated incompatibility with Expo Go
// import { OnboardingView } from '@/app/onboarding/Onboarding.view';
// import { InitialSetupView } from '@/app/onboarding/InitialSetup.view';
import { CategoryListView, CategoryFormView } from '@/app/categories';
import { TransactionFormView } from '@/app/transactions';
import { BudgetListView, BudgetFormView, BudgetDetailView } from '@/app/budgets';
import { AccountListView, AccountFormView } from '@/app/accounts';
import { GoalsListView } from '@/app/goals/GoalsList.view';
import { GoalFormView } from '@/app/goals/GoalForm.view';
import { GoalDetailView } from '@/app/goals/GoalDetail.view';
import { EditProfileView } from '@/app/profile/EditProfile.view';
import { ChangePasswordView } from '@/app/profile/ChangePassword.view';
import { SettingsView } from '@/app/profile/Settings.view';
import { AboutView } from '@/app/profile/About.view';
import { useCategoriesStore } from '@/shared/stores/categoriesStore';
import { useTransactionsStore } from '@/shared/stores/transactionsStore';
import { useBudgetsStore } from '@/shared/stores/budgetsStore';
import { useAccountsStore } from '@/shared/stores/accountsStore';
import { useGoalsStore } from '@/shared/stores/goalsStore';
import type { RootStackParamList } from './types';
import type { Category } from '@/shared/models/Category.model';
import type { Transaction } from '@/shared/models/Transaction.model';
import type { Budget } from '@/shared/models/Budget.model';
import type { Account } from '@/shared/models/Account.model';
import type { Goal } from '@/shared/models/Goal.model';

const Stack = createStackNavigator<RootStackParamList>();

/**
 * Deep linking configuration
 */
const linking = {
  prefixes: ['financeapp://', 'https://finance-app.com'],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
      App: {
        screens: {
          Dashboard: 'dashboard',
          Transactions: 'transactions',
          Reports: 'reports',
          Profile: 'profile',
        },
      },
      TransactionForm: 'transactions/new',
      TransactionDetails: 'transactions/:transactionId',
      AccountList: 'accounts',
      AccountForm: 'accounts/new',
      BudgetList: 'budgets',
      BudgetForm: 'budgets/new',
      BudgetDetail: 'budgets/:budgetId',
      GoalsList: 'goals',
      GoalForm: 'goals/new',
      GoalDetail: 'goals/:goalId',
      CategoryList: 'categories',
      CategoryForm: 'categories/edit',
      EditProfile: 'profile/edit',
      ChangePassword: 'profile/change-password',
      Settings: 'settings',
      About: 'about',
    },
  },
};

/**
 * Main routes component
 */
export function Routes() {
  const { isAuthenticated, isLoading: authLoading, loadUser } = useAuthStore();
  const {
    onboardingCompleted,
    isLoading: prefsLoading,
    loadPreferences,
    setOnboardingCompleted,
    setCurrency,
    setFavoriteCategories,
  } = usePreferencesStore();
  const { colors } = useTheme();

  // Load user and preferences on mount only
  // DO NOT add loadUser/loadPreferences to deps - would cause infinite loop
  useEffect(() => {
    loadUser();
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only run once on mount

  // Loading screen while checking auth and preferences
  if (authLoading || prefsLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color="#5843BE" />
      </View>
    );
  }

  /**
   * Determine initial screen based on state
   */
  const getInitialRouteName = (): keyof RootStackParamList => {
    // If not authenticated, go to Auth
    if (!isAuthenticated) {
      return 'Auth';
    }
    // TEMPORARY: Skipping Onboarding due to reanimated incompatibility with Expo Go
    // If authenticated but hasn't completed onboarding, go to Onboarding
    // if (!onboardingCompleted) {
    //   return 'Onboarding';
    // }
    // If all good, go to App
    return 'App';
  };

  return (
    <NavigationContainer ref={navigationRef} linking={linking}>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{ headerShown: false }}
      >
        {/* TEMPORARY: Onboarding disabled due to reanimated incompatibility with Expo Go */}
        {/*
        <Stack.Screen name="Onboarding">
          {() => (
            <OnboardingView
              onComplete={() => {
                navigationRef.navigate('InitialSetup');
              }}
              onSkip={() => {
                setOnboardingCompleted(true);
                navigationRef.navigate('App');
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="InitialSetup">
          {() => (
            <InitialSetupView
              onComplete={(currency, categories) => {
                setCurrency(currency);
                setFavoriteCategories(categories);
                setOnboardingCompleted(true);
                navigationRef.navigate('App');
              }}
            />
          )}
        </Stack.Screen>
        */}

        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthRoutes} />
        ) : (
          <>
            <Stack.Screen name="App" component={AppRoutes} />
            <Stack.Screen name="CategoryList">
              {({ navigation }) => (
                <CategoryListView
                  onNavigateToForm={(category?: Category) => {
                    navigation.navigate('CategoryForm', {
                      categoryId: category?.id,
                    });
                  }}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="CategoryForm">
              {({ navigation, route }) => {
                const categoryId = route.params?.categoryId;
                const category = categoryId
                  ? useCategoriesStore.getState().getCategoryById(categoryId)
                  : undefined;

                return (
                  <CategoryFormView
                    category={category}
                    onSuccess={() => navigation.goBack()}
                    onCancel={() => navigation.goBack()}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="TransactionForm">
              {({ navigation, route }) => {
                const transactionId = route.params?.transactionId;
                const transaction = transactionId
                  ? useTransactionsStore.getState().getTransactionById(transactionId)
                  : undefined;

                return (
                  <TransactionFormView
                    transaction={transaction}
                    onSuccess={() => navigation.goBack()}
                    onCancel={() => navigation.goBack()}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="AccountList">
              {({ navigation }) => (
                <AccountListView
                  onNavigateToForm={(account?: Account) => {
                    navigation.navigate('AccountForm', {
                      accountId: account?.id,
                    });
                  }}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="AccountForm">
              {({ navigation, route }) => {
                const accountId = route.params?.accountId;
                const accounts = useAccountsStore((state) => state.accounts);
                const account = accountId
                  ? accounts.find((a) => a.id === accountId)
                  : undefined;

                return (
                  <AccountFormView
                    account={account}
                    onSuccess={() => navigation.goBack()}
                    onBack={() => navigation.goBack()}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="BudgetList">
              {({ navigation }) => (
                <BudgetListView
                  onNavigateToForm={(budget?: Budget) => {
                    navigation.navigate('BudgetForm', {
                      budgetId: budget?.id,
                    });
                  }}
                  onNavigateToDetail={(budget: Budget) => {
                    navigation.navigate('BudgetDetail', {
                      budgetId: budget.id,
                    });
                  }}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="BudgetForm">
              {({ navigation, route }) => {
                const budgetId = route.params?.budgetId;
                const budgets = useBudgetsStore((state) => state.budgets);
                const budget = budgetId
                  ? budgets.find((b) => b.id === budgetId)
                  : undefined;

                return (
                  <BudgetFormView
                    budget={budget}
                    onSuccess={() => navigation.goBack()}
                    onBack={() => navigation.goBack()}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="BudgetDetail">
              {({ navigation, route }) => {
                const budgetId = route.params?.budgetId;
                const budgets = useBudgetsStore((state) => state.budgets);
                const budget = budgets.find((b) => b.id === budgetId);

                if (!budget) {
                  navigation.goBack();
                  return null;
                }

                return (
                  <BudgetDetailView
                    budget={budget}
                    onEdit={(b: Budget) => {
                      navigation.navigate('BudgetForm', {
                        budgetId: b.id,
                      });
                    }}
                    onBack={() => navigation.goBack()}
                    onDeleted={() => navigation.navigate('BudgetList')}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="GoalsList">
              {({ navigation }) => (
                <GoalsListView
                  onNavigateToForm={(goal?: Goal) => {
                    navigation.navigate('GoalForm', {
                      goalId: goal?.id,
                    });
                  }}
                  onNavigateToDetail={(goal: Goal) => {
                    navigation.navigate('GoalDetail', {
                      goalId: goal.id,
                    });
                  }}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="GoalForm">
              {({ navigation, route }) => {
                const goalId = route.params?.goalId;
                const goals = useGoalsStore((state) => state.goals);
                const goal = goalId
                  ? goals.find((g) => g.id === goalId)
                  : undefined;

                return (
                  <GoalFormView
                    goal={goal}
                    onSuccess={() => navigation.goBack()}
                    onBack={() => navigation.goBack()}
                  />
                );
              }}
            </Stack.Screen>
            <Stack.Screen name="GoalDetail">
              {({ navigation, route }) => (
                <GoalDetailView
                  goalId={route.params?.goalId}
                  onEdit={(goal: Goal) => {
                    navigation.navigate('GoalForm', {
                      goalId: goal.id,
                    });
                  }}
                  onBack={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
            <Stack.Screen name="EditProfile">
              {({ navigation }) => (
                <EditProfileView onGoBack={() => navigation.goBack()} />
              )}
            </Stack.Screen>
            <Stack.Screen name="ChangePassword">
              {({ navigation }) => (
                <ChangePasswordView onGoBack={() => navigation.goBack()} />
              )}
            </Stack.Screen>
            <Stack.Screen name="Settings">
              {({ navigation }) => (
                <SettingsView onGoBack={() => navigation.goBack()} />
              )}
            </Stack.Screen>
            <Stack.Screen name="About">
              {({ navigation }) => (
                <AboutView onGoBack={() => navigation.goBack()} />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
