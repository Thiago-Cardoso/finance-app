# frozen_string_literal: true

# Migration to create accounts table with ENUM type for account types
class CreateAccounts < ActiveRecord::Migration[8.0]
  def up
    # Create ENUM type for account type
    execute <<-SQL
      CREATE TYPE account_type AS ENUM ('checking', 'savings', 'credit_card', 'investment', 'cash');
    SQL

    create_table :accounts do |t|
      t.string :name, null: false, limit: 100
      t.column :account_type, :account_type, null: false
      t.decimal :initial_balance, precision: 12, scale: 2, default: 0.00
      t.decimal :current_balance, precision: 12, scale: 2, default: 0.00
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :accounts, :user_id
    add_index :accounts, :account_type
  end

  def down
    drop_table :accounts
    execute <<-SQL
      DROP TYPE IF EXISTS account_type;
    SQL
  end
end