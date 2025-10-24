class CreateSharedGoals < ActiveRecord::Migration[8.0]
  def change
    create_table :shared_goals do |t|
      t.references :goal, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.boolean :can_contribute, default: false
      t.boolean :can_edit, default: false
      t.boolean :can_view_details, default: true

      t.timestamps
    end

    add_index :shared_goals, [:goal_id, :user_id], unique: true
  end
end
