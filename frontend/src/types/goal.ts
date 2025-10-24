export type GoalType = 'savings' | 'debt_payoff' | 'investment' | 'expense_reduction' | 'general';
export type GoalStatus = 'active' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';
export type MilestoneStatus = 'pending' | 'completed' | 'skipped';
export type BadgeType =
  | 'goal_master'
  | 'savings_champion'
  | 'debt_destroyer'
  | 'investment_guru'
  | 'budget_wizard'
  | 'milestone_crusher'
  | 'consistency_king'
  | 'early_achiever';

export interface GoalMilestone {
  id: number;
  name: string;
  target_percentage: number;
  reward_points?: number;
  status: MilestoneStatus;
  completed_at: string | null;
  description?: string;
}

export interface GoalContribution {
  id: number;
  amount: string | number;
  description: string | null;
  contributed_at: string;
  contributor_name?: string;
  transaction_id?: number | null;
  contributor_id?: number | null;
}

export interface GoalActivity {
  id: number;
  activity_type: string;
  description: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  badge_type: BadgeType;
  title: string;
  description: string;
  points_earned: number;
  earned_at: string;
  icon?: string;
}

export interface Goal {
  id: number;
  name: string;
  description: string | null;
  target_amount: string | number;
  current_amount: string | number;
  target_date: string;
  user_id: number;
  is_achieved: boolean;
  created_at: string;
  updated_at: string;
  goal_type: GoalType;
  priority: GoalPriority;
  status: GoalStatus;
  category_id: number | null;
  baseline_amount: string | number | null;
  completed_at: string | null;
  auto_track_progress: boolean;
  last_notification_progress: string | number;

  // Computed fields
  progress_percentage: string | number;
  remaining_amount: string | number;
  days_remaining: number;
  'is_overdue?': boolean;
  'is_on_track?': boolean;
  monthly_target?: string | number;

  // Relations
  goal_milestones?: GoalMilestone[];
  goal_contributions?: GoalContribution[];
  goal_activities?: GoalActivity[];
  category?: {
    id: number;
    name: string;
    color: string;
    icon: string;
  };
}

export interface GoalsListResponse {
  success: boolean;
  data: Goal[];
  meta: {
    total_count: number;
    active_count: number;
    completed_count: number;
    total_target_amount: string | number;
    total_current_amount: string | number;
  };
}

export interface GoalResponse {
  success: boolean;
  data: Goal;
  message?: string;
}

export interface ContributionResponse {
  success: boolean;
  data: {
    contribution: GoalContribution;
    goal: Goal;
  };
  message?: string;
}

export interface CreateGoalData {
  name: string;
  description?: string;
  target_amount: number;
  target_date: string;
  goal_type: GoalType;
  priority: GoalPriority;
  category_id?: number;
  baseline_amount?: number;
  auto_track_progress?: boolean;
}

export interface UpdateGoalData extends Partial<CreateGoalData> {
  status?: GoalStatus;
}

export interface CreateContributionData {
  amount: number;
  description?: string;
}

export interface GoalFilters {
  status?: GoalStatus;
  goal_type?: GoalType;
  priority?: GoalPriority;
  category_id?: number;
}
