# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Categories', type: :request do
  let(:user) { create(:user) }
  let(:other_user) { create(:user) }
  let(:headers) { auth_headers(user) }

  describe 'GET /api/v1/categories' do
    let!(:default_category) { create(:category, :default, name: 'Groceries', category_type: 'expense') }
    let!(:user_category) { create(:category, :custom, user: user, name: 'Custom Category', category_type: 'expense') }
    let!(:other_user_category) { create(:category, :custom, user: other_user, name: 'Other User Category') }
    let!(:inactive_category) { create(:category, :inactive, name: 'Inactive Category') }

    it 'returns user available categories (default + user custom)' do
      get '/api/v1/categories', headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['data'].size).to eq(2) # default + user category

      category_names = json_response['data'].map { |cat| cat['name'] }
      expect(category_names).to include('Groceries', 'Custom Category')
      expect(category_names).not_to include('Other User Category', 'Inactive Category')
    end

    it 'filters by category type (expense)' do
      income_category = create(:category, :default, category_type: 'income')

      get '/api/v1/categories', params: { category_type: 'expense' }, headers: headers

      expect(response).to have_http_status(:ok)
      returned_types = json_response['data'].map { |cat| cat['category_type'] }.uniq
      expect(returned_types).to eq(['expense'])
    end

    it 'filters by category type (income)' do
      income_category = create(:category, :default, category_type: 'income')

      get '/api/v1/categories', params: { category_type: 'income' }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(1)
      expect(json_response['data'].first['category_type']).to eq('income')
    end

    it 'requires authentication' do
      get '/api/v1/categories'

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/categories/:id' do
    let(:category) { create(:category, :default) }

    it 'returns category details' do
      get "/api/v1/categories/#{category.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['data']['id']).to eq(category.id)
      expect(json_response['data']['name']).to eq(category.name)
    end

    it 'returns usage_stats in response' do
      get "/api/v1/categories/#{category.id}", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data']['usage_stats']).to be_present
      expect(json_response['data']['usage_stats']).to have_key('transactions_count')
      expect(json_response['data']['usage_stats']).to have_key('total_amount_current_month')
      expect(json_response['data']['usage_stats']).to have_key('can_be_deleted')
    end

    it 'returns 404 for non-existent category' do
      get '/api/v1/categories/99999', headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it 'requires authentication' do
      get "/api/v1/categories/#{category.id}"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'POST /api/v1/categories' do
    let(:valid_params) do
      {
        category: {
          name: 'New Category',
          color: '#ff0000',
          icon: '🎯',
          category_type: 'expense'
        }
      }
    end

    it 'creates a new category' do
      expect {
        post '/api/v1/categories', params: valid_params, headers: headers
      }.to change(user.categories, :count).by(1)

      expect(response).to have_http_status(:created)
      expect(json_response['success']).to be true
      expect(json_response['data']['name']).to eq('New Category')
      expect(json_response['data']['is_default']).to be_falsey
      expect(json_response['data']['user_id']).to eq(user.id)
    end

    it 'validates required fields' do
      invalid_params = { category: { name: '' } }

      post '/api/v1/categories', params: invalid_params, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(json_response['success']).to be false
      expect(json_response['errors']).to be_present
    end

    it 'validates color format' do
      invalid_params = valid_params.deep_merge(category: { color: 'invalid-color' })

      post '/api/v1/categories', params: invalid_params, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'validates category_type' do
      invalid_params = valid_params.deep_merge(category: { category_type: 'invalid' })

      post '/api/v1/categories', params: invalid_params, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'requires authentication' do
      post '/api/v1/categories', params: valid_params

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'PATCH /api/v1/categories/:id' do
    let(:user_category) { create(:category, :custom, user: user, name: 'Old Name') }
    let(:update_params) do
      {
        category: {
          name: 'Updated Name',
          color: '#00ff00'
        }
      }
    end

    it 'updates category' do
      patch "/api/v1/categories/#{user_category.id}", params: update_params, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['data']['name']).to eq('Updated Name')
      expect(json_response['data']['color']).to eq('#00ff00')
    end

    it 'prevents updating default categories' do
      default_category = create(:category, :default)

      patch "/api/v1/categories/#{default_category.id}", params: update_params, headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(json_response['message']).to include('Cannot modify default')
    end

    it 'prevents updating other users categories' do
      other_user_category = create(:category, :custom, user: other_user)

      patch "/api/v1/categories/#{other_user_category.id}", params: update_params, headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it 'validates update params' do
      invalid_params = { category: { name: '' } }

      patch "/api/v1/categories/#{user_category.id}", params: invalid_params, headers: headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it 'requires authentication' do
      patch "/api/v1/categories/#{user_category.id}", params: update_params

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'DELETE /api/v1/categories/:id' do
    it 'deletes user category without transactions' do
      category = create(:category, :custom, user: user)

      expect {
        delete "/api/v1/categories/#{category.id}", headers: headers
      }.to change(Category, :count).by(-1)

      expect(response).to have_http_status(:no_content)
    end

    it 'prevents deletion of default categories' do
      category = create(:category, :default)

      delete "/api/v1/categories/#{category.id}", headers: headers

      expect(response).to have_http_status(:forbidden)
      expect(Category.exists?(category.id)).to be_truthy
    end

    it 'prevents deletion of categories with transactions' do
      category = create(:category, :custom, user: user)
      account = create(:account, user: user)
      create(:transaction, :expense, user: user, category: category, account: account)

      delete "/api/v1/categories/#{category.id}", headers: headers

      expect(response).to have_http_status(:unprocessable_content)
      expect(Category.exists?(category.id)).to be_truthy
    end

    it 'prevents deleting other users categories' do
      category = create(:category, :custom, user: other_user)

      delete "/api/v1/categories/#{category.id}", headers: headers

      expect(response).to have_http_status(:not_found)
    end

    it 'requires authentication' do
      category = create(:category, :custom, user: user)

      delete "/api/v1/categories/#{category.id}"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/categories/:id/transactions' do
    let(:category) { create(:category, :default) }
    let(:account) { create(:account, user: user) }

    before do
      create_list(:transaction, 5, :expense, user: user, category: category, account: account)
      create_list(:transaction, 3, :expense, user: other_user, category: category, account: create(:account, user: other_user))
    end

    it 'returns transactions for category (only user transactions)' do
      get "/api/v1/categories/#{category.id}/transactions", headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['data'].size).to eq(5) # Only user's transactions
    end

    it 'includes pagination meta' do
      get "/api/v1/categories/#{category.id}/transactions", headers: headers

      expect(json_response['meta']).to be_present
      expect(json_response['meta']['pagination']).to have_key('current_page')
      expect(json_response['meta']['pagination']).to have_key('total_pages')
      expect(json_response['meta']['pagination']).to have_key('total_count')
    end

    it 'supports pagination' do
      get "/api/v1/categories/#{category.id}/transactions", params: { page: 1, per_page: 2 }, headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['data'].size).to eq(2)
    end

    it 'requires authentication' do
      get "/api/v1/categories/#{category.id}/transactions"

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe 'GET /api/v1/categories/statistics' do
    let(:account) { create(:account, user: user) }
    let(:category1) { create(:category, :default, category_type: 'expense') }
    let(:category2) { create(:category, :custom, user: user, category_type: 'expense') }

    before do
      create(:transaction, :expense, user: user, category: category1, account: account, amount: 100, date: Date.current)
      create(:transaction, :expense, user: user, category: category2, account: account, amount: 50, date: Date.current)
    end

    it 'returns category statistics' do
      get '/api/v1/categories/statistics', headers: headers

      expect(response).to have_http_status(:ok)
      expect(json_response['success']).to be true
      expect(json_response['data']).to be_present
    end

    it 'includes summary statistics' do
      get '/api/v1/categories/statistics', headers: headers

      expect(json_response['data']['summary']).to be_present
      expect(json_response['data']['summary']).to have_key('total_categories')
      expect(json_response['data']['summary']).to have_key('active_categories')
      expect(json_response['data']['summary']).to have_key('categories_with_transactions')
      expect(json_response['data']['summary']).to have_key('unused_categories')
    end

    it 'includes top categories' do
      get '/api/v1/categories/statistics', headers: headers

      expect(json_response['data']['top_categories']).to be_present
      expect(json_response['data']['top_categories']).to be_an(Array)
    end

    it 'includes monthly breakdown' do
      get '/api/v1/categories/statistics', headers: headers

      expect(json_response['data']['monthly_breakdown']).to be_present
    end

    it 'includes category trends' do
      get '/api/v1/categories/statistics', headers: headers

      # Verifica que a chave existe, mesmo que esteja vazia
      expect(json_response['data']).to have_key('category_trends')
      expect(json_response['data']['category_trends']).to be_a(Hash)
    end

    it 'supports date range filters' do
      start_date = 1.month.ago.to_date
      end_date = Date.current

      get '/api/v1/categories/statistics',
          params: { start_date: start_date.to_s, end_date: end_date.to_s },
          headers: headers

      expect(response).to have_http_status(:ok)
    end

    it 'requires authentication' do
      get '/api/v1/categories/statistics'

      expect(response).to have_http_status(:unauthorized)
    end
  end
end
