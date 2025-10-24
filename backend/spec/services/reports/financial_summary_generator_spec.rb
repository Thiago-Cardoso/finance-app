require 'rails_helper'

RSpec.describe Reports::FinancialSummaryGenerator do
  let(:user) { create(:user) }
  let(:category_income) { create(:category, user: user, name: 'Salary', category_type: 'income') }
  let(:category_expense) { create(:category, user: user, name: 'Food', category_type: 'expense') }
  let(:account) { create(:account, user: user, current_balance: 3000, initial_balance: 1000) }

  let!(:income_transaction) do
    create(:transaction,
           user: user,
           category: category_income,
           account: account,
           transaction_type: 'income',
           amount: 5000,
           date: Date.current)
  end

  let!(:expense_transaction) do
    create(:transaction,
           user: user,
           category: category_expense,
           account: account,
           transaction_type: 'expense',
           amount: 2000,
           date: Date.current)
  end

  describe '#generate' do
    context 'with default filters (monthly)' do
      subject { described_class.new(user, {}) }

      it 'generates a financial summary report' do
        result = subject.generate

        expect(result).to be_a(Hash)
        expect(result[:report_id]).to be_present
        expect(result[:period]).to be_present
        expect(result[:summary]).to be_present
        expect(result[:income]).to be_present
        expect(result[:expenses]).to be_present
        expect(result[:accounts]).to be_present
        expect(result[:trends]).to be_present
      end

      it 'calculates correct summary totals' do
        result = subject.generate
        summary = result[:summary]

        expect(summary[:total_income]).to eq(5000)
        expect(summary[:total_expenses]).to eq(2000)
        expect(summary[:net_balance]).to eq(3000)
        expect(summary[:transaction_count]).to eq(2)
      end

      it 'creates a report record' do
        expect { subject.generate }.to change(Report, :count).by(1)
      end

      it 'marks report as completed' do
        result = subject.generate
        report = Report.find_by(id: result[:report_id])

        expect(report).to be_present
        expect(report.status).to eq('completed')
        expect(report.generated_at).to be_present
      end
    end

    context 'with custom date range' do
      let(:start_date) { 1.week.ago.to_date }
      let(:end_date) { Date.current }
      
      let(:filters) do
        {
          start_date: start_date,
          end_date: end_date
        }
      end

      subject { described_class.new(user, filters) }

      it 'respects the date range filter' do
        result = subject.generate
        period = result[:period]

        expect(period[:start_date]).to eq(start_date)
        expect(period[:end_date]).to eq(end_date)
      end
    end

    context 'with income breakdown' do
      subject { described_class.new(user, {}) }

      it 'includes income breakdown by category' do
        result = subject.generate
        income = result[:income]

        expect(income[:total]).to eq(5000)
        expect(income[:breakdown]).to be_an(Array)
        expect(income[:breakdown]).not_to be_empty
        
        salary_breakdown = income[:breakdown].find { |b| b[:category_name] == 'Salary' }
        expect(salary_breakdown).to be_present
        expect(salary_breakdown[:total]).to eq(5000)
        expect(salary_breakdown[:percentage]).to eq(100.0)
      end
    end

    context 'with expense breakdown' do
      subject { described_class.new(user, {}) }

      it 'includes expense breakdown by category' do
        result = subject.generate
        expenses = result[:expenses]

        expect(expenses[:total]).to eq(2000)
        expect(expenses[:breakdown]).to be_an(Array)
        expect(expenses[:breakdown]).not_to be_empty
        
        food_breakdown = expenses[:breakdown].find { |b| b[:category_name] == 'Food' }
        expect(food_breakdown).to be_present
        expect(food_breakdown[:total]).to eq(2000)
        expect(food_breakdown[:percentage]).to eq(100.0)
      end
    end

    context 'with account balances' do
      subject { described_class.new(user, {}) }

      it 'includes account balances' do
        result = subject.generate
        accounts = result[:accounts]

        expect(accounts).to be_an(Array)
        expect(accounts).not_to be_empty
        
        account_data = accounts.find { |a| a[:account_name] == account.name }
        expect(account_data).to be_present
        expect(account_data[:current_balance]).to eq(3000)
        expect(account_data[:initial_balance]).to eq(1000)
      end
    end

    context 'with daily trends' do
      subject { described_class.new(user, {}) }

      it 'includes daily trends data' do
        result = subject.generate
        trends = result[:trends]

        expect(trends).to be_an(Array)
        expect(trends).not_to be_empty
        
        today_trend = trends.find { |t| t[:date] == Date.current }
        expect(today_trend).to be_present
        
        # Since both transactions are on the same date, we expect both amounts
        expect(today_trend[:income]).to eq(5000)
        expect(today_trend[:expenses]).to eq(2000)
        expect(today_trend[:net]).to eq(3000)
      end
    end

    context 'with invalid date range' do
      let(:invalid_filters) do
        {
          start_date: Date.current,
          end_date: 1.week.ago.to_date
        }
      end

      subject { described_class.new(user, invalid_filters) }

      it 'raises an error' do
        expect { subject.generate }.to raise_error(ArgumentError, 'Start date must be before end date')
      end
    end

    context 'when generation fails' do
      subject { described_class.new(user, {}) }

      before do
        allow_any_instance_of(described_class).to receive(:fetch_data).and_raise(StandardError, 'Database error')
      end

      it 'marks report as failed and raises error' do
        expect { subject.generate }.to raise_error(StandardError)

        report = Report.last
        expect(report).to be_present
        expect(report.status).to eq('failed')
      end
    end

    context 'with multiple transactions in different categories' do
      let(:category_income_2) { create(:category, user: user, name: 'Bonus', category_type: 'income') }
      let(:category_expense_2) { create(:category, user: user, name: 'Transport', category_type: 'expense') }

      before do
        create(:transaction,
               user: user,
               category: category_income_2,
               account: account,
               transaction_type: 'income',
               amount: 3000,
               date: Date.current)
        
        create(:transaction,
               user: user,
               category: category_expense_2,
               account: account,
               transaction_type: 'expense',
               amount: 1000,
               date: Date.current)
      end

      subject { described_class.new(user, {}) }

      it 'calculates correct percentages for multiple categories' do
        result = subject.generate
        income = result[:income]
        expenses = result[:expenses]

        expect(income[:total]).to eq(8000) # 5000 + 3000
        expect(expenses[:total]).to eq(3000) # 2000 + 1000

        salary_breakdown = income[:breakdown].find { |b| b[:category_name] == 'Salary' }
        bonus_breakdown = income[:breakdown].find { |b| b[:category_name] == 'Bonus' }
        
        expect(salary_breakdown[:percentage]).to eq(62.5) # 5000/8000 * 100
        expect(bonus_breakdown[:percentage]).to eq(37.5) # 3000/8000 * 100
      end
    end
  end

  describe 'protected methods' do
    subject { described_class.new(user, {}) }

    describe '#report_name' do
      it 'returns a descriptive name' do
        name = subject.send(:report_name)
        expect(name).to include('Resumo Financeiro')
        expect(name).to include('a') # contains date range
      end
    end

    describe '#report_type' do
      it 'returns financial_summary' do
        expect(subject.send(:report_type)).to eq(:financial_summary)
      end
    end
  end

  describe 'BaseGenerator helpers' do
    subject { described_class.new(user, {}) }

    describe '#calculate_percentage' do
      it 'calculates percentage correctly' do
        expect(subject.send(:calculate_percentage, 50, 100)).to eq(50.0)
        expect(subject.send(:calculate_percentage, 25, 100)).to eq(25.0)
        expect(subject.send(:calculate_percentage, 0, 100)).to eq(0.0)
        expect(subject.send(:calculate_percentage, 100, 0)).to eq(0.0)
        expect(subject.send(:calculate_percentage, 33.333, 100)).to eq(33.33)
      end
    end

    describe '#format_currency' do
      it 'formats currency correctly' do
        formatted = subject.send(:format_currency, 1234.56)
        expect(formatted).to be_a(String)
        expect(formatted).to include('R$')
      end
    end
  end

  describe 'date range calculations' do
    context 'with monthly period type' do
      let(:filters) { { period_type: 'monthly' } }
      subject { described_class.new(user, filters) }

      it 'sets correct start and end dates' do
        subject.send(:parse_start_date)
        subject.send(:parse_end_date)

        expect(subject.send(:start_date)).to eq(Date.current.beginning_of_month)
        expect(subject.send(:end_date)).to eq(Date.current.end_of_month)
      end
    end

    context 'with custom dates' do
      let(:custom_start) { Date.new(2024, 1, 1) }
      let(:custom_end) { Date.new(2024, 1, 31) }
      let(:filters) { { start_date: custom_start, end_date: custom_end } }
      subject { described_class.new(user, filters) }

      it 'uses custom dates' do
        expect(subject.send(:start_date)).to eq(custom_start)
        expect(subject.send(:end_date)).to eq(custom_end)
      end
    end
  end
end