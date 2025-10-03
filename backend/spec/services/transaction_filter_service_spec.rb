# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TransactionFilterService, type: :service do
  let(:user) { create(:user) }
  let(:category1) { create(:category, user: user, category_type: 'expense') }
  let(:category2) { create(:category, user: user, category_type: 'income') }
  let(:account) { create(:account, user: user) }

  # Create test transactions
  let!(:income1) do
    create(:transaction,
           user: user,
           category: category2,
           account: account,
           transaction_type: 'income',
           description: 'Salary Payment',
           amount: 5000,
           date: Date.current.beginning_of_month)
  end

  let!(:expense1) do
    create(:transaction,
           user: user,
           category: category1,
           account: account,
           transaction_type: 'expense',
           description: 'Grocery Shopping',
           amount: 150,
           date: Date.current - 5.days)
  end

  let!(:expense2) do
    create(:transaction,
           user: user,
           category: category1,
           account: account,
           transaction_type: 'expense',
           description: 'Restaurant Bill',
           amount: 75,
           date: Date.current - 10.days)
  end

  let!(:last_month_expense) do
    create(:transaction,
           user: user,
           category: category1,
           account: account,
           transaction_type: 'expense',
           description: 'Last Month Expense',
           amount: 200,
           date: Date.current.last_month)
  end

  describe '#call' do
    context 'without filters' do
      it 'returns all user transactions' do
        service = described_class.new(user, {})
        result = service.call

        expect(result[:transactions].count).to eq(4)
        expect(result[:meta][:total_count]).to eq(4)
      end

      it 'calculates correct meta' do
        service = described_class.new(user, {})
        result = service.call
        meta = result[:meta]

        expect(meta[:total_income]).to eq(5000.0)
        expect(meta[:total_expenses]).to eq(425.0)
        expect(meta[:net_amount]).to eq(4575.0)
      end
    end

    context 'with text search' do
      it 'filters by description' do
        service = described_class.new(user, { search: 'Grocery' })
        result = service.call

        expect(result[:transactions].count).to eq(1)
        expect(result[:transactions].first.description).to eq('Grocery Shopping')
      end

      it 'performs case-insensitive search' do
        service = described_class.new(user, { search: 'grocery' })
        result = service.call

        expect(result[:transactions].count).to eq(1)
      end
    end

    context 'with category filter' do
      it 'filters by single category' do
        service = described_class.new(user, { category_id: category1.id })
        result = service.call

        expect(result[:transactions].count).to eq(3)
        expect(result[:transactions].pluck(:category_id)).to all(eq(category1.id))
      end

      it 'filters by multiple categories' do
        service = described_class.new(user, { category_ids: [category1.id, category2.id] })
        result = service.call

        expect(result[:transactions].count).to eq(4)
      end
    end

    context 'with transaction type filter' do
      it 'filters by income' do
        service = described_class.new(user, { transaction_type: 'income' })
        result = service.call

        expect(result[:transactions].count).to eq(1)
        expect(result[:transactions].first.transaction_type).to eq('income')
      end

      it 'filters by expense' do
        service = described_class.new(user, { transaction_type: 'expense' })
        result = service.call

        expect(result[:transactions].count).to eq(3)
        expect(result[:transactions].pluck(:transaction_type)).to all(eq('expense'))
      end
    end

    context 'with date period filters' do
      it 'filters by this_month' do
        service = described_class.new(user, { period: 'this_month' })
        result = service.call

        expect(result[:transactions].count).to eq(3)
        expect(result[:transactions]).not_to include(last_month_expense)
      end

      it 'filters by last_month' do
        service = described_class.new(user, { period: 'last_month' })
        result = service.call

        expect(result[:transactions].count).to eq(1)
        expect(result[:transactions].first).to eq(last_month_expense)
      end
    end

    context 'with custom date range' do
      it 'filters by date range' do
        start_date = (Date.current - 7.days).to_s
        end_date = Date.current.to_s

        service = described_class.new(user, { start_date: start_date, end_date: end_date })
        result = service.call

        expect(result[:transactions].count).to eq(1)
        expect(result[:transactions].first).to eq(expense1)
      end
    end

    context 'with amount range filter' do
      it 'filters by minimum amount' do
        service = described_class.new(user, { min_amount: 100 })
        result = service.call

        expect(result[:transactions].count).to eq(3)
        expect(result[:transactions].pluck(:amount)).to all(be >= 100)
      end

      it 'filters by maximum amount' do
        service = described_class.new(user, { max_amount: 200 })
        result = service.call

        expect(result[:transactions].count).to eq(3)
        expect(result[:transactions].pluck(:amount)).to all(be <= 200)
      end

      it 'filters by amount range' do
        service = described_class.new(user, { min_amount: 100, max_amount: 200 })
        result = service.call

        expect(result[:transactions].count).to eq(2)
        expect(result[:transactions].pluck(:amount)).to all(be_between(100, 200))
      end
    end

    context 'with sorting' do
      it 'sorts by amount descending' do
        service = described_class.new(user, { sort_by: 'amount', sort_direction: 'desc' })
        result = service.call

        amounts = result[:transactions].pluck(:amount)
        expect(amounts).to eq(amounts.sort.reverse)
      end

      it 'sorts by amount ascending' do
        service = described_class.new(user, { sort_by: 'amount', sort_direction: 'asc' })
        result = service.call

        amounts = result[:transactions].pluck(:amount)
        expect(amounts).to eq(amounts.sort)
      end

      it 'sorts by date descending by default' do
        service = described_class.new(user, {})
        result = service.call

        dates = result[:transactions].pluck(:date)
        expect(dates).to eq(dates.sort.reverse)
      end
    end

    context 'with combined filters' do
      it 'applies multiple filters together' do
        service = described_class.new(user, {
                                        transaction_type: 'expense',
                                        period: 'this_month',
                                        min_amount: 100
                                      })
        result = service.call

        expect(result[:transactions].count).to eq(1)
        expect(result[:transactions].first).to eq(expense1)
      end
    end

    context 'with meta' do
      it 'includes active filters in meta' do
        service = described_class.new(user, {
                                        search: 'test',
                                        transaction_type: 'expense',
                                        period: 'this_month'
                                      })
        result = service.call
        meta = result[:meta]

        expect(meta[:filters_applied][:search]).to eq('test')
        expect(meta[:filters_applied][:transaction_type]).to eq('expense')
        expect(meta[:filters_applied][:period]).to eq('this_month')
      end
    end
  end

  describe '#filter_options' do
    it 'returns available filter options' do
      service = described_class.new(user)
      options = service.filter_options

      expect(options[:periods]).to eq(TransactionFilterService::VALID_PERIODS)
      expect(options[:transaction_types]).to eq(Transaction::TRANSACTION_TYPES)
      expect(options[:sort_fields]).to eq(TransactionFilterService::VALID_SORT_FIELDS)
      expect(options[:sort_directions]).to eq(TransactionFilterService::VALID_SORT_DIRECTIONS)
    end

    it 'returns user categories' do
      service = described_class.new(user)
      options = service.filter_options

      expect(options[:categories].count).to eq(2)
      expect(options[:categories].pluck(:id)).to contain_exactly(category1.id, category2.id)
    end

    it 'returns user accounts' do
      service = described_class.new(user)
      options = service.filter_options

      expect(options[:accounts].count).to eq(1)
      expect(options[:accounts].first.id).to eq(account.id)
    end
  end

  describe '#search_suggestions' do
    it 'returns empty array for blank query' do
      service = described_class.new(user)
      suggestions = service.search_suggestions('')

      expect(suggestions).to eq([])
    end

    it 'returns empty array for query less than 2 characters' do
      service = described_class.new(user)
      suggestions = service.search_suggestions('a')

      expect(suggestions).to eq([])
    end

    it 'returns matching descriptions' do
      service = described_class.new(user)
      suggestions = service.search_suggestions('Gro')

      expect(suggestions).to include('Grocery Shopping')
    end

    it 'limits results to 10' do
      # Create 15 transactions with similar descriptions
      15.times do |i|
        create(:transaction,
               user: user,
               category: category1,
               account: account,
               description: "Test Transaction #{i}",
               amount: 100,
               date: Date.current)
      end

      service = described_class.new(user)
      suggestions = service.search_suggestions('Test')

      expect(suggestions.count).to be <= 10
    end
  end
end
