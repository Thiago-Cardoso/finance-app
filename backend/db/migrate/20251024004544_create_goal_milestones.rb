class CreateGoalMilestones < ActiveRecord::Migration[8.0]
  def change
    create_table :goal_milestones do |t|
      t.references :goal, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.string :name, null: false, limit: 100
      t.decimal :target_percentage, precision: 5, scale: 2, null: false
      t.integer :reward_points, default: 0, null: false
      t.integer :status, default: 0, null: false
      t.datetime :completed_at
      t.text :description

      t.timestamps
    end

    add_index :goal_milestones, [:goal_id, :target_percentage], unique: true
    add_index :goal_milestones, :status
  end
end
