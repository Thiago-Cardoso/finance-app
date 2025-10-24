'use client';

import { formatCurrency } from '@/lib/utils';

interface GoalsSummaryProps {
  meta: {
    total_count: number;
    active_count: number;
    completed_count: number;
    total_target_amount: string | number;
    total_current_amount: string | number;
  };
}

export function GoalsSummary({ meta }: GoalsSummaryProps) {
  const totalTarget = typeof meta.total_target_amount === 'string'
    ? parseFloat(meta.total_target_amount)
    : meta.total_target_amount;

  const totalCurrent = typeof meta.total_current_amount === 'string'
    ? parseFloat(meta.total_current_amount)
    : meta.total_current_amount;

  const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {/* Total Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Metas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {meta.total_count}
            </p>
          </div>
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Metas Ativas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {meta.active_count}
            </p>
          </div>
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Completed Goals */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Concluídas</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {meta.completed_count}
            </p>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Progresso Geral</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {overallProgress.toFixed(1)}%
          </p>
          <div className="mt-2">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-gray-600 dark:text-gray-400">
              <span>{formatCurrency(totalCurrent)}</span>
              <span>{formatCurrency(totalTarget)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
