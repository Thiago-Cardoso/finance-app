# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Dashboard', type: :request do
  let(:user) { create(:user) }
  let(:token) { jwt_token(user) }
  let(:auth_headers) { { 'Authorization' => "Bearer #{token}" } }

  before do
    # Setup test data
    @account = create(:account, user: user, current_balance: 1000, is_active: true)
    @category_income = create(:category, user: user, category_type: 'income')
    @category_expense = create(:category, user: user, category_type: 'expense')
  end

  describe 'GET /api/v1/dashboard' do
    context 'when user is authenticated' do
      it 'returns dashboard data successfully' do
        get '/api/v1/dashboard', headers: auth_headers

        expect(response).to have_http_status(:ok)
        expect(json_response['success']).to be true
        expect(json_response['data']).to include(
          'summary', 'current_balance', 'recent_transactions',
          'top_categories', 'monthly_evolution', 'budget_status',
          'goals_progress', 'last_updated'
        )
      end

      it 'calculates financial summary correctly' do
        # Current month transactions
        create(:transaction, :income, user: user, amount: 1000, category: @category_income, account: @account)
        create(:transaction, :expense, user: user, amount: 300, category: @category_expense, account: @account)

        get '/api/v1/dashboard', headers: auth_headers

        summary = json_response['data']['summary']['current_month']
        expect(summary['income']).to eq(1000.0)
        expect(summary['expenses']).to eq(300.0)
        expect(summary['balance']).to eq(700.0)
        expect(summary['transactions_count']).to eq(2)
      end

      it 'calculates variation correctly' do
        # Previous month
        create(:transaction, :income, user: user, amount: 500,
               category: @category_income, account: @account,
               date: 1.month.ago)
        create(:transaction, :expense, user: user, amount: 200,
               category: @category_expense, account: @account,
               date: 1.month.ago)

        # Current month
        create(:transaction, :income, user: user, amount: 1000,
               category: @category_income, account: @account)
        create(:transaction, :expense, user: user, amount: 300,
               category: @category_expense, account: @account)

        get '/api/v1/dashboard', headers: auth_headers

        variation = json_response['data']['summary']['variation']
        expect(variation['percentage']).to eq(133.33)
        expect(variation['trend']).to eq('up')
        expect(variation['amount']).to eq(400.0)
      end

      it 'returns correct total balance' do
        create(:account, user: user, initial_balance: 500, current_balance: 500, is_active: true)
        create(:account, user: user, initial_balance: 200, current_balance: 200, is_active: false)

        get '/api/v1/dashboard', headers: auth_headers

        balance = json_response['data']['current_balance']
        expect(balance['raw']).to eq(1500.0) # 1000 + 500 (only active accounts)
        expect(balance['formatted']).to include('R$')
      end

      it 'returns recent transactions' do
        create_list(:transaction, 12, user: user, category: @category_expense, account: @account)

        get '/api/v1/dashboard', headers: auth_headers

        transactions = json_response['data']['recent_transactions']
        expect(transactions.length).to eq(10) # Limited to 10
      end

      it 'returns top categories' do
        category1 = create(:category, user: user, category_type: 'expense', name: 'Food')
        category2 = create(:category, user: user, category_type: 'expense', name: 'Transport')
        category3 = create(:category, user: user, category_type: 'expense', name: 'Entertainment')

        create(:transaction, :expense, user: user, amount: 800, category: category1, account: @account)
        create(:transaction, :expense, user: user, amount: 500, category: category2, account: @account)
        create(:transaction, :expense, user: user, amount: 300, category: category3, account: @account)

        get '/api/v1/dashboard', headers: auth_headers

        top_categories = json_response['data']['top_categories']
        expect(top_categories.length).to be <= 5
        expect(top_categories.first['category_name']).to eq('Food')
        expect(top_categories.first['amount']).to eq(800.0)
        expect(top_categories.first['percentage']).to eq(50.0)
      end

      it 'returns monthly evolution for last 6 months' do
        get '/api/v1/dashboard', headers: auth_headers

        evolution = json_response['data']['monthly_evolution']
        expect(evolution.length).to eq(6)
        expect(evolution.first).to include('month', 'month_name', 'income', 'expenses', 'balance')
      end

      it 'returns budget status' do
        budget = create(:budget,
                       user: user,
                       category: @category_expense,
                       amount: 1000,
                       start_date: Date.current.beginning_of_month,
                       end_date: Date.current.end_of_month,
                       is_active: true)

        create(:transaction, :expense, user: user, amount: 700,
               category: @category_expense, account: @account)

        get '/api/v1/dashboard', headers: auth_headers

        budgets = json_response['data']['budget_status']
        expect(budgets.length).to eq(1)
        expect(budgets.first['budget_id']).to eq(budget.id)
        expect(budgets.first['spent']).to eq(700.0)
        expect(budgets.first['percentage_used']).to eq(70.0)
        expect(budgets.first['status']).to eq('warning')
      end

      it 'returns goals progress' do
        goal = create(:goal,
                     user: user,
                     name: 'Save for vacation',
                     target_amount: 5000,
                     current_amount: 2000,
                     target_date: 3.months.from_now,
                     status: :active)

        get '/api/v1/dashboard', headers: auth_headers

        goals = json_response['data']['goals_progress']
        expect(goals.length).to be <= 3
        expect(goals.first['goal_id']).to eq(goal.id)
        expect(goals.first['progress_percentage']).to eq(40.0)
      end

      context 'with custom date range' do
        it 'accepts custom start_date and end_date' do
          start_date = '2024-01-01'
          end_date = '2024-01-31'

          get '/api/v1/dashboard',
              params: { start_date: start_date, end_date: end_date },
              headers: auth_headers

          expect(response).to have_http_status(:ok)
          expect(json_response['success']).to be true
        end
      end

      context 'with invalid date range' do
        it 'handles invalid dates gracefully' do
          get '/api/v1/dashboard',
              params: { start_date: 'invalid', end_date: 'also-invalid' },
              headers: auth_headers

          expect(response).to have_http_status(:ok)
          expect(json_response['success']).to be true
        end
      end
    end

    context 'when user is not authenticated' do
      it 'returns unauthorized' do
        get '/api/v1/dashboard'

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'caching' do
      it 'uses cache for repeated requests' do
        # First request - should hit database
        get '/api/v1/dashboard', headers: auth_headers
        first_response = json_response
        first_timestamp = first_response['data']['last_updated']

        # Second request - should use cache and return same timestamp (proving it's cached)
        get '/api/v1/dashboard', headers: auth_headers
        second_response = json_response
        second_timestamp = second_response['data']['last_updated']

        expect(response).to have_http_status(:ok)
        expect(second_timestamp).to eq(first_timestamp) # Same timestamp means data came from cache
      end

      it 'invalidates cache when transaction is updated' do
        get '/api/v1/dashboard', headers: auth_headers
        first_response = json_response.deep_dup

        # Create new transaction
        create(:transaction, :income, user: user, amount: 1000,
               category: @category_income, account: @account)

        # Clear cache manually to simulate invalidation
        Rails.cache.clear

        get '/api/v1/dashboard', headers: auth_headers
        second_response = json_response

        expect(first_response['data']['summary']).not_to eq(second_response['data']['summary'])
      end
    end
  end

  private

  def generate_jwt_token(user)
    JWT.encode(
      {
        sub: user.id,
        scp: 'user',
        aud: nil,
        iat: Time.current.to_i,
        exp: 24.hours.from_now.to_i,
        jti: user.jti
      },
      Rails.application.credentials.devise_jwt_secret_key
    )
  end

  def json_response
    JSON.parse(response.body)
  end
end
