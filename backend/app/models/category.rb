# frozen_string_literal: true

# Category model for income and expense classification
class Category < ApplicationRecord
  CATEGORY_TYPES = %w[income expense].freeze
  COLORS = %w[#ef4444 #3b82f6 #10b981 #8b5cf6 #f59e0b #6b7280 #ec4899].freeze

  # Associations
  belongs_to :user, optional: true
  has_many :transactions, dependent: :restrict_with_error
  has_many :budgets, dependent: :restrict_with_error

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :category_type, inclusion: { in: CATEGORY_TYPES }
  validates :color, format: { with: /\A#[0-9A-Fa-f]{6}\z/ }
  validates :name, uniqueness: { scope: :user_id }, if: :user_id?

  # Scopes
  scope :defaults, -> { where(is_default: true) }
  scope :custom, -> { where(is_default: false) }
  scope :active, -> { where(is_active: true) }
  scope :for_type, ->(type) { where(category_type: type) }
  scope :for_user, ->(user) { where(user: user) }

  # Class methods
  def self.available_for_user(user)
    where('user_id = ? OR is_default = true', user.id).active
  end

  # Instance methods
  def total_spent_this_month(user)
    return 0 unless user

    current_month = Date.current.all_month
    transactions
      .where(user: user, date: current_month, transaction_type: category_type)
      .sum(:amount)
  end

  def usage_stats
    {
      transactions_count: transactions.count,
      total_amount_current_month: total_amount_this_month,
      can_be_deleted: can_be_deleted?
    }
  end

  def total_amount_this_month
    start_date = Date.current.beginning_of_month
    end_date = Date.current.end_of_month

    transactions.where(date: start_date..end_date).sum(:amount).abs
  end

  def can_be_deleted?
    !is_default? && transactions.empty?
  end
end
