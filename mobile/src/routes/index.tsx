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
import type { RootStackParamList } from './types';
import type { Category } from '@/shared/models/Category.model';

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
      AccountForm: 'accounts/new',
      BudgetForm: 'budgets/new',
      CategoryList: 'categories',
      CategoryForm: 'categories/edit',
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

  // Load user and preferences on mount
  useEffect(() => {
    loadUser();
    loadPreferences();
  }, [loadUser, loadPreferences]);

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
              {({ navigation, route }) => (
                <CategoryFormView
                  category={undefined} // Will be fetched by categoryId from route params
                  onSuccess={() => navigation.goBack()}
                  onCancel={() => navigation.goBack()}
                />
              )}
            </Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
