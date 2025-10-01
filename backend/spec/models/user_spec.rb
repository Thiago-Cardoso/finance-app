# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { create(:user) }

    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_length_of(:first_name).is_at_most(100) }
    it { is_expected.to validate_length_of(:last_name).is_at_most(100) }

    it 'validates email format' do
      user = build(:user, email: 'invalid')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to be_present
    end

    it 'requires password on create' do
      user = described_class.new(
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe'
      )
      expect(user).not_to be_valid
      expect(user.errors[:password]).to be_present
    end
  end

  describe 'associations' do
    it { is_expected.to have_many(:transactions).dependent(:destroy) }
    it { is_expected.to have_many(:categories).dependent(:destroy) }
    it { is_expected.to have_many(:accounts).dependent(:destroy) }
    it { is_expected.to have_many(:budgets).dependent(:destroy) }
    it { is_expected.to have_many(:goals).dependent(:destroy) }
  end

  describe 'callbacks' do
    describe '#generate_jti' do
      it 'generates JTI before validation on create' do
        user = described_class.new(
          email: 'test@example.com',
          password: 'password123',
          password_confirmation: 'password123',
          first_name: 'John',
          last_name: 'Doe'
        )

        expect(user.jti).to be_nil
        user.valid?
        expect(user.jti).to be_present
        expect(user.jti).to match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/)
      end

      it 'does not regenerate JTI on update' do
        user = create(:user)
        original_jti = user.jti

        user.update(first_name: 'Jane')
        expect(user.jti).to eq(original_jti)
      end
    end
  end

  describe 'instance methods' do
    describe '#full_name' do
      it 'returns first name and last name combined' do
        user = build(:user, first_name: 'John', last_name: 'Doe')
        expect(user.full_name).to eq('John Doe')
      end
    end

    describe '#current_month_summary' do
      let(:user) { create(:user) }
      let(:income_category) { create(:category, :income) }
      let(:expense_category) { create(:category, :expense) }
      let(:account) { create(:account, user: user, initial_balance: 5000, current_balance: 5000) }

      before do
        create(:transaction, :income, user: user, account: account, category: income_category, amount: 1000,
                                      date: Date.current)
        create(:transaction, :expense, user: user, account: account, category: expense_category, amount: 500,
                                       date: Date.current)
        create(:transaction, :expense, user: user, account: account, category: expense_category, amount: 300,
                                       date: 2.months.ago)
      end

      it 'returns income, expenses and balance for current month' do
        summary = user.current_month_summary

        expect(summary[:income]).to eq(1000)
        expect(summary[:expenses]).to eq(500)
        expect(summary[:balance]).to eq(5200)
      end

      it 'does not include transactions from other months' do
        summary = user.current_month_summary

        expect(summary[:expenses]).not_to eq(800)
      end
    end
  end

  describe 'Devise modules' do
    it 'includes database_authenticatable' do
      expect(described_class.devise_modules).to include(:database_authenticatable)
    end

    it 'includes registerable' do
      expect(described_class.devise_modules).to include(:registerable)
    end

    it 'includes recoverable' do
      expect(described_class.devise_modules).to include(:recoverable)
    end

    it 'includes rememberable' do
      expect(described_class.devise_modules).to include(:rememberable)
    end

    it 'includes validatable' do
      expect(described_class.devise_modules).to include(:validatable)
    end

    it 'includes confirmable' do
      expect(described_class.devise_modules).to include(:confirmable)
    end
  end
end
