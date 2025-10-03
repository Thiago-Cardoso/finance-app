class RemoveDuplicateUserDateIndex < ActiveRecord::Migration[8.0]
  def up
    # Remove the duplicate index as identified by Copilot review
    # Keep index_transactions_on_user_and_date and remove index_transactions_on_user_id_and_date
    remove_index :transactions, name: 'index_transactions_on_user_id_and_date'
  end

  def down
    # Re-add the index if needed to rollback
    add_index :transactions, [:user_id, :date], name: 'index_transactions_on_user_id_and_date'
  end
end
