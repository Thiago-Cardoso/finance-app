# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Transactions', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:category) { create(:category, :expense, user: user) }
  let(:income_category) { create(:category, :income, user: user) }
  let(:account) { create(:account, user: user, current_balance: 1000) }
  let(:transfer_account) { create(:account, user: user, current_balance: 500) }

  describe 'GET /api/v1/transactions' do
    let!(:transactions) { create_list(:transaction, 25, :expense, user: user, category: category, account: account) }

    context 'when authenticated' do
      it 'returns paginated transactions' do
        get '/api/v1/transactions', params: { page: 1, per_page: 10 }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data'].size).to eq(10)
        expect(json_response['meta']['pagination']['total_count']).to eq(25)
        expect(json_response['meta']['pagination']['current_page']).to eq(1)
      end

      it 'filters transactions by category' do
        target_transaction = create(:transaction, :expense, user: user, category: category, account: account)

        get '/api/v1/transactions', params: { category_id: category.id, per_page: 30 }, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response['data'].size).to eq(26)
      end

      it 'filters transactions by date range' do
        # Create transactions with specific dates for this test
        old_transaction = create(:transaction, :expense, user: user, category: category, account: account,
                                                date: 2.months.ago)
        recent_transaction = create(:transaction, :expense, user: user, category: category, account: account,
                                                    date: 1.day.ago)

        # Use a narrower date range that excludes the let! transactions and old_transaction
        date_from = 2.days.ago.to_date
        date_to = Date.current

        get '/api/v1/transactions',
            params: { date_from: date_from, date_to: date_to, per_page: 100 },
            headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        transaction_ids = json_response['data'].pluck('id')
        expect(transaction_ids).to include(recent_transaction.id)
        expect(transaction_ids).not_to include(old_transaction.id)
      end

      it 'filters transactions by transaction type' do
        expense = create(:transaction, :expense, user: user, category: category, account: account)
        income = create(:transaction, :income, user: user, category: income_category, account: account)

        get '/api/v1/transactions',
            params: { transaction_type: 'income' },
            headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        transaction_ids = json_response['data'].pluck('id')
        expect(transaction_ids).to include(income.id)
        expect(transaction_ids).not_to include(expense.id)
      end

      it 'searches transactions by description' do
        target = create(:transaction, :expense, user: user, category: category, account: account,
                                       description: 'Special Purchase')
        other = create(:transaction, :expense, user: user, category: category, account: account,
                                      description: 'Regular Expense')

        get '/api/v1/transactions',
            params: { search: 'Special' },
            headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        transaction_ids = json_response['data'].pluck('id')
        expect(transaction_ids).to include(target.id)
        expect(transaction_ids).not_to include(other.id)
      end

      it 'only returns transactions for current user' do
        other_transaction = create(:transaction, :expense, user: other_user)

        get '/api/v1/transactions', headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        transaction_ids = json_response['data'].pluck('id')
        expect(transaction_ids).not_to include(other_transaction.id)
      end
    end

    context 'when not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/transactions'

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['success']).to be false
      end
    end
  end

  describe 'GET /api/v1/transactions/:id' do
    let(:transaction) { create(:transaction, :expense, user: user, category: category, account: account) }

    context 'when authenticated' do
      it 'returns the transaction' do
        get "/api/v1/transactions/#{transaction.id}", headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']['id']).to eq(transaction.id)
        expect(json_response['data']['description']).to eq(transaction.description)
      end

      it 'returns 404 for non-existent transaction' do
        get '/api/v1/transactions/99999', headers: auth_headers(user)

        expect(response).to have_http_status(:not_found)
        expect(json_response['success']).to be false
      end

      it 'cannot access other user transactions' do
        other_transaction = create(:transaction, :expense, user: other_user)

        get "/api/v1/transactions/#{other_transaction.id}", headers: auth_headers(user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'POST /api/v1/transactions' do
    let(:transaction_params) do
      {
        transaction: {
          description: 'Test Expense',
          amount: 100.50,
          transaction_type: 'expense',
          date: Date.current.to_s,
          category_id: category.id,
          account_id: account.id
        }
      }
    end

    context 'when authenticated' do
      it 'creates a transaction successfully' do
        expect do
          post '/api/v1/transactions', params: transaction_params, headers: auth_headers(user)
        end.to change(Transaction, :count).by(1)

        expect(response).to have_http_status(:created)
        expect(json_response['success']).to be true
        expect(json_response['data']['description']).to eq('Test Expense')
        expect(json_response['data']['raw_amount']).to eq(100.50)
      end

      it 'updates account balance correctly for expense' do
        initial_balance = account.current_balance

        post '/api/v1/transactions', params: transaction_params, headers: auth_headers(user)

        account.reload
        expect(account.current_balance).to eq(initial_balance - 100.50)
      end

      it 'updates account balance correctly for income' do
        income_params = transaction_params.deep_merge(
          transaction: {
            transaction_type: 'income',
            category_id: income_category.id
          }
        )

        initial_balance = account.current_balance

        post '/api/v1/transactions', params: income_params, headers: auth_headers(user)

        account.reload
        expect(account.current_balance).to eq(initial_balance + 100.50)
      end

      it 'creates a transfer and updates both accounts' do
        transfer_params = {
          transaction: {
            description: 'Transfer',
            amount: 200,
            transaction_type: 'transfer',
            date: Date.current.to_s,
            account_id: account.id,
            transfer_account_id: transfer_account.id
          }
        }

        source_balance = account.current_balance
        target_balance = transfer_account.current_balance

        post '/api/v1/transactions', params: transfer_params, headers: auth_headers(user)

        expect(response).to have_http_status(:created)
        account.reload
        transfer_account.reload
        expect(account.current_balance).to eq(source_balance - 200)
        expect(transfer_account.current_balance).to eq(target_balance + 200)
      end

      it 'returns error for invalid data' do
        invalid_params = transaction_params.deep_merge(
          transaction: { amount: -100 }
        )

        post '/api/v1/transactions', params: invalid_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response['success']).to be false
        expect(json_response['errors']).to be_present
      end

      it 'validates future date' do
        future_params = transaction_params.deep_merge(
          transaction: { date: 1.day.from_now.to_s }
        )

        post '/api/v1/transactions', params: future_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response['errors']).to be_present
      end

      it 'validates transfer requires transfer_account' do
        transfer_params = transaction_params.deep_merge(
          transaction: {
            transaction_type: 'transfer',
            transfer_account_id: nil
          }
        )

        post '/api/v1/transactions', params: transfer_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_content)
      end
    end
  end

  describe 'PUT /api/v1/transactions/:id' do
    let!(:transaction) { create(:transaction, :expense, user: user, category: category, account: account, amount: 100) }

    context 'when authenticated' do
      it 'updates transaction successfully' do
        update_params = {
          transaction: {
            description: 'Updated Description',
            amount: 150
          }
        }

        put "/api/v1/transactions/#{transaction.id}", params: update_params, headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']['description']).to eq('Updated Description')
      end

      it 'updates account balance correctly when amount changes' do
        initial_balance = account.current_balance

        update_params = {
          transaction: { amount: 150 }
        }

        put "/api/v1/transactions/#{transaction.id}", params: update_params, headers: auth_headers(user)

        account.reload
        # Should revert old amount (+100) and apply new amount (-150)
        expect(account.current_balance).to eq(initial_balance + 100 - 150)
      end

      it 'returns error for invalid update' do
        update_params = {
          transaction: { amount: -50 }
        }

        put "/api/v1/transactions/#{transaction.id}", params: update_params, headers: auth_headers(user)

        expect(response).to have_http_status(:unprocessable_content)
        expect(json_response['success']).to be false
      end

      it 'cannot update other user transactions' do
        other_transaction = create(:transaction, :expense, user: other_user)

        update_params = {
          transaction: { description: 'Hacked' }
        }

        put "/api/v1/transactions/#{other_transaction.id}", params: update_params, headers: auth_headers(user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'DELETE /api/v1/transactions/:id' do
    let!(:transaction) { create(:transaction, :expense, user: user, category: category, account: account, amount: 100) }

    context 'when authenticated' do
      it 'deletes transaction successfully' do
        expect do
          delete "/api/v1/transactions/#{transaction.id}", headers: auth_headers(user)
        end.to change(Transaction, :count).by(-1)

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
      end

      it 'reverts account balance when deleted' do
        initial_balance = account.current_balance

        delete "/api/v1/transactions/#{transaction.id}", headers: auth_headers(user)

        account.reload
        # Should revert the expense (add back the amount)
        expect(account.current_balance).to eq(initial_balance + 100)
      end

      it 'cannot delete other user transactions' do
        other_transaction = create(:transaction, :expense, user: other_user)

        delete "/api/v1/transactions/#{other_transaction.id}", headers: auth_headers(user)

        expect(response).to have_http_status(:not_found)
      end
    end
  end

  describe 'GET /api/v1/transactions/summary' do
    let!(:income1) { create(:transaction, :income, user: user, amount: 1000, date: Date.current) }
    let!(:income2) { create(:transaction, :income, user: user, amount: 500, date: Date.current) }
    let!(:expense1) { create(:transaction, :expense, user: user, amount: 300, date: Date.current) }
    let!(:expense2) { create(:transaction, :expense, user: user, amount: 200, date: Date.current) }
    let!(:old_transaction) { create(:transaction, :income, user: user, amount: 999, date: 2.months.ago) }

    context 'when authenticated' do
      it 'returns summary for current month by default' do
        get '/api/v1/transactions/summary', headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']['total_income']).to eq(1500)
        expect(json_response['data']['total_expenses']).to eq(500)
        expect(json_response['data']['net_amount']).to eq(1000)
        expect(json_response['data']['transactions_count']).to eq(4)
      end

      it 'returns summary for custom date range' do
        get '/api/v1/transactions/summary',
            params: {
              start_date: 3.months.ago.to_date,
              end_date: Date.current
            },
            headers: auth_headers(user)

        expect(response).to have_http_status(:ok)
        expect(json_response['data']['total_income']).to eq(2499)
        expect(json_response['data']['transactions_count']).to eq(5)
      end
    end
  end
end
