# frozen_string_literal: true

# Migration to create budgets table with ENUM type for budget periods
class CreateBudgets < ActiveRecord::Migration[8.0]
  def up
    # Create ENUM type for budget period
    execute <<-SQL
      CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'yearly');
    SQL

    create_table :budgets do |t|
      t.string :name, null: false, limit: 100
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.decimal :spent, precision: 12, scale: 2, default: 0.00
      t.column :period, :budget_period, null: false, default: 'monthly'
      t.date :start_date, null: false
      t.date :end_date, null: false
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.references :category, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :budgets, :user_id
    add_index :budgets, :category_id
    add_index :budgets, :period
    add_index :budgets, [:user_id, :category_id, :period, :start_date], unique: true, name: 'index_budgets_on_user_category_period'
  end

  def down
    drop_table :budgets
    execute <<-SQL
      DROP TYPE IF EXISTS budget_period;
    SQL
  end
end