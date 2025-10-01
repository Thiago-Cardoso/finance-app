# frozen_string_literal: true

# Transaction model for income, expense, and transfer records
class Transaction < ApplicationRecord
  TRANSACTION_TYPES = %w[income expense transfer].freeze

  # Associations
  belongs_to :user
  belongs_to :category, optional: true
  belongs_to :account, optional: true
  belongs_to :transfer_account, class_name: 'Account', optional: true

  # Validations
  validates :description, presence: true, length: { maximum: 255 }
  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, inclusion: { in: TRANSACTION_TYPES }
  validates :date, presence: true
  validate :transfer_must_have_transfer_account
  validate :category_type_matches_transaction_type

  # Scopes
  scope :for_user, ->(user) { where(user: user) }
  scope :by_type, ->(type) { where(transaction_type: type) }
  scope :by_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_account, ->(account) { where(account: account) }
  scope :recent, -> { order(date: :desc, created_at: :desc) }
  scope :this_month, -> { where(date: Date.current.all_month) }
  scope :this_year, -> { where(date: Date.current.all_year) }

  # Callbacks
  after_create :update_account_balance
  after_update :update_account_balance_on_change
  after_destroy :revert_account_balance

  # Class methods
  def self.monthly_summary(user, date = Date.current)
    month_range = date.all_month
    transactions = for_user(user).by_date_range(month_range.first, month_range.last)

    {
      income: transactions.by_type('income').sum(:amount),
      expenses: transactions.by_type('expense').sum(:amount),
      net: transactions.by_type('income').sum(:amount) - transactions.by_type('expense').sum(:amount),
      count: transactions.count
    }
  end

  # Instance methods
  def income?
    transaction_type == 'income'
  end

  def expense?
    transaction_type == 'expense'
  end

  def transfer?
    transaction_type == 'transfer'
  end

  private

  def transfer_must_have_transfer_account
    return unless transfer? && transfer_account_id.blank?

    errors.add(:transfer_account, 'must be present for transfer transactions')
  end

  def category_type_matches_transaction_type
    return if category.blank? || transfer?

    return unless category.category_type != transaction_type

    errors.add(:category, 'type must match transaction type')
  end

  def update_account_balance
    account&.update_balance_from_transaction(self)
    transfer_account&.update_balance_from_transaction(self) if transfer?
  end

  def update_account_balance_on_change
    return unless saved_change_to_amount? || saved_change_to_transaction_type?

    account&.update_balance_from_transaction(self)
    transfer_account&.update_balance_from_transaction(self) if transfer?
  end

  def revert_account_balance
    return unless account

    case transaction_type
    when 'income'
      account.decrement(:current_balance, amount)
    when 'expense'
      account.increment(:current_balance, amount)
    when 'transfer'
      account.increment(:current_balance, amount)
      transfer_account&.decrement(:current_balance, amount)
    end

    account.save!
    transfer_account&.save! if transfer?
  end
end
