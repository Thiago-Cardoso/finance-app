class CreateUserAchievements < ActiveRecord::Migration[8.0]
  def change
    create_table :user_achievements do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.integer :badge_type, null: false
      t.string :title, null: false
      t.text :description
      t.integer :points_earned, default: 0, null: false
      t.datetime :earned_at, null: false

      t.timestamps
    end

    add_index :user_achievements, :badge_type
    add_index :user_achievements, [:user_id, :badge_type], unique: true
    add_index :user_achievements, :earned_at
  end
end
