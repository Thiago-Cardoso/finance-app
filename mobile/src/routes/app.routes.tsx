/**
 * App Routes - Bottom Tabs Navigator
 *
 * Navegação principal do aplicativo com Bottom Tabs.
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, TrendingUp, PieChart, User } from 'lucide-react-native';
import { DashboardView } from '@/app/dashboard/Dashboard.view';
import { TransactionListView } from '@/app/transactions/TransactionList.view';
import { ReportsView } from '@/app/reports/Reports.view';
import { ProfileView } from '@/app/profile/Profile.view';
import { useTheme } from '@/shared/hooks/useTheme';
import type { AppTabsParamList } from './types';
import type { Transaction } from '@/shared/models/Transaction.model';

const Tab = createBottomTabNavigator<AppTabsParamList>();

/**
 * Transactions Tab Component
 * Wrapper to prevent inline function recreation causing infinite loops
 */
const TransactionsTab = React.memo(({ navigation }: any) => {
  const handleNavigateToForm = React.useCallback((transaction?: Transaction) => {
    navigation.navigate('TransactionForm', {
      transactionId: transaction?.id,
    });
  }, [navigation]);

  return <TransactionListView onNavigateToForm={handleNavigateToForm} />;
});
TransactionsTab.displayName = 'TransactionsTab';

export function AppRoutes() {
  const { theme, colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.text.disabled,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: 24,
          paddingTop: 12,
          height: 85,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardView}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          tabBarAccessibilityLabel: 'Ir para Dashboard',
        }}
      />

      <Tab.Screen
        name="Transactions"
        options={{
          tabBarLabel: 'Transações',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
          tabBarAccessibilityLabel: 'Ver Transações',
        }}
        component={TransactionsTab}
      />

      <Tab.Screen
        name="Reports"
        component={ReportsView}
        options={{
          tabBarLabel: 'Relatórios',
          tabBarIcon: ({ color, size }) => <PieChart color={color} size={size} />,
          tabBarAccessibilityLabel: 'Ver Relatórios',
        }}
      />

      <Tab.Screen
        name="Profile"
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: 'Ver Perfil',
        }}
      >
        {({ navigation }) => (
          <ProfileView
            onNavigateToEditProfile={() => navigation.navigate('EditProfile')}
            onNavigateToSettings={() => navigation.navigate('Settings')}
            onNavigateToChangePassword={() => navigation.navigate('ChangePassword')}
            onNavigateToAbout={() => navigation.navigate('About')}
            onNavigateToCategories={() => navigation.navigate('CategoryList')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
