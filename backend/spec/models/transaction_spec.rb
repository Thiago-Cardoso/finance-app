# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Transaction, type: :model do
  describe 'validations' do
    subject { build(:transaction) }

    it { is_expected.to validate_presence_of(:description) }
    it { is_expected.to validate_length_of(:description).is_at_most(255) }
    it { is_expected.to validate_presence_of(:amount) }
    it { is_expected.to validate_numericality_of(:amount).is_greater_than(0) }
    it { is_expected.to validate_inclusion_of(:transaction_type).in_array(%w[income expense transfer]) }
    it { is_expected.to validate_presence_of(:date) }

    context 'when transaction is a transfer' do
      it 'requires transfer_account_id' do
        transaction = build(:transaction, transaction_type: 'transfer', transfer_account_id: nil)
        expect(transaction).not_to be_valid
        expect(transaction.errors[:transfer_account]).to be_present
      end
    end

    context 'when category type does not match transaction type' do
      let(:income_category) { create(:category, :income) }
      let(:transaction) { build(:transaction, :expense, category: income_category) }

      it 'is invalid' do
        expect(transaction).not_to be_valid
        expect(transaction.errors[:category]).to be_present
      end
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to belong_to(:category).optional }
    it { is_expected.to belong_to(:account).optional }
    it { is_expected.to belong_to(:transfer_account).optional }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let(:account) { create(:account, user: user) }
    let!(:income) { create(:transaction, :income, user: user, account: account, date: Date.current) }
    let!(:expense) { create(:transaction, :expense, user: user, account: account, date: Date.current) }
    let!(:last_month_transaction) { create(:transaction, user: user, account: account, date: 1.month.ago) }

    describe '.for_user' do
      it 'returns transactions for given user' do
        expect(described_class.for_user(user)).to include(income, expense)
      end
    end

    describe '.by_type' do
      it 'returns transactions of given type' do
        expect(described_class.by_type('income')).to include(income)
        expect(described_class.by_type('income')).not_to include(expense)
      end
    end

    describe '.by_date_range' do
      it 'returns transactions within date range' do
        start_date = Date.current.beginning_of_month
        end_date = Date.current.end_of_month

        result = described_class.by_date_range(start_date, end_date)
        expect(result).to include(income, expense)
        expect(result).not_to include(last_month_transaction)
      end
    end

    describe '.recent' do
      it 'returns transactions ordered by date descending' do
        expect(described_class.recent.first).to eq(income.id > expense.id ? income : expense)
      end
    end

    describe '.this_month' do
      it 'returns only current month transactions' do
        expect(described_class.this_month).to include(income, expense)
        expect(described_class.this_month).not_to include(last_month_transaction)
      end
    end

    describe '.this_year' do
      it 'returns only current year transactions' do
        expect(described_class.this_year).to include(income, expense, last_month_transaction)
      end
    end
  end

  describe 'class methods' do
    describe '.monthly_summary' do
      let(:user) { create(:user) }
      let(:account) { create(:account, user: user) }
      let(:income_category) { create(:category, :income) }
      let(:expense_category) { create(:category, :expense) }

      before do
        create(:transaction, :income, user: user, account: account, category: income_category, amount: 1000,
                                      date: Date.current)
        create(:transaction, :income, user: user, account: account, category: income_category, amount: 500,
                                      date: Date.current)
        create(:transaction, :expense, user: user, account: account, category: expense_category, amount: 300,
                                       date: Date.current)
        create(:transaction, :expense, user: user, account: account, category: expense_category, amount: 200,
                                       date: 2.months.ago)
      end

      it 'returns summary for current month' do
        summary = described_class.monthly_summary(user)

        expect(summary[:income]).to eq(1500)
        expect(summary[:expenses]).to eq(300)
        expect(summary[:net]).to eq(1200)
        expect(summary[:count]).to eq(3)
      end

      it 'does not include transactions from other months' do
        summary = described_class.monthly_summary(user)

        expect(summary[:expenses]).not_to eq(500)
      end
    end
  end

  describe 'instance methods' do
    describe '#income?' do
      it 'returns true for income transactions' do
        transaction = build(:transaction, :income)
        expect(transaction.income?).to be true
      end

      it 'returns false for non-income transactions' do
        transaction = build(:transaction, :expense)
        expect(transaction.income?).to be false
      end
    end

    describe '#expense?' do
      it 'returns true for expense transactions' do
        transaction = build(:transaction, :expense)
        expect(transaction.expense?).to be true
      end

      it 'returns false for non-expense transactions' do
        transaction = build(:transaction, :income)
        expect(transaction.expense?).to be false
      end
    end

    describe '#transfer?' do
      it 'returns true for transfer transactions' do
        transaction = build(:transaction, :transfer)
        expect(transaction.transfer?).to be true
      end

      it 'returns false for non-transfer transactions' do
        transaction = build(:transaction, :expense)
        expect(transaction.transfer?).to be false
      end
    end
  end

  describe 'callbacks' do
    let(:user) { create(:user) }
    let(:account) { create(:account, user: user, current_balance: 1000) }
    let(:income_category) { create(:category, :income) }
    let(:expense_category) { create(:category, :expense) }

    describe 'after_create' do
      it 'updates account balance for income' do
        expect do
          create(:transaction, :income, user: user, account: account, category: income_category, amount: 500)
        end.to change { account.reload.current_balance }.from(1000).to(1500)
      end

      it 'updates account balance for expense' do
        expect do
          create(:transaction, :expense, user: user, account: account, category: expense_category, amount: 300)
        end.to change { account.reload.current_balance }.from(1000).to(700)
      end
    end

    describe 'after_destroy' do
      it 'reverts account balance for income' do
        transaction = create(:transaction, :income, user: user, account: account, category: income_category,
                                                    amount: 500)

        expect do
          transaction.destroy
        end.to change { account.reload.current_balance }.from(1500).to(1000)
      end

      it 'reverts account balance for expense' do
        transaction = create(:transaction, :expense, user: user, account: account, category: expense_category,
                                                     amount: 300)

        expect do
          transaction.destroy
        end.to change { account.reload.current_balance }.from(700).to(1000)
      end
    end
  end
end
