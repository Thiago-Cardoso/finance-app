# frozen_string_literal: true

# GoalActivity model for tracking goal-related activities
class GoalActivity < ApplicationRecord
  belongs_to :goal

  validates :activity_type, presence: true

  scope :recent, -> { order(created_at: :desc) }
  scope :by_type, ->(type) { where(activity_type: type) }
end
