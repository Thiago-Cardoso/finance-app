# frozen_string_literal: true

# Goal model for financial goals tracking with advanced features
class Goal < ApplicationRecord
  # Associations
  belongs_to :user
  belongs_to :category, optional: true
  has_many :goal_milestones, dependent: :destroy
  has_many :goal_contributions, dependent: :destroy
  has_many :goal_activities, dependent: :destroy
  has_many :shared_goals, dependent: :destroy
  has_many :collaborators, through: :shared_goals, source: :user

  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :goal_type, presence: true
  validates :target_date, presence: true
  validates :status, presence: true
  validate :target_date_in_future, on: :create
  validate :current_amount_not_greater_than_target

  # Enums
  enum :goal_type, { savings: 0, debt_payoff: 1, investment: 2, expense_reduction: 3, general: 4 }
  enum :status, { active: 0, paused: 1, completed: 2, failed: 3, cancelled: 4 }
  enum :priority, { low: 0, medium: 1, high: 2, urgent: 3 }

  # Scopes
  scope :for_user, ->(user) { where(user: user) }
  scope :by_type, ->(type) { where(goal_type: type) }
  scope :by_priority, ->(priority) { where(priority: priority) }
  scope :by_deadline, -> { order(target_date: :asc) }
  scope :deadline_approaching, -> { where('target_date <= ?', 30.days.from_now) }
  scope :overdue, -> { where('target_date < ? AND status = ?', Date.current, statuses[:active]) }

  # Callbacks
  before_create :set_default_values
  after_create :create_initial_milestones
  after_update :check_completion_status
  after_update :update_milestones_if_needed

  def progress_percentage
    return 0 if target_amount.zero?

    [(current_amount / target_amount * 100).round(2), 100].min
  end

  def remaining_amount
    [target_amount - current_amount, 0].max
  end

  def days_remaining
    return 0 if target_date < Date.current

    (target_date - Date.current).to_i
  end

  def is_overdue?
    target_date < Date.current && active?
  end

  def days_since_start
    (Date.current - created_at.to_date).to_i
  end

  def expected_progress_percentage
    return 100 if days_remaining <= 0

    total_days = (target_date - created_at.to_date).to_i
    elapsed_days = days_since_start
    return 100 if total_days <= 0

    [(elapsed_days.to_f / total_days * 100).round(2), 100].min
  end

  def is_on_track?
    progress_percentage >= expected_progress_percentage
  end

  def monthly_target
    return 0 if months_remaining <= 0

    remaining_amount / months_remaining
  end

  def months_remaining
    return 0 if target_date < Date.current

    ((target_date.year - Date.current.year) * 12 + target_date.month - Date.current.month).to_f
  end

  def next_milestone
    goal_milestones.where(status: :pending).order(:target_percentage).first
  end

  def completed_milestones_count
    goal_milestones.where(status: :completed).count
  end

  def total_milestones_count
    goal_milestones.count
  end

  def add_contribution(amount, description = nil, transaction_id = nil)
    contribution = goal_contributions.create!(
      amount: amount,
      description: description,
      transaction_id: transaction_id,
      contributed_at: Time.current
    )

    update_current_amount!
    check_milestones_completion
    contribution
  end

  def update_current_amount!
    new_amount = calculate_current_amount
    update!(current_amount: new_amount)
  end

  def can_be_shared?
    active? && !shared_goals.exists?
  end

  def share_with_users(user_ids, permissions = {})
    return false unless can_be_shared?

    user_ids.each do |user_id|
      shared_goals.create!(
        user_id: user_id,
        can_contribute: permissions[:can_contribute] || false,
        can_edit: permissions[:can_edit] || false,
        can_view_details: permissions[:can_view_details] || true
      )
    end

    true
  end

  def calculate_points_earned
    base_points = (progress_percentage * 10).to_i
    bonus_points = 0

    # Bonus for completing on time
    bonus_points += 100 if completed? && !is_overdue?

    # Bonus for high priority goals
    bonus_points += 50 if urgent?
    bonus_points += 25 if high?

    # Bonus for large amounts
    bonus_points += 50 if target_amount >= 10_000
    bonus_points += 25 if target_amount >= 5000

    base_points + bonus_points
  end

  private

  def target_date_in_future
    return unless target_date.present?

    errors.add(:target_date, 'deve ser uma data futura') if target_date <= Date.current
  end

  def current_amount_not_greater_than_target
    return unless current_amount.present? && target_amount.present?

    errors.add(:current_amount, 'não pode ser maior que o valor alvo') if current_amount > target_amount
  end

  def set_default_values
    self.current_amount ||= 0
    self.status ||= :active
    self.priority ||= :medium
  end

  def create_initial_milestones
    # Will be implemented by GoalMilestoneCreatorService
    # GoalMilestoneCreatorService.new(self).call
  end

  def check_completion_status
    if current_amount >= target_amount && !completed?
      complete_goal!
    elsif current_amount < target_amount && completed?
      reactivate_goal!
    end
  end

  def complete_goal!
    update!(status: :completed, completed_at: Time.current)
    create_completion_activity
    # send_completion_notification
    # award_completion_points
  end

  def reactivate_goal!
    update!(status: :active, completed_at: nil)
  end

  def update_milestones_if_needed
    return unless saved_change_to_target_amount? || saved_change_to_target_date?

    goal_milestones.destroy_all
    create_initial_milestones
  end

  def calculate_current_amount
    case goal_type
    when 'savings', 'debt_payoff', 'investment'
      goal_contributions.sum(:amount)
    when 'expense_reduction'
      calculate_expense_reduction_progress
    else
      goal_contributions.sum(:amount)
    end
  end

  def calculate_expense_reduction_progress
    return 0 unless category_id.present?

    baseline_amount = self.baseline_amount || 0
    current_period_expenses = user.transactions
                                  .where(transaction_type: :expense)
                                  .where(category_id: category_id)
                                  .where(date: Date.current.beginning_of_month..Date.current.end_of_month)
                                  .sum(:amount)

    saved_amount = [baseline_amount - current_period_expenses, 0].max
    [saved_amount, target_amount].min
  end

  def check_milestones_completion
    goal_milestones.where(status: :pending).each do |milestone|
      milestone.complete! if progress_percentage >= milestone.target_percentage
    end
  end

  def create_completion_activity
    goal_activities.create!(
      activity_type: 'goal_completed',
      description: "Meta '#{name}' foi concluída!",
      metadata: {
        target_amount: target_amount,
        final_amount: current_amount,
        days_taken: days_since_start,
        points_earned: calculate_points_earned
      }
    )
  end
end
