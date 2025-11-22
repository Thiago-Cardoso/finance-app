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

const Tab = createBottomTabNavigator<AppTabsParamList>();

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
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarIconStyle: {
          marginTop: 4,
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
        component={TransactionListView}
        options={{
          tabBarLabel: 'Transações',
          tabBarIcon: ({ color, size }) => <TrendingUp color={color} size={size} />,
          tabBarAccessibilityLabel: 'Ver Transações',
        }}
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
        component={ProfileView}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarAccessibilityLabel: 'Ver Perfil',
        }}
      />
    </Tab.Navigator>
  );
}
