# frozen_string_literal: true

# GoalMilestone model for tracking goal progress milestones
class GoalMilestone < ApplicationRecord
  belongs_to :goal

  validates :name, presence: true, length: { maximum: 100 }
  validates :target_percentage, presence: true, numericality: { in: 0..100 }
  validates :reward_points, presence: true, numericality: { greater_than_or_equal_to: 0 }

  enum :status, { pending: 0, completed: 1, skipped: 2 }

  scope :pending, -> { where(status: :pending) }
  scope :completed, -> { where(status: :completed) }
  scope :ordered, -> { order(:target_percentage) }

  def target_amount
    (goal.target_amount * target_percentage / 100).round(2)
  end

  def is_achieved?
    goal.progress_percentage >= target_percentage
  end

  def complete!
    return false if completed?

    transaction do
      update!(status: :completed, completed_at: Time.current)
      create_completion_activity
      # award_milestone_points
      # send_milestone_notification
    end

    true
  end

  def skip!
    update!(status: :skipped, completed_at: Time.current)
  end

  private

  def create_completion_activity
    goal.goal_activities.create!(
      activity_type: 'milestone_completed',
      description: "Marco '#{name}' alcançado!",
      metadata: {
        milestone_percentage: target_percentage,
        current_amount: goal.current_amount,
        points_earned: reward_points
      }
    )
  end
end
