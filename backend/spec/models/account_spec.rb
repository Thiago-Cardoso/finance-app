# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Account, type: :model do
  describe 'validations' do
    subject { build(:account) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_inclusion_of(:account_type).in_array(%w[checking savings credit_card investment cash]) }
    it { is_expected.to validate_presence_of(:initial_balance) }
    it { is_expected.to validate_presence_of(:current_balance) }
    it { is_expected.to validate_numericality_of(:initial_balance) }
    it { is_expected.to validate_numericality_of(:current_balance) }
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
    it { is_expected.to have_many(:transactions).dependent(:nullify) }
    it { is_expected.to have_many(:transfer_transactions).dependent(:nullify) }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:active_account) { create(:account, user: user, is_active: true) }
    let!(:inactive_account) { create(:account, user: user, is_active: false) }
    let!(:checking_account) { create(:account, :checking, user: user) }
    let!(:savings_account) { create(:account, :savings, user: user) }

    describe '.active' do
      it 'returns only active accounts' do
        expect(Account.active).to include(active_account)
        expect(Account.active).not_to include(inactive_account)
      end
    end

    describe '.for_user' do
      it 'returns accounts for given user' do
        expect(Account.for_user(user)).to include(active_account, inactive_account)
      end
    end

    describe '.by_type' do
      it 'returns accounts for given type' do
        expect(Account.by_type('checking')).to include(checking_account)
        expect(Account.by_type('checking')).not_to include(savings_account)
      end
    end
  end

  describe 'callbacks' do
    describe 'after_create' do
      it 'sets current_balance to initial_balance' do
        account = create(:account, initial_balance: 1500)
        expect(account.current_balance).to eq(1500)
      end
    end
  end

  describe 'instance methods' do
    describe '#update_balance_from_transaction' do
      let(:account) { create(:account, current_balance: 1000) }
      let(:user) { account.user }

      context 'with income transaction' do
        let(:transaction) { build(:transaction, :income, user: user, account: account, amount: 500) }

        it 'increases current_balance' do
          expect {
            account.update_balance_from_transaction(transaction)
          }.to change { account.current_balance }.from(1000).to(1500)
        end
      end

      context 'with expense transaction' do
        let(:transaction) { build(:transaction, :expense, user: user, account: account, amount: 300) }

        it 'decreases current_balance' do
          expect {
            account.update_balance_from_transaction(transaction)
          }.to change { account.current_balance }.from(1000).to(700)
        end
      end

      context 'with transfer transaction (source account)' do
        let(:target_account) { create(:account, user: user) }
        let(:transaction) { build(:transaction, :transfer, user: user, account: account, transfer_account: target_account, amount: 200) }

        it 'decreases current_balance of source account' do
          expect {
            account.update_balance_from_transaction(transaction)
          }.to change { account.current_balance }.from(1000).to(800)
        end
      end

      context 'with transfer transaction (target account)' do
        let(:source_account) { create(:account, user: user) }
        let(:target_account) { create(:account, user: user, initial_balance: 500, current_balance: 500) }
        let(:transaction) { build(:transaction, :transfer, user: user, account: source_account, transfer_account: target_account, amount: 200) }

        it 'increases current_balance of target account' do
          initial_balance = target_account.current_balance
          target_account.update_balance_from_transaction(transaction)
          expect(target_account.current_balance).to eq(initial_balance + 200)
        end
      end
    end
  end
end