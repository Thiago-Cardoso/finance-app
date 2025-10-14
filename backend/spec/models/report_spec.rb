require 'rails_helper'

RSpec.describe Report, type: :model do
  describe 'associations' do
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_length_of(:name).is_at_least(2).is_at_most(100) }
    it { should validate_presence_of(:report_type) }
    it { should validate_presence_of(:period_type) }
    it { should validate_presence_of(:status) }
  end

  describe 'enums' do
    it do
      should define_enum_for(:report_type).with_values(
        financial_summary: 0,
        expense_breakdown: 1,
        income_analysis: 2,
        budget_performance: 3,
        category_analysis: 4,
        monthly_comparison: 5,
        yearly_overview: 6,
        cash_flow: 7,
        custom: 8
      ).with_prefix(:report_type)
    end

    it do
      should define_enum_for(:period_type).with_values(
        daily: 0,
        weekly: 1,
        monthly: 2,
        quarterly: 3,
        yearly: 4,
        custom_range: 5,
        all_time: 6
      ).with_prefix(:period_type)
    end

    it do
      should define_enum_for(:status).with_values(
        pending: 0,
        processing: 1,
        completed: 2,
        failed: 3
      ).with_prefix(:status)
    end
  end

  describe 'scopes' do
    let!(:user) { create(:user) }
    let!(:completed_report) { create(:report, user: user, status: :completed, generated_at: 1.day.ago) }
    let!(:pending_report) { create(:report, user: user, status: :pending) }
    let!(:recent_report) { create(:report, user: user, status: :completed, generated_at: Time.current) }

    describe '.recent' do
      it 'orders reports by generated_at desc' do
        expect(Report.recent).to eq([recent_report, completed_report, pending_report])
      end
    end

    describe '.by_type' do
      let!(:financial_report) { create(:report, user: user, report_type: :financial_summary) }
      let!(:budget_report) { create(:report, user: user, report_type: :budget_performance) }

      it 'filters reports by type' do
        expect(Report.by_type(:financial_summary)).to include(financial_report)
        expect(Report.by_type(:financial_summary)).not_to include(budget_report)
      end
    end

    describe '.completed_reports' do
      it 'returns only completed reports' do
        expect(Report.completed_reports).to include(completed_report, recent_report)
        expect(Report.completed_reports).not_to include(pending_report)
      end
    end

    describe '.pending_reports' do
      it 'returns only pending reports' do
        expect(Report.pending_reports).to include(pending_report)
        expect(Report.pending_reports).not_to include(completed_report)
      end
    end
  end

  describe 'instance methods' do
    let(:report) { create(:report) }

    describe '#mark_as_processing!' do
      it 'updates status to processing' do
        report.mark_as_processing!
        expect(report.reload.status).to eq('processing')
      end
    end

    describe '#mark_as_completed!' do
      it 'updates status to completed and sets generated_at' do
        freeze_time do
          report.mark_as_completed!
          expect(report.reload.status).to eq('completed')
          expect(report.generated_at).to be_within(1.second).of(Time.current)
        end
      end
    end

    describe '#mark_as_failed!' do
      it 'updates status to failed' do
        report.mark_as_failed!
        expect(report.reload.status).to eq('failed')
      end
    end

    describe 'status predicate methods' do
      it 'returns correct status' do
        report.update(status: :pending)
        expect(report.pending?).to be true
        expect(report.processing?).to be false

        report.update(status: :processing)
        expect(report.processing?).to be true
        expect(report.completed?).to be false

        report.update(status: :completed)
        expect(report.completed?).to be true
        expect(report.failed?).to be false

        report.update(status: :failed)
        expect(report.failed?).to be true
        expect(report.pending?).to be false
      end
    end
  end

  describe 'callbacks' do
    describe 'before_create' do
      it 'sets default status to pending' do
        report = Report.create!(
          user: create(:user),
          name: 'Test Report',
          report_type: :financial_summary,
          period_type: :monthly
        )
        expect(report.status).to eq('pending')
      end
    end
  end
end
