'use client';

import { Goal } from '@/types/goal';
import { formatCurrency } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';

interface GoalProgressProps {
  goal: Goal;
}

export function GoalProgress({ goal }: GoalProgressProps) {
  const progress = typeof goal.progress_percentage === 'string'
    ? parseFloat(goal.progress_percentage)
    : goal.progress_percentage;

  const currentAmount = typeof goal.current_amount === 'string'
    ? parseFloat(goal.current_amount)
    : goal.current_amount;

  const targetAmount = typeof goal.target_amount === 'string'
    ? parseFloat(goal.target_amount)
    : goal.target_amount;

  const remainingAmount = typeof goal.remaining_amount === 'string'
    ? parseFloat(goal.remaining_amount)
    : goal.remaining_amount;

  const monthlyTarget = goal.monthly_target
    ? typeof goal.monthly_target === 'string'
      ? parseFloat(goal.monthly_target)
      : goal.monthly_target
    : 0;

  const isOnTrack = goal['is_on_track?'];
  const isOverdue = goal['is_overdue?'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Progresso da Meta
      </h3>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progresso
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {progress.toFixed(1)}%
              </span>
              {isOnTrack && !isOverdue && (
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                  No prazo
                </span>
              )}
              {!isOnTrack && !isOverdue && (
                <span className="text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                  Atrasado
                </span>
              )}
              {isOverdue && (
                <span className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full">
                  Vencido
                </span>
              )}
            </div>
          </div>

          <ProgressBar
            progress={progress}
            status={goal.status}
            isOnTrack={isOnTrack}
            className="mb-2"
          />

          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{formatCurrency(currentAmount)}</span>
            <span>{formatCurrency(targetAmount)}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Faltam</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(remainingAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Dias restantes</p>
            <p className={`text-lg font-semibold ${
              isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
            }`}>
              {goal.days_remaining} {goal.days_remaining === 1 ? 'dia' : 'dias'}
            </p>
          </div>
          {monthlyTarget > 0 && (
            <div className="col-span-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meta mensal recomendada</p>
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(monthlyTarget)}/mês
              </p>
            </div>
          )}
        </div>

        {/* Visual Chart Placeholder */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="h-48 bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gráfico de progresso (em breve)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
