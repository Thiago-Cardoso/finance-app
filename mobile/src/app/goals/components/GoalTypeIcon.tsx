/**
 * GoalTypeIcon Component
 *
 * Ícone representando o tipo de meta.
 */

import React from 'react';
import { Wallet, CreditCard, TrendingUp, DollarSign, Target } from 'lucide-react-native';
import type { GoalType } from '@/shared/models/Goal.model';

interface GoalTypeIconProps {
  type: GoalType;
  size?: number;
  color?: string;
}

export function GoalTypeIcon({ type, size = 24, color = '#5843BE' }: GoalTypeIconProps) {
  switch (type) {
    case 'savings':
      return <Wallet size={size} color={color} />;
    case 'debt_payoff':
      return <CreditCard size={size} color={color} />;
    case 'investment':
      return <TrendingUp size={size} color={color} />;
    case 'expense_reduction':
      return <DollarSign size={size} color={color} />;
    case 'general':
    default:
      return <Target size={size} color={color} />;
  }
}
