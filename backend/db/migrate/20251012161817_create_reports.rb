class CreateReports < ActiveRecord::Migration[8.0]
  def change
    create_table :reports do |t|
      t.string :name, null: false
      t.integer :report_type, null: false, default: 0
      t.integer :period_type, null: false, default: 0
      t.integer :status, null: false, default: 0
      t.jsonb :filter_criteria, default: {}
      t.references :user, null: false, foreign_key: true
      t.datetime :generated_at

      t.timestamps
    end

    add_index :reports, :report_type
    add_index :reports, :status
    add_index :reports, :generated_at
    add_index :reports, [:user_id, :report_type]
  end
end
