# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Budget, type: :model do
  describe 'validations' do
    subject { build(:budget) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_presence_of(:amount) }
    it { is_expected.to validate_numericality_of(:amount).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:spent) }
    it { is_expected.to validate_numericality_of(:spent).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_inclusion_of(:period).in_array(%w[weekly monthly yearly]) }
    it { is_expected.to validate_presence_of(:start_date) }
    it { is_expected.to validate_presence_of(:end_date) }

    context 'when end_date is before start_date' do
      it 'is invalid' do
        budget = build(:budget, start_date: Date.current, end_date: Date.yesterday)
        expect(budget).not_to be_valid
        expect(budget.errors[:end_date]).to be_present
      end
    end

    context 'when category is not expense type' do
      let(:income_category) { create(:category, :income) }
      let(:budget) { build(:budget, category: income_category) }

      it 'is invalid' do
        expect(budget).not_to be_valid
        expect(budget.errors[:category]).to be_present
      end
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:category) }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:active_budget) { create(:budget, user: user, is_active: true) }
    let!(:inactive_budget) { create(:budget, user: user, is_active: false) }
    let!(:weekly_budget) { create(:budget, :weekly, user: user) }
    let!(:monthly_budget) { create(:budget, :monthly, user: user) }
    let!(:over_budget) { create(:budget, :over_budget, user: user) }

    describe '.active' do
      it 'returns only active budgets' do
        expect(Budget.active).to include(active_budget)
        expect(Budget.active).not_to include(inactive_budget)
      end
    end

    describe '.for_user' do
      it 'returns budgets for given user' do
        expect(Budget.for_user(user)).to include(active_budget, inactive_budget)
      end
    end

    describe '.by_period' do
      it 'returns budgets for given period' do
        expect(Budget.by_period('weekly')).to include(weekly_budget)
        expect(Budget.by_period('weekly')).not_to include(monthly_budget)
      end
    end

    describe '.current' do
      it 'returns budgets that include current date' do
        expect(Budget.current).to include(active_budget)
      end
    end

    describe '.over_budget' do
      it 'returns budgets where spent exceeds amount' do
        expect(Budget.over_budget).to include(over_budget)
      end
    end
  end

  describe 'callbacks' do
    describe 'after_create' do
      let(:user) { create(:user) }
      let(:category) { create(:category, :expense) }
      let(:account) { create(:account, user: user) }

      before do
        create(:transaction, :expense, user: user, category: category, account: account, amount: 100, date: Date.current)
        create(:transaction, :expense, user: user, category: category, account: account, amount: 50, date: Date.current)
      end

      it 'calculates spent amount on create' do
        budget = create(:budget, user: user, category: category)
        expect(budget.spent).to eq(150)
      end
    end
  end

  describe 'instance methods' do
    describe '#percentage_used' do
      let(:budget) { build(:budget, amount: 1000, spent: 750) }

      it 'returns percentage of budget used' do
        expect(budget.percentage_used).to eq(75.0)
      end

      it 'returns 0 when amount is 0' do
        budget.amount = 0
        expect(budget.percentage_used).to eq(0)
      end
    end

    describe '#remaining_amount' do
      let(:budget) { build(:budget, amount: 1000, spent: 600) }

      it 'returns remaining budget amount' do
        expect(budget.remaining_amount).to eq(400)
      end
    end

    describe '#is_over_budget?' do
      it 'returns true when spent exceeds amount' do
        budget = build(:budget, amount: 500, spent: 600)
        expect(budget.is_over_budget?).to be true
      end

      it 'returns false when spent is within amount' do
        budget = build(:budget, amount: 500, spent: 400)
        expect(budget.is_over_budget?).to be false
      end
    end

    describe '#is_near_limit?' do
      it 'returns true when at default threshold (90%)' do
        budget = build(:budget, amount: 1000, spent: 900)
        expect(budget.is_near_limit?).to be true
      end

      it 'returns false when below default threshold' do
        budget = build(:budget, amount: 1000, spent: 800)
        expect(budget.is_near_limit?).to be false
      end

      it 'accepts custom threshold' do
        budget = build(:budget, amount: 1000, spent: 750)
        expect(budget.is_near_limit?(0.7)).to be true
      end
    end

    describe '#calculate_spent_amount' do
      let(:user) { create(:user) }
      let(:category) { create(:category, :expense) }
      let(:account) { create(:account, user: user) }
      let(:budget) { create(:budget, user: user, category: category, spent: 0) }

      before do
        create(:transaction, :expense, user: user, category: category, account: account, amount: 100, date: budget.start_date)
        create(:transaction, :expense, user: user, category: category, account: account, amount: 50, date: budget.start_date + 1.day)
        create(:transaction, :expense, user: user, category: category, account: account, amount: 75, date: budget.end_date + 1.day)
      end

      it 'calculates spent amount within date range' do
        budget.calculate_spent_amount
        expect(budget.reload.spent).to eq(150)
      end

      it 'does not include transactions outside date range' do
        budget.calculate_spent_amount
        expect(budget.reload.spent).not_to eq(225)
      end
    end
  end
end