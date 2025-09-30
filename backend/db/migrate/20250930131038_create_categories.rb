# frozen_string_literal: true

# Migration to create categories table with ENUM type
class CreateCategories < ActiveRecord::Migration[8.0]
  def up
    # Create ENUM type for category type
    execute <<-SQL
      CREATE TYPE category_type AS ENUM ('income', 'expense');
    SQL

    create_table :categories do |t|
      t.string :name, null: false, limit: 100
      t.string :color, null: false, default: '#6366f1', limit: 7
      t.string :icon, limit: 50
      t.column :category_type, :category_type, null: false, default: 'expense'
      t.references :user, null: true, foreign_key: { on_delete: :cascade }, index: false
      t.boolean :is_default, default: false
      t.boolean :is_active, default: true

      t.timestamps
    end

    add_index :categories, :user_id
    add_index :categories, :category_type
    add_index :categories, [:user_id, :name], unique: true, where: "user_id IS NOT NULL"
  end

  def down
    drop_table :categories
    execute <<-SQL
      DROP TYPE IF EXISTS category_type;
    SQL
  end
end