'use client';

import { Goal, GoalMilestone } from '@/types/goal';

interface GoalMilestonesProps {
  milestones: GoalMilestone[];
  goal: Goal;
}

export function GoalMilestones({ milestones, goal }: GoalMilestonesProps) {
  const progress = typeof goal.progress_percentage === 'string'
    ? parseFloat(goal.progress_percentage)
    : goal.progress_percentage;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Marcos da Meta
      </h3>

      <div className="space-y-3">
        {milestones.map((milestone) => {
          const isCompleted = milestone.status === 'completed';
          const isAchievable = progress >= milestone.target_percentage;

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-lg border ${
                isCompleted
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                  : isAchievable
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  : 'bg-gray-50 dark:bg-gray-900/30 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCompleted && (
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  <h4 className="font-medium text-gray-900 dark:text-white">{milestone.name}</h4>
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {milestone.target_percentage}%
                </span>
              </div>

              {milestone.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {milestone.description}
                </p>
              )}

              {milestone.reward_points && milestone.reward_points > 0 && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {milestone.reward_points} pontos
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
