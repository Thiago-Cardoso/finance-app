# frozen_string_literal: true

# Migration to create goals table for financial goals tracking
class CreateGoals < ActiveRecord::Migration[8.0]
  def change
    create_table :goals do |t|
      t.string :title, null: false, limit: 255
      t.text :description
      t.decimal :target_amount, precision: 12, scale: 2, null: false
      t.decimal :current_amount, precision: 12, scale: 2, default: 0.00
      t.date :target_date
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: false
      t.boolean :is_achieved, default: false

      t.timestamps
    end

    add_index :goals, :user_id
    add_index :goals, :target_date
    add_index :goals, :is_achieved
  end
end