# frozen_string_literal: true

# GoalContribution model for tracking contributions to goals
class GoalContribution < ApplicationRecord
  belongs_to :goal
  belongs_to :source_transaction, class_name: 'Transaction', foreign_key: 'transaction_id', optional: true
  belongs_to :contributor, class_name: 'User', foreign_key: 'contributor_id', optional: true

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :contributed_at, presence: true

  scope :recent, -> { order(contributed_at: :desc) }
  scope :by_contributor, ->(user) { where(contributor: user) }

  after_create :create_activity, unless: :skip_callbacks
  after_destroy :update_goal_progress, unless: :skip_callbacks

  attr_accessor :skip_callbacks

  def contributor_name
    contributor&.full_name || goal.user.full_name
  end

  def is_from_transaction?
    transaction_id.present?
  end

  private

  def update_goal_progress
    goal.update_current_amount!
  end

  def create_activity
    goal.goal_activities.create!(
      activity_type: 'contribution_added',
      description: "Contribuição de R$ #{amount} adicionada",
      metadata: {
        amount: amount,
        contributor_id: contributor_id,
        transaction_id: transaction_id,
        description: description
      }
    )
  end
end
