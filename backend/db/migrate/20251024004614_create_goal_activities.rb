class CreateGoalActivities < ActiveRecord::Migration[8.0]
  def change
    create_table :goal_activities do |t|
      t.references :goal, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.string :activity_type, null: false
      t.text :description
      t.jsonb :metadata, default: {}

      t.timestamps
    end

    add_index :goal_activities, :activity_type
    add_index :goal_activities, [:goal_id, :created_at]
  end
end
