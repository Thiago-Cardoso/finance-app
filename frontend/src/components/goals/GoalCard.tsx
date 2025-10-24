'use client';

import Link from 'next/link';
import { Goal } from '@/types/goal';
import { formatCurrency } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import { GoalTypeIcon } from './GoalTypeIcon';
import { GoalStatusBadge } from './GoalStatusBadge';

interface GoalCardProps {
  goal: Goal;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
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

  const isOverdue = goal['is_overdue?'];
  const isOnTrack = goal['is_on_track?'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <GoalTypeIcon type={goal.goal_type} />
          <div>
            <Link
              href={`/goals/${goal.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              {goal.name}
            </Link>
            {goal.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {goal.description}
              </p>
            )}
          </div>
        </div>
        <GoalStatusBadge status={goal.status} priority={goal.priority} />
      </div>

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {progress.toFixed(1)}%
            </span>
          </div>
          <ProgressBar
            progress={progress}
            status={goal.status}
            isOnTrack={isOnTrack}
          />
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Atual</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(currentAmount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Meta</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(targetAmount)}
            </p>
          </div>
        </div>

        {/* Remaining and Days */}
        <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200 dark:border-gray-700">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Faltam: </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(remainingAmount)}
            </span>
          </div>
          <div className={`flex items-center gap-1 ${
            isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'
          }`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              {goal.days_remaining} {goal.days_remaining === 1 ? 'dia' : 'dias'}
            </span>
          </div>
        </div>

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            {onEdit && (
              <button
                onClick={() => onEdit(goal)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(goal)}
                className="flex-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
