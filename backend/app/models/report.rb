class Report < ApplicationRecord
  belongs_to :user

  # Enums
  enum :report_type, {
    financial_summary: 0,
    expense_breakdown: 1,
    income_analysis: 2,
    budget_performance: 3,
    category_analysis: 4,
    monthly_comparison: 5,
    yearly_overview: 6,
    cash_flow: 7,
    custom: 8
  }, prefix: true

  enum :period_type, {
    daily: 0,
    weekly: 1,
    monthly: 2,
    quarterly: 3,
    yearly: 4,
    custom_range: 5,
    all_time: 6
  }, prefix: true

  enum :status, {
    pending: 0,
    processing: 1,
    completed: 2,
    failed: 3
  }, prefix: true

  # Validations
  validates :name, presence: true, length: { minimum: 2, maximum: 100 }
  validates :report_type, presence: true
  validates :period_type, presence: true
  validates :status, presence: true

  # Scopes
  scope :recent, -> { order(generated_at: :desc) }
  scope :by_type, ->(type) { where(report_type: type) }
  scope :completed_reports, -> { where(status: :completed) }
  scope :pending_reports, -> { where(status: :pending) }

  # Callbacks
  before_create :set_default_status

  # Methods
  def mark_as_processing!
    update!(status: :processing)
  end

  def mark_as_completed!
    update!(status: :completed, generated_at: Time.current)
  end

  def mark_as_failed!
    update!(status: :failed)
  end

  def processing?
    status_processing?
  end

  def completed?
    status_completed?
  end

  def failed?
    status_failed?
  end

  def pending?
    status_pending?
  end

  private

  def set_default_status
    self.status ||= :pending
  end
end
