# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CategoryStatisticsService, type: :service do
  let(:user) { create(:user) }
  let(:account) { create(:account, user: user) }
  let(:category1) { create(:category, :default, name: 'Category 1', category_type: 'expense') }
  let(:category2) { create(:category, :custom, user: user, name: 'Category 2', category_type: 'expense') }
  let(:category3) { create(:category, :default, name: 'Category 3', category_type: 'income') }
  let(:unused_category) { create(:category, :default, name: 'Unused Category') }

  describe '#call' do
    it 'returns statistics hash with all sections' do
      service = described_class.new(user)
      result = service.call

      expect(result).to be_a(Hash)
      expect(result.keys).to match_array(%i[summary top_categories monthly_breakdown category_trends])
    end
  end

  describe '#category_summary' do
    before do
      create(:transaction, :expense, user: user, category: category1, account: account, amount: 100)
      create(:transaction, :expense, user: user, category: category2, account: account, amount: 50)
      unused_category # Create but don't use
    end

    it 'returns correct summary statistics' do
      service = described_class.new(user)
      summary = service.send(:category_summary)

      expect(summary[:total_categories]).to eq(4) # 3 used + 1 unused
      expect(summary[:active_categories]).to eq(4) # All are active
      expect(summary[:categories_with_transactions]).to eq(2) # category1 and category2
      expect(summary[:unused_categories]).to eq(2) # category3 and unused_category
    end

    it 'counts only active categories' do
      inactive_category = create(:category, :inactive, name: 'Inactive')

      service = described_class.new(user)
      summary = service.send(:category_summary)

      # Should not count inactive category (total remains 4)
      expect(summary[:total_categories]).to eq(4) # Still 4 because inactive is filtered out
    end
  end

  describe '#top_categories_by_amount' do
    before do
      # Create transactions with different amounts
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 500, date: Date.current)
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 300, date: Date.current)
      create(:transaction, :expense, user: user, category: category2, account: account,
                                     amount: 100, date: Date.current)
    end

    it 'returns categories sorted by total amount' do
      service = described_class.new(user)
      top_categories = service.send(:top_categories_by_amount)

      expect(top_categories).to be_an(Array)
      expect(top_categories.first[:name]).to eq('Category 1')
      expect(top_categories.first[:total_amount]).to eq(800) # 500 + 300
      expect(top_categories.first[:transactions_count]).to eq(2)

      expect(top_categories.second[:name]).to eq('Category 2')
      expect(top_categories.second[:total_amount]).to eq(100)
      expect(top_categories.second[:transactions_count]).to eq(1)
    end

    it 'limits results to top 10' do
      # Create 15 categories with transactions
      15.times do |i|
        cat = create(:category, :default, name: "Category #{i + 10}")
        create(:transaction, :expense, user: user, category: cat, account: account, amount: i * 10)
      end

      service = described_class.new(user)
      top_categories = service.send(:top_categories_by_amount)

      expect(top_categories.size).to eq(10)
    end

    it 'respects date range' do
      old_transaction = create(:transaction, :expense, user: user, category: category1,
                                                       account: account, amount: 1000, date: 1.year.ago)

      service = described_class.new(user, { start_date: 1.month.ago.to_s, end_date: Date.current.to_s })
      top_categories = service.send(:top_categories_by_amount)

      # Old transaction should not be included
      category1_data = top_categories.find { |c| c[:name] == 'Category 1' }
      expect(category1_data[:total_amount]).to eq(800) # Not including 1000 from old transaction
    end
  end

  describe '#monthly_breakdown' do
    before do
      # Create transactions in different months
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 100, date: Date.current)
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 150, date: Date.current)
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 200, date: 1.month.ago)
      create(:transaction, :expense, user: user, category: category2, account: account,
                                     amount: 50, date: Date.current)
    end

    it 'groups transactions by category and month' do
      service = described_class.new(user)
      breakdown = service.send(:monthly_breakdown)

      expect(breakdown).to be_a(Hash)
      expect(breakdown.keys).to include('Category 1', 'Category 2')

      category1_data = breakdown['Category 1']
      expect(category1_data[:id]).to eq(category1.id)
      expect(category1_data[:months]).to be_a(Hash)

      current_month = Date.current.strftime('%Y-%m')
      previous_month = 1.month.ago.strftime('%Y-%m')

      expect(category1_data[:months][current_month]).to eq(250) # 100 + 150
      expect(category1_data[:months][previous_month]).to eq(200)
    end

    it 'uses absolute values for amounts' do
      # Create negative amount (which might happen in transfers)
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: -50, date: Date.current)

      service = described_class.new(user)
      breakdown = service.send(:monthly_breakdown)

      current_month = Date.current.strftime('%Y-%m')
      category1_data = breakdown['Category 1']

      # Should sum absolute values
      expect(category1_data[:months][current_month]).to eq(300) # 100 + 150 + 50(abs)
    end
  end

  describe '#category_trends' do
    let(:current_date) { Date.current }
    let(:last_month_start) { (current_date - 1.month).beginning_of_month }
    let(:last_month_end) { (current_date - 1.month).end_of_month }
    let(:two_months_ago_start) { (current_date - 2.months).beginning_of_month }
    let(:two_months_ago_end) { (current_date - 2.months).end_of_month }

    before do
      # Current period (last month)
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 150, date: last_month_start + 5.days)

      # Previous period (two months ago)
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 100, date: two_months_ago_start + 5.days)
    end

    it 'calculates trends comparing current vs previous period' do
      service = described_class.new(user)
      trends = service.send(:category_trends)

      expect(trends).to be_a(Hash)
      expect(trends).to have_key('Category 1')

      category1_trend = trends['Category 1']
      expect(category1_trend[:id]).to eq(category1.id)
      expect(category1_trend[:current_amount]).to eq(150)
      expect(category1_trend[:previous_amount]).to eq(100)
      expect(category1_trend[:change_percent]).to eq(50.0) # (150-100)/100 * 100
      expect(category1_trend[:trend]).to eq('increasing') # > 5%
    end

    it 'identifies decreasing trends' do
      # Add more transactions to previous period
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 200, date: two_months_ago_start + 10.days)

      service = described_class.new(user)
      trends = service.send(:category_trends)

      category1_trend = trends['Category 1']
      # current: 150, previous: 300 (100 + 200)
      # change: (150-300)/300 * 100 = -50%
      expect(category1_trend[:change_percent]).to eq(-50.0)
      expect(category1_trend[:trend]).to eq('decreasing') # < -5%
    end

    it 'identifies stable trends' do
      # Make amounts very similar
      create(:transaction, :expense, user: user, category: category1, account: account,
                                     amount: 50, date: two_months_ago_start + 10.days)

      service = described_class.new(user)
      trends = service.send(:category_trends)

      category1_trend = trends['Category 1']
      # current: 150, previous: 150 (100 + 50)
      # change: 0%
      expect(category1_trend[:change_percent]).to eq(0.0)
      expect(category1_trend[:trend]).to eq('stable') # between -5% and 5%
    end

    it 'handles categories with no previous data' do
      # Create transaction only in current period for category2
      create(:transaction, :expense, user: user, category: category2, account: account,
                                     amount: 100, date: last_month_start + 5.days)

      service = described_class.new(user)
      trends = service.send(:category_trends)

      category2_trend = trends['Category 2']
      expect(category2_trend[:current_amount]).to eq(100)
      expect(category2_trend[:previous_amount]).to eq(0)
      expect(category2_trend[:change_percent]).to eq(100.0) # New category
    end
  end

  describe '#parse_date' do
    it 'parses valid date strings' do
      service = described_class.new(user)
      date = service.send(:parse_date, '2025-01-15')

      expect(date).to eq(Date.new(2025, 1, 15))
    end

    it 'returns nil for invalid dates' do
      service = described_class.new(user)
      result = service.send(:parse_date, 'invalid-date')

      expect(result).to be_nil
    end

    it 'returns nil for empty strings' do
      service = described_class.new(user)
      result = service.send(:parse_date, '')

      expect(result).to be_nil
    end

    it 'returns nil for nil input' do
      service = described_class.new(user)
      result = service.send(:parse_date, nil)

      expect(result).to be_nil
    end
  end

  describe 'initialization with custom date range' do
    it 'uses provided start and end dates' do
      start_date = '2024-01-01'
      end_date = '2024-12-31'

      service = described_class.new(user, { start_date: start_date, end_date: end_date })

      expect(service.instance_variable_get(:@start_date)).to eq(Date.parse(start_date))
      expect(service.instance_variable_get(:@end_date)).to eq(Date.parse(end_date))
    end

    it 'uses defaults when no dates provided' do
      service = described_class.new(user)

      start_date = service.instance_variable_get(:@start_date)
      end_date = service.instance_variable_get(:@end_date)

      expect(start_date).to eq(6.months.ago.beginning_of_month.to_date)
      expect(end_date).to eq(Date.current.end_of_month)
    end

    it 'handles invalid date strings gracefully' do
      service = described_class.new(user, { start_date: 'invalid', end_date: 'invalid' })

      # Should use defaults
      start_date = service.instance_variable_get(:@start_date)
      end_date = service.instance_variable_get(:@end_date)

      expect(start_date).to eq(6.months.ago.beginning_of_month.to_date)
      expect(end_date).to eq(Date.current.end_of_month)
    end
  end
end
