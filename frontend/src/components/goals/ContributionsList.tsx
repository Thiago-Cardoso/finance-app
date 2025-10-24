'use client';

import { GoalContribution } from '@/types/goal';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ContributionsListProps {
  contributions: GoalContribution[];
}

export function ContributionsList({ contributions }: ContributionsListProps) {
  if (contributions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Nenhuma contribuição ainda
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contributions.map((contribution) => {
        const amount = typeof contribution.amount === 'string'
          ? parseFloat(contribution.amount)
          : contribution.amount;

        return (
          <div
            key={contribution.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(amount)}
              </p>
              {contribution.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {contribution.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDate(contribution.contributed_at)}
                {contribution.contributor_name && ` • ${contribution.contributor_name}`}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
