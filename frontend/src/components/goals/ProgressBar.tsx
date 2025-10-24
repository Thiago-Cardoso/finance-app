'use client';

import { GoalStatus } from '@/types/goal';

interface ProgressBarProps {
  progress: number;
  status: GoalStatus;
  isOnTrack?: boolean;
  className?: string;
}

export function ProgressBar({ progress, status, isOnTrack = true, className = '' }: ProgressBarProps) {
  const getProgressColor = () => {
    if (status === 'completed') return 'bg-green-500';
    if (status === 'failed' || status === 'cancelled') return 'bg-gray-400';
    if (!isOnTrack) return 'bg-yellow-500';
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getBackgroundColor = () => {
    return 'bg-gray-200 dark:bg-gray-700';
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      <div className={`h-2 rounded-full overflow-hidden ${getBackgroundColor()}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
}
