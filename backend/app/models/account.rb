# frozen_string_literal: true

# Account model for financial accounts management
class Account < ApplicationRecord
  ACCOUNT_TYPES = %w[checking savings credit_card investment cash].freeze

  # Associations
  belongs_to :user
  has_many :transactions, dependent: :nullify
  has_many :transfer_transactions, class_name: 'Transaction',
                                   foreign_key: 'transfer_account_id', dependent: :nullify

  # Validations
  validates :name, presence: true, length: { maximum: 100 }
  validates :account_type, inclusion: { in: ACCOUNT_TYPES }
  validates :initial_balance, :current_balance, presence: true,
                                                numericality: true

  # Scopes
  scope :active, -> { where(is_active: true) }
  scope :for_user, ->(user) { where(user: user) }
  scope :by_type, ->(type) { where(account_type: type) }

  # Callbacks
  after_create :set_current_balance_to_initial

  # Instance methods
  def update_balance_from_transaction(transaction)
    case transaction.transaction_type
    when 'income'
      increment(:current_balance, transaction.amount)
    when 'expense'
      decrement(:current_balance, transaction.amount)
    when 'transfer'
      if transaction.account_id == id
        decrement(:current_balance, transaction.amount)
      elsif transaction.transfer_account_id == id
        increment(:current_balance, transaction.amount)
      end
    end
    save!
  end

  def monthly_balance_evolution(months = 6)
    start_date = months.months.ago.beginning_of_month

    transactions
      .where(date: start_date..Date.current)
      .group_by_month(:date)
      .group(:transaction_type)
      .sum(:amount)
  end

  private

  def set_current_balance_to_initial
    update_column(:current_balance, initial_balance)
  end
end
