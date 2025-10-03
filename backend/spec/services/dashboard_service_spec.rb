# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DashboardService, type: :service do
  let(:user) { create(:user) }
  let(:account) { create(:account, user: user, current_balance: 1000, is_active: true) }
  let(:category_income) { create(:category, user: user, category_type: 'income') }
  let(:category_expense) { create(:category, user: user, category_type: 'expense') }
  let(:service) { described_class.new(user) }

  describe '#call' do
    it 'returns dashboard data hash' do
      result = service.call

      expect(result).to be_a(Hash)
      expect(result).to include(
        :summary, :current_balance, :recent_transactions,
        :top_categories, :monthly_evolution, :budget_status, :goals_progress
      )
    end

    it 'caches the result' do
      expect(Rails.cache).to receive(:fetch).and_call_original
      service.call
    end
  end

  describe '#financial_summary' do
    it 'calculates current month summary correctly' do
      create(:transaction, :income, user: user, amount: 1000, category: category_income, account: account)
      create(:transaction, :expense, user: user, amount: 300, category: category_expense, account: account)

      result = service.send(:financial_summary)

      expect(result[:current_month][:income]).to eq(1000.0)
      expect(result[:current_month][:expenses]).to eq(300.0)
      expect(result[:current_month][:balance]).to eq(700.0)
      expect(result[:current_month][:transactions_count]).to eq(2)
    end

    it 'calculates previous month summary' do
      create(:transaction, :income, user: user, amount: 500,
             category: category_income, account: account,
             date: 1.month.ago)

      result = service.send(:financial_summary)

      expect(result[:previous_month][:income]).to eq(500.0)
    end

    it 'calculates variation percentage correctly' do
      # Previous month: 500 income - 200 expense = 300 balance
      create(:transaction, :income, user: user, amount: 500,
             category: category_income, account: account,
             date: 1.month.ago)
      create(:transaction, :expense, user: user, amount: 200,
             category: category_expense, account: account,
             date: 1.month.ago)

      # Current month: 1000 income - 300 expense = 700 balance
      create(:transaction, :income, user: user, amount: 1000,
             category: category_income, account: account)
      create(:transaction, :expense, user: user, amount: 300,
             category: category_expense, account: account)

      result = service.send(:financial_summary)

      # (700 - 300) / 300 * 100 = 133.33%
      expect(result[:variation][:percentage]).to eq(133.33)
      expect(result[:variation][:trend]).to eq('up')
      expect(result[:variation][:amount]).to eq(400.0)
    end

    it 'handles zero previous balance' do
      create(:transaction, :income, user: user, amount: 1000,
             category: category_income, account: account)

      result = service.send(:financial_summary)

      expect(result[:variation][:percentage]).to eq(0)
      expect(result[:variation][:trend]).to eq('stable')
    end
  end

  describe '#total_balance' do
    it 'sums only active accounts' do
      create(:account, user: user, current_balance: 500, is_active: true)
      create(:account, user: user, current_balance: 200, is_active: false)

      result = service.send(:total_balance)

      expect(result).to eq(1500.0) # 1000 + 500 (excluding inactive)
    end
  end

  describe '#recent_transactions' do
    it 'returns last 10 transactions' do
      create_list(:transaction, 12, user: user, category: category_expense, account: account)

      result = service.send(:recent_transactions)

      expect(result.length).to eq(10)
    end

    it 'orders by date and created_at descending' do
      old_transaction = create(:transaction, user: user, category: category_expense,
                               account: account, date: 3.days.ago)
      new_transaction = create(:transaction, user: user, category: category_expense,
                               account: account, date: 1.day.ago)

      result = service.send(:recent_transactions)

      expect(result.first[:id]).to eq(new_transaction.id)
      expect(result.last[:id]).to eq(old_transaction.id)
    end

    it 'includes category and account data' do
      create(:transaction, user: user, category: category_expense, account: account)

      result = service.send(:recent_transactions)

      expect(result.first).to include(:category, :account)
    end
  end

  describe '#top_categories' do
    it 'returns top 5 expense categories by amount' do
      6.times do |i|
        category = create(:category, user: user, category_type: 'expense', name: "Category #{i}")
        create(:transaction, :expense, user: user, amount: (i + 1) * 100,
               category: category, account: account)
      end

      result = service.send(:top_categories)

      expect(result.length).to eq(5)
      expect(result.first[:amount]).to eq(600.0) # Highest amount first
    end

    it 'calculates percentage correctly' do
      category1 = create(:category, user: user, category_type: 'expense')
      category2 = create(:category, user: user, category_type: 'expense')

      create(:transaction, :expense, user: user, amount: 800,
             category: category1, account: account)
      create(:transaction, :expense, user: user, amount: 200,
             category: category2, account: account)

      result = service.send(:top_categories)

      expect(result.first[:percentage]).to eq(80.0)
      expect(result.second[:percentage]).to eq(20.0)
    end

    it 'includes only current month expenses' do
      category = create(:category, user: user, category_type: 'expense')

      # Current month
      create(:transaction, :expense, user: user, amount: 500,
             category: category, account: account)

      # Last month (should be excluded)
      create(:transaction, :expense, user: user, amount: 1000,
             category: category, account: account,
             date: 1.month.ago)

      result = service.send(:top_categories)

      expect(result.first[:amount]).to eq(500.0)
    end
  end

  describe '#monthly_evolution' do
    it 'returns data for last 6 months' do
      result = service.send(:monthly_evolution)

      expect(result.length).to eq(6)
    end

    it 'includes month name and formatted date' do
      result = service.send(:monthly_evolution)

      expect(result.first).to include(:month, :month_name, :income, :expenses, :balance)
      expect(result.first[:month]).to match(/\d{4}-\d{2}/)
    end

    it 'calculates balance correctly for each month' do
      # Create transactions for 2 months ago
      date_2_months_ago = 2.months.ago.beginning_of_month
      create(:transaction, :income, user: user, amount: 1000,
             category: category_income, account: account,
             date: date_2_months_ago)
      create(:transaction, :expense, user: user, amount: 400,
             category: category_expense, account: account,
             date: date_2_months_ago)

      result = service.send(:monthly_evolution)
      month_data = result.find { |m| m[:month] == date_2_months_ago.strftime('%Y-%m') }

      expect(month_data[:income]).to eq(1000.0)
      expect(month_data[:expenses]).to eq(400.0)
      expect(month_data[:balance]).to eq(600.0)
    end
  end

  describe '#budget_status' do
    it 'returns current active budgets' do
      budget = create(:budget,
                     user: user,
                     category: category_expense,
                     amount_limit: 1000,
                     start_date: Date.current.beginning_of_month,
                     end_date: Date.current.end_of_month,
                     is_active: true)

      result = service.send(:budget_status)

      expect(result.length).to eq(1)
      expect(result.first[:budget_id]).to eq(budget.id)
    end

    it 'calculates spent amount correctly' do
      budget = create(:budget,
                     user: user,
                     category: category_expense,
                     amount_limit: 1000,
                     start_date: Date.current.beginning_of_month,
                     end_date: Date.current.end_of_month,
                     is_active: true)

      create(:transaction, :expense, user: user, amount: 700,
             category: category_expense, account: account)

      result = service.send(:budget_status)

      expect(result.first[:spent]).to eq(700.0)
      expect(result.first[:remaining]).to eq(300.0)
      expect(result.first[:percentage_used]).to eq(70.0)
    end

    it 'determines budget status correctly' do
      budget = create(:budget,
                     user: user,
                     category: category_expense,
                     amount_limit: 1000,
                     start_date: Date.current.beginning_of_month,
                     end_date: Date.current.end_of_month,
                     is_active: true)

      # Test 'safe' status (0-60%)
      create(:transaction, :expense, user: user, amount: 500,
             category: category_expense, account: account)
      expect(service.send(:budget_status).first[:status]).to eq('safe')

      # Test 'warning' status (61-80%)
      create(:transaction, :expense, user: user, amount: 200,
             category: category_expense, account: account)
      expect(service.send(:budget_status).first[:status]).to eq('warning')

      # Test 'danger' status (81-100%)
      create(:transaction, :expense, user: user, amount: 150,
             category: category_expense, account: account)
      expect(service.send(:budget_status).first[:status]).to eq('danger')

      # Test 'exceeded' status (>100%)
      create(:transaction, :expense, user: user, amount: 200,
             category: category_expense, account: account)
      expect(service.send(:budget_status).first[:status]).to eq('exceeded')
    end

    it 'excludes inactive budgets' do
      create(:budget,
            user: user,
            category: category_expense,
            is_active: false,
            start_date: Date.current.beginning_of_month,
            end_date: Date.current.end_of_month)

      result = service.send(:budget_status)

      expect(result).to be_empty
    end
  end

  describe '#goals_progress' do
    it 'returns up to 3 unachieved goals' do
      create_list(:goal, 5, user: user, is_achieved: false, target_date: 3.months.from_now)

      result = service.send(:goals_progress)

      expect(result.length).to eq(3)
    end

    it 'calculates progress percentage correctly' do
      goal = create(:goal,
                   user: user,
                   target_amount: 5000,
                   current_amount: 2000,
                   is_achieved: false,
                   target_date: 3.months.from_now)

      result = service.send(:goals_progress)

      expect(result.first[:progress_percentage]).to eq(40.0)
    end

    it 'calculates days remaining' do
      target_date = 30.days.from_now.to_date
      goal = create(:goal,
                   user: user,
                   target_date: target_date,
                   is_achieved: false)

      result = service.send(:goals_progress)

      expect(result.first[:days_remaining]).to eq(30)
    end

    it 'excludes achieved goals' do
      create(:goal, user: user, is_achieved: true)
      create(:goal, user: user, is_achieved: false)

      result = service.send(:goals_progress)

      expect(result.length).to eq(1)
      expect(result.first[:goal_id]).not_to eq(Goal.find_by(is_achieved: true).id)
    end

    it 'handles zero target amount' do
      goal = create(:goal,
                   user: user,
                   target_amount: 0,
                   current_amount: 100,
                   is_achieved: false)

      result = service.send(:goals_progress)

      expect(result.first[:progress_percentage]).to eq(0)
    end
  end

  describe 'custom date range' do
    it 'accepts custom start_date and end_date' do
      start_date = '2024-01-01'
      end_date = '2024-01-31'

      service = described_class.new(user, { start_date: start_date, end_date: end_date })
      result = service.call

      expect(result).to be_a(Hash)
    end

    it 'handles invalid dates gracefully' do
      service = described_class.new(user, { start_date: 'invalid', end_date: 'also-invalid' })

      expect { service.call }.not_to raise_error
    end
  end
end
