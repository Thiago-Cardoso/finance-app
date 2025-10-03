class AddSearchIndexesToTransactions < ActiveRecord::Migration[8.0]
  def change
    # GIN index for fast text search using pg_trgm
    add_index :transactions, :description, using: :gin, opclass: :gin_trgm_ops,
              name: 'index_transactions_on_description_trgm'

    # Composite indexes for common filter combinations
    add_index :transactions, [:user_id, :date], name: 'index_transactions_on_user_and_date'
    add_index :transactions, [:user_id, :transaction_type], name: 'index_transactions_on_user_and_type'
    add_index :transactions, [:user_id, :category_id], name: 'index_transactions_on_user_and_category'
    add_index :transactions, [:user_id, :account_id], name: 'index_transactions_on_user_and_account'

    # Index for amount range queries
    add_index :transactions, [:user_id, :amount], name: 'index_transactions_on_user_and_amount'

    # Composite index for date + amount (common sorting combinations)
    add_index :transactions, [:user_id, :date, :amount], name: 'index_transactions_on_user_date_amount'
  end
end
