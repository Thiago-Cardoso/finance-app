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
  validates :current_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :goal_type, presence: true
  validates :target_date, presence: true
  validates :status, presence: true
  validate :current_amount_not_greater_than_target

  # Enums
  enum :goal_type, { savings: 0, debt_payoff: 1, investment: 2, expense_reduction: 3, general: 4 }
  enum :status, { active: 0, paused: 1, completed: 2, failed: 3, cancelled: 4 }
  enum :priority, { low: 0, medium: 1, high: 2, urgent: 3 }

  # Scopes
  scope :for_user, ->(user) { where(user: user) }
  scope :completed, -> { where(status: :completed) }
  scope :active, -> { where(status: [:active, :paused]) }
  scope :by_deadline, -> { order(target_date: :asc) }
  scope :overdue, -> { where('target_date < ? AND status = ?', Date.current, statuses[:active]) }

  # Callbacks
  before_validation :set_default_values
  after_save :check_completion_status

  def status=(val)
    @status_explicitly_assigned = true
    super(val)
  end

  def progress_percentage
    return 0.0 if target_amount.zero?

    [((current_amount.to_f / target_amount.to_f) * 100).round(2), 100.0].min
  end

  def remaining_amount
    [target_amount - current_amount, 0].max
  end

  def days_remaining
    return 0 if target_date.nil? || target_date < Date.current

    (target_date - Date.current).to_i
  end

  def is_overdue?
    return false if target_date.nil?
    target_date < Date.current && active?
  end

  def mark_as_achieved!
    update!(status: :completed, completed_at: Time.current)
  end

  def add_contribution(amount)
    return if amount <= 0

    new_current_amount = current_amount + amount
    final_amount = [new_current_amount, target_amount].min
    
    update!(current_amount: final_amount)
    
    if final_amount >= target_amount && active?
      mark_as_achieved!
    end
  end

  def monthly_target
    months_remaining_value = months_remaining
    return 0 if months_remaining_value <= 0

    (remaining_amount / months_remaining_value).round(2)
  end

  def completed?
    status == 'completed'
  end

  def active?
    status == 'active'
  end

  def is_on_track?
    return true if days_remaining.nil? || days_remaining <= 0
    return true if progress_percentage >= 100

    # Calculate expected progress based on time elapsed
    total_days = target_date.nil? ? 1 : (target_date - created_at.to_date).to_i
    days_elapsed = total_days - days_remaining
    expected_progress = total_days.zero? ? 0 : (days_elapsed.to_f / total_days * 100)

    # Goal is on track if actual progress is within 10% of expected progress
    progress_percentage >= (expected_progress - 10)
  end

  # Recalculate current_amount based on all contributions
  def update_current_amount!
    total_contributions = goal_contributions.sum(:amount)
    update!(current_amount: [total_contributions, target_amount].min)
  end

  private

  def current_amount_not_greater_than_target
    return unless current_amount.present? && target_amount.present?

    if current_amount > target_amount
      errors.add(:current_amount, 'não pode ser maior que o valor alvo')
    end
  end

  def set_default_values
    self.current_amount ||= 0
    # Only apply default status when it was not explicitly assigned by caller.
    unless instance_variable_defined?(:@status_explicitly_assigned) && @status_explicitly_assigned
      self.status ||= :active
    end
    self.priority ||= :medium
  end

  def check_completion_status
    if current_amount >= target_amount && active?
      mark_as_achieved!
    end
  end

  def months_remaining
    return 0 if target_date.nil? || target_date <= Date.current

    today = Date.current
    (target_date.year * 12 + target_date.month) - (today.year * 12 + today.month)
  end
end