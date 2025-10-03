class AddDashboardIndexes < ActiveRecord::Migration[8.0]
  def change
    # Composite indexes for dashboard queries - optimized for common filter combinations
    add_index :transactions, [:user_id, :date, :transaction_type],
              name: 'index_transactions_on_user_date_type',
              if_not_exists: true

    add_index :transactions, [:user_id, :created_at],
              name: 'index_transactions_on_user_created',
              if_not_exists: true

    add_index :transactions, [:user_id, :category_id, :date],
              name: 'index_transactions_on_user_category_date',
              if_not_exists: true

    add_index :accounts, [:user_id, :is_active],
              name: 'index_accounts_on_user_active',
              if_not_exists: true

    add_index :budgets, [:user_id, :is_active, :start_date, :end_date],
              name: 'index_budgets_on_user_active_dates',
              if_not_exists: true

    add_index :goals, [:user_id, :is_achieved, :target_date],
              name: 'index_goals_on_user_achieved_target',
              if_not_exists: true
  end
end
