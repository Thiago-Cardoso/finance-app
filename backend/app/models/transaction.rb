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
  validate :validate_future_date
  validate :validate_account_ownership
  validate :transfer_accounts_different

  # Scopes
  scope :for_user, ->(user) { where(user: user) }
  scope :by_type, ->(type) { where(transaction_type: type) }
  scope :by_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }
  scope :by_category, ->(category) { where(category: category) }
  scope :by_categories, ->(category_ids) { where(category_id: category_ids) }
  scope :by_account, ->(account) { where(account: account) }

  # Text search scope using pg_trgm similarity operator for better performance
  scope :search_description, lambda { |query|
    return all if query.blank?
    # Use pg_trgm similarity operator for fuzzy matching with trigram index
    where('description % ?', query)
  }

  # Date period scopes
  scope :recent, -> { order(date: :desc, created_at: :desc) }
  scope :this_month, -> { where(date: Date.current.all_month) }
  scope :last_month, -> { where(date: Date.current.last_month.all_month) }
  scope :this_year, -> { where(date: Date.current.all_year) }
  scope :last_year, -> { where(date: Date.current.last_year.all_year) }

  # Amount range scope
  scope :by_amount_range, lambda { |min_amount, max_amount|
    scope = all
    scope = scope.where('amount >= ?', min_amount) if min_amount.present?
    scope = scope.where('amount <= ?', max_amount) if max_amount.present?
    scope
  }

  # Sorting scopes
  scope :order_by_date, ->(direction = :desc) { order(date: direction, created_at: direction) }
  scope :order_by_amount, ->(direction = :desc) { order(amount: direction, date: :desc) }
  scope :order_by_description, ->(direction = :asc) { order(description: direction, date: :desc) }

  # DEPRECATED: This scope is deprecated in favor of filtered_search and TransactionFilterService
  # It will be removed in a future version to avoid code duplication
  # Use TransactionFilterService.call for consistent filtering across the application
  scope :apply_filters, lambda { |params|
    scope = all
    scope = scope.where(category_id: params[:category_id]) if params[:category_id].present?
    scope = scope.where(transaction_type: params[:transaction_type]) if params[:transaction_type].present?
    scope = scope.where(account_id: params[:account_id]) if params[:account_id].present?
    scope = scope.where(date: params[:date_from]..params[:date_to]) if params[:date_from] && params[:date_to]
    scope = scope.where('amount >= ?', params[:min_amount]) if params[:min_amount].present?
    scope = scope.where('amount <= ?', params[:max_amount]) if params[:max_amount].present?
    scope = scope.search_description(params[:search]) if params[:search].present?
    scope
  }

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

  def self.summary_for_period(user, start_date, end_date)
    transactions = for_user(user).where(date: start_date..end_date)

    {
      total_income: transactions.where(transaction_type: 'income').sum(:amount).to_f,
      total_expenses: transactions.where(transaction_type: 'expense').sum(:amount).to_f,
      net_amount: (transactions.where(transaction_type: 'income').sum(:amount) -
                  transactions.where(transaction_type: 'expense').sum(:amount)).to_f,
      transactions_count: transactions.count
    }
  end

  # Comprehensive filtering method
  def self.filtered_search(params = {})
    scope = all

    # Text search
    scope = scope.search_description(params[:search]) if params[:search].present?

    # Category filters
    if params[:category_id].present?
      scope = scope.by_category(params[:category_id])
    elsif params[:category_ids].present?
      scope = scope.by_categories(params[:category_ids])
    end

    # Transaction type filter
    scope = scope.by_type(params[:transaction_type]) if params[:transaction_type].present?

    # Account filter
    scope = scope.by_account(params[:account_id]) if params[:account_id].present?

    # Date filters
    if params[:period].present?
      scope = case params[:period]
              when 'this_month' then scope.this_month
              when 'last_month' then scope.last_month
              when 'this_year' then scope.this_year
              when 'last_year' then scope.last_year
              else scope
              end
    elsif params[:start_date].present? && params[:end_date].present?
      scope = scope.by_date_range(params[:start_date], params[:end_date])
    end

    # Amount range filter
    if params[:min_amount].present? || params[:max_amount].present?
      scope = scope.by_amount_range(params[:min_amount], params[:max_amount])
    end

    # Sorting
    scope = apply_sorting(scope, params[:sort_by], params[:sort_direction])

    scope
  end

  def self.apply_sorting(scope, sort_by, direction)
    direction = direction&.to_sym || :desc
    direction = :desc unless %i[asc desc].include?(direction)

    case sort_by&.to_s
    when 'amount'
      scope.order_by_amount(direction)
    when 'description'
      scope.order_by_description(direction)
    when 'date'
      scope.order_by_date(direction)
    else
      scope.order_by_date(:desc) # Default sorting
    end
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

    return if category.category_type == transaction_type

    errors.add(:category, 'type must match transaction type')
  end

  def validate_future_date
    return unless date && date > Date.current

    errors.add(:date, "can't be in the future")
  end

  def validate_account_ownership
    errors.add(:account, "doesn't belong to user") if account && account.user_id != user_id

    return unless transfer_account && transfer_account.user_id != user_id

    errors.add(:transfer_account, "doesn't belong to user")
  end

  def transfer_accounts_different
    return unless transfer? && account_id.present? && account_id == transfer_account_id

    errors.add(:transfer_account_id, "can't be the same as source account")
  end

  def update_account_balance
    account&.update_balance_from_transaction(self)
    transfer_account&.update_balance_from_transaction(self) if transfer?
  end

  def update_account_balance_on_change
    return unless saved_change_to_amount? || saved_change_to_transaction_type? || saved_change_to_account_id? || saved_change_to_transfer_account_id?

    # Revert the old transaction's effect
    if saved_change_to_amount?
      old_amount = amount_before_last_save
      revert_balance_with_amount(old_amount)
    elsif saved_change_to_transaction_type?
      old_type = transaction_type_before_last_save
      revert_balance_with_type(old_type)
    end

    # Apply the new transaction's effect
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

  def revert_balance_with_amount(old_amount)
    return unless account

    old_type = transaction_type_before_last_save || transaction_type
    case old_type
    when 'income'
      account.decrement(:current_balance, old_amount)
    when 'expense'
      account.increment(:current_balance, old_amount)
    when 'transfer'
      account.increment(:current_balance, old_amount)
      transfer_account&.decrement(:current_balance, old_amount)
    end

    account.save!
    transfer_account&.save! if old_type == 'transfer'
  end

  def revert_balance_with_type(old_type)
    return unless account

    case old_type
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
