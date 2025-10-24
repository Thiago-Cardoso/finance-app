class CreateGoalContributions < ActiveRecord::Migration[8.0]
  def change
    create_table :goal_contributions do |t|
      t.references :goal, null: false, foreign_key: { on_delete: :cascade }, index: true
      t.references :transaction, foreign_key: { on_delete: :nullify }, index: true
      t.references :contributor, foreign_key: { to_table: :users, on_delete: :nullify }
      t.decimal :amount, precision: 12, scale: 2, null: false
      t.text :description
      t.datetime :contributed_at, null: false

      t.timestamps
    end

    add_index :goal_contributions, :contributed_at
    add_index :goal_contributions, [:goal_id, :contributed_at]
  end
end
