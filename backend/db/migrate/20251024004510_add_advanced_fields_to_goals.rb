class AddAdvancedFieldsToGoals < ActiveRecord::Migration[8.0]
  def change
    add_column :goals, :goal_type, :integer, default: 0, null: false
    add_column :goals, :priority, :integer, default: 1, null: false
    add_column :goals, :status, :integer, default: 0, null: false
    add_reference :goals, :category, foreign_key: { on_delete: :nullify }, index: true
    add_column :goals, :baseline_amount, :decimal, precision: 12, scale: 2
    add_column :goals, :completed_at, :datetime
    add_column :goals, :auto_track_progress, :boolean, default: false
    add_column :goals, :last_notification_progress, :decimal, precision: 5, scale: 2, default: 0

    # Rename title to name for consistency
    rename_column :goals, :title, :name

    # Add indexes for better performance
    add_index :goals, :goal_type
    add_index :goals, :priority
    add_index :goals, :status
    add_index :goals, [:user_id, :status]
  end
end
