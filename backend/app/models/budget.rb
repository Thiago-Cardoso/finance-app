# frozen_string_literal: true

# Budget model for expense tracking and planning
class Budget < ApplicationRecord
  PERIODS = %w[weekly monthly yearly].freeze

  # Associations
  belongs_to :user
  belongs_to :category

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :spent, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :period, inclusion: { in: PERIODS }
  validates :start_date, presence: true
  validates :end_date, presence: true
  validate :end_date_after_start_date
  validate :category_must_be_expense_type

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :for_user, ->(user) { where(user: user) }
  scope :by_period, ->(period) { where(period: period) }
  scope :by_category, ->(category) { where(category: category) }
  scope :current, -> { where('start_date <= ? AND end_date >= ?', Date.current, Date.current) }
  scope :over_budget, -> { where('spent > amount') }

  # Callbacks
  after_create :calculate_spent_amount

  # Instance methods
  def percentage_used
    return 0 if amount.zero?

    ((spent / amount) * 100).round(2)
  end

  def remaining_amount
    amount - spent
  end

  def is_over_budget?
    spent > amount
  end

  def is_near_limit?(threshold = 0.9)
    percentage_used >= (threshold * 100)
  end

  def calculate_spent_amount
    spent_value = user.transactions
                      .where(category: category)
                      .where(transaction_type: 'expense')
                      .where(date: start_date..end_date)
                      .sum(:amount)

    update_column(:spent, spent_value)
  end

  def update_spent_from_transaction(transaction)
    return unless transaction.category_id == category_id
    return unless transaction.date.between?(start_date, end_date)

    return unless transaction.transaction_type == 'expense'

    increment(:spent, transaction.amount)
    save!
  end

  private

  def end_date_after_start_date
    return if end_date.blank? || start_date.blank?

    return unless end_date <= start_date

    errors.add(:end_date, 'must be after start date')
  end

  def category_must_be_expense_type
    return if category.blank?

    return unless category.category_type != 'expense'

    errors.add(:category, 'must be of type expense')
  end
end
