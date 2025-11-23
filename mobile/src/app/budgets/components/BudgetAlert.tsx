/**
 * Component: BudgetAlert
 *
 * Alerta discreto para orçamentos que atingiram threshold.
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, X, TrendingUp } from 'lucide-react-native';
import { useTheme } from '@/shared/hooks/useTheme';
import { formatPercent } from '@/shared/utils/formatters';
import type { BudgetAlert as BudgetAlertType } from '@/shared/models/Budget.model';

interface BudgetAlertProps {
  alert: BudgetAlertType;
  onDismiss?: (alertId: number) => void;
  onPress?: (alert: BudgetAlertType) => void;
}

function BudgetAlertComponent({ alert, onDismiss, onPress }: BudgetAlertProps) {
  const { colors, theme } = useTheme();

  const isExceeded = alert.type === 'exceeded';
  const alertColor = isExceeded ? theme.colors.error.DEFAULT : theme.colors.warning.DEFAULT;
  const bgColor = isExceeded ? `${theme.colors.error.DEFAULT}15` : `${theme.colors.warning.DEFAULT}15`;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(alert)}
      activeOpacity={0.7}
      className="mb-3"
    >
      <View
        className="p-4 rounded-xl flex-row items-center"
        style={{ backgroundColor: bgColor }}
      >
        {/* Icon */}
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${alertColor}20` }}
        >
          {isExceeded ? (
            <TrendingUp size={20} color={alertColor} />
          ) : (
            <AlertTriangle size={20} color={alertColor} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text
            className="text-sm font-semibold mb-1"
            style={{ color: alertColor }}
          >
            {alert.category_name}
          </Text>
          <Text
            className="text-xs"
            style={{ color: colors.text.secondary }}
            numberOfLines={2}
          >
            {alert.message}
          </Text>
          <Text
            className="text-xs font-medium mt-1"
            style={{ color: alertColor }}
          >
            {formatPercent(alert.usage_percentage)} do orçamento
          </Text>
        </View>

        {/* Dismiss button */}
        {onDismiss && (
          <TouchableOpacity
            onPress={() => onDismiss(alert.id)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            className="ml-2"
          >
            <X size={18} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const BudgetAlertItem = memo(BudgetAlertComponent);

/**
 * Lista de alertas
 */
interface BudgetAlertsListProps {
  alerts: BudgetAlertType[];
  onDismiss?: (alertId: number) => void;
  onAlertPress?: (alert: BudgetAlertType) => void;
  maxAlerts?: number;
}

function BudgetAlertsListComponent({
  alerts,
  onDismiss,
  onAlertPress,
  maxAlerts = 3,
}: BudgetAlertsListProps) {
  const { colors } = useTheme();

  if (alerts.length === 0) {
    return null;
  }

  const visibleAlerts = alerts.slice(0, maxAlerts);
  const remainingCount = alerts.length - maxAlerts;

  return (
    <View className="mb-4">
      <Text
        className="text-sm font-semibold mb-3"
        style={{ color: colors.text.primary }}
      >
        Alertas de Orçamento
      </Text>

      {visibleAlerts.map((alert) => (
        <BudgetAlertItem
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
          onPress={onAlertPress}
        />
      ))}

      {remainingCount > 0 && (
        <Text
          className="text-xs text-center mt-2"
          style={{ color: colors.text.secondary }}
        >
          +{remainingCount} {remainingCount === 1 ? 'alerta' : 'alertas'}
        </Text>
      )}
    </View>
  );
}

export const BudgetAlertsList = memo(BudgetAlertsListComponent);

/**
 * Banner de alerta para topo da tela
 */
interface AlertBannerProps {
  message: string;
  type: 'warning' | 'exceeded';
  onDismiss?: () => void;
}

function AlertBannerComponent({ message, type, onDismiss }: AlertBannerProps) {
  const { theme } = useTheme();

  const isExceeded = type === 'exceeded';
  const bgColor = isExceeded ? theme.colors.error.DEFAULT : theme.colors.warning.DEFAULT;

  return (
    <View
      className="px-4 py-3 flex-row items-center"
      style={{ backgroundColor: bgColor }}
    >
      <AlertTriangle size={18} color="#FFFFFF" />
      <Text
        className="flex-1 text-sm font-medium ml-2"
        style={{ color: '#FFFFFF' }}
        numberOfLines={1}
      >
        {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <X size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

export const AlertBanner = memo(AlertBannerComponent);
