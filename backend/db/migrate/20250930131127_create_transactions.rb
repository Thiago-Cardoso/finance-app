# frozen_string_literal: true

# Migration to create transactions table with ENUM type for transaction types
class CreateTransactions < ActiveRecord::Migration[8.0]
  def up
    # Create ENUM type for transaction type
    execute <<-SQL
      CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer');
    SQL

    create_table :transactions do |t|
      t.string :description, null: false
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.column :transaction_type, :transaction_type, null: false
      t.date :date, null: false
      t.text :notes
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.references :category, null: true, foreign_key: { on_delete: :nullify }, index: false
      t.references :account, null: true, foreign_key: { on_delete: :nullify }, index: false
      t.bigint :transfer_account_id

      t.timestamps
    end

    add_foreign_key :transactions, :accounts, column: :transfer_account_id, on_delete: :nullify

    add_index :transactions, :user_id
    add_index :transactions, :category_id
    add_index :transactions, :account_id
    add_index :transactions, :date
    add_index :transactions, :transaction_type
    add_index :transactions, [:user_id, :date]
  end

  def down
    drop_table :transactions
    execute <<-SQL
      DROP TYPE IF EXISTS transaction_type;
    SQL
  end
end