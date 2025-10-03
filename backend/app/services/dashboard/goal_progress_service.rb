# frozen_string_literal: true

module Dashboard
  # Service to track progress of user financial goals
  class GoalProgressService
    def initialize(user)
      @user = user
    end

    def call
      @user.goals
           .where(is_achieved: false)
           .order(:target_date)
           .limit(3)
           .map { |goal| analyze_goal(goal) }
    end

    private

    def analyze_goal(goal)
      {
        goal_id: goal.id,
        title: goal.title,
        target_amount: goal.target_amount.to_f,
        current_amount: goal.current_amount.to_f,
        progress_percentage: calculate_progress(goal),
        days_remaining: calculate_days_remaining(goal.target_date),
        target_date: goal.target_date&.strftime('%Y-%m-%d')
      }
    end

    def calculate_progress(goal)
      return 0 if goal.target_amount.zero?

      (goal.current_amount / goal.target_amount * 100).round(2)
    end

    def calculate_days_remaining(target_date)
      return nil unless target_date

      (target_date - Date.current).to_i
    end
  end
end
