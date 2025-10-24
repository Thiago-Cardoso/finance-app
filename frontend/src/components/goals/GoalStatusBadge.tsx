'use client';

import { GoalStatus, GoalPriority } from '@/types/goal';

interface GoalStatusBadgeProps {
  status: GoalStatus;
  priority?: GoalPriority;
  showPriority?: boolean;
}

export function GoalStatusBadge({ status, priority, showPriority = true }: GoalStatusBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getPriorityIndicator = () => {
    if (!showPriority || !priority) return null;

    const colors = {
      low: 'bg-gray-400',
      medium: 'bg-yellow-400',
      high: 'bg-orange-500',
      urgent: 'bg-red-500',
    };

    return (
      <div className={`w-2 h-2 rounded-full ${colors[priority]}`} title={`Prioridade: ${priority}`} />
    );
  };

  const getStatusLabel = () => {
    const labels: Record<GoalStatus, string> = {
      active: 'Ativa',
      paused: 'Pausada',
      completed: 'Concluída',
      failed: 'Falhou',
      cancelled: 'Cancelada',
    };
    return labels[status];
  };

  return (
    <div className="flex items-center gap-2">
      {getPriorityIndicator()}
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
        {getStatusLabel()}
      </span>
    </div>
  );
}
