require 'rails_helper'

RSpec.describe Reports::FinancialSummaryGenerator do
  let(:user) { create(:user) }
  let(:category_income) { create(:category, user: user, name: 'Salary', category_type: 'income') }
  let(:category_expense) { create(:category, user: user, name: 'Food', category_type: 'expense') }
  let(:account) { create(:account, user: user) }

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
        report = Report.find(result[:report_id])

        expect(report.status).to eq('completed')
        expect(report.generated_at).to be_present
      end
    end

    context 'with custom date range' do
      let(:filters) do
        {
          start_date: 1.week.ago.to_date,
          end_date: Date.current,
          period_type: 'custom_range'
        }
      end

      subject { described_class.new(user, filters) }

      it 'respects the date range filter' do
        result = subject.generate
        period = result[:period]

        expect(period[:start_date]).to eq(1.week.ago.to_date)
        expect(period[:end_date]).to eq(Date.current)
      end
    end

    context 'with income breakdown' do
      subject { described_class.new(user, {}) }

      it 'includes income breakdown by category' do
        result = subject.generate
        income = result[:income]

        expect(income[:total]).to eq(5000)
        expect(income[:breakdown]).to be_an(Array)
        expect(income[:breakdown].first[:category_name]).to eq('Salary')
        expect(income[:breakdown].first[:total]).to eq(5000)
        expect(income[:breakdown].first[:percentage]).to eq(100.0)
      end
    end

    context 'with expense breakdown' do
      subject { described_class.new(user, {}) }

      it 'includes expense breakdown by category' do
        result = subject.generate
        expenses = result[:expenses]

        expect(expenses[:total]).to eq(2000)
        expect(expenses[:breakdown]).to be_an(Array)
        expect(expenses[:breakdown].first[:category_name]).to eq('Food')
        expect(expenses[:breakdown].first[:total]).to eq(2000)
        expect(expenses[:breakdown].first[:percentage]).to eq(100.0)
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
      before do
        allow_any_instance_of(described_class).to receive(:fetch_data).and_raise(StandardError, 'Database error')
      end

      subject { described_class.new(user, {}) }

      it 'marks report as failed' do
        expect { subject.generate }.to raise_error(StandardError)

        report = Report.last
        expect(report.status).to eq('failed')
      end
    end
  end

  describe '#report_name' do
    subject { described_class.new(user, {}) }

    it 'returns a descriptive name' do
      expect(subject.send(:report_name)).to include('Resumo Financeiro')
    end
  end

  describe '#report_type' do
    subject { described_class.new(user, {}) }

    it 'returns financial_summary' do
      expect(subject.send(:report_type)).to eq(:financial_summary)
    end
  end
end
