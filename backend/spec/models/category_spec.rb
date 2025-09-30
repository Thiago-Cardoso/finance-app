# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Category, type: :model do
  describe 'validations' do
    subject { build(:category) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_inclusion_of(:category_type).in_array(%w[income expense]) }

    it 'validates color format' do
      category = build(:category, color: 'invalid')
      expect(category).not_to be_valid
      expect(category.errors[:color]).to be_present
    end

    it 'accepts valid hex color' do
      category = build(:category, color: '#ff5733')
      expect(category).to be_valid
    end

    context 'when category has a user' do
      it 'validates uniqueness of name scoped to user' do
        user = create(:user)
        create(:category, :custom, name: 'Food', user: user)

        duplicate = build(:category, :custom, name: 'Food', user: user)
        expect(duplicate).not_to be_valid
        expect(duplicate.errors[:name]).to be_present
      end

      it 'allows same name for different users' do
        user1 = create(:user)
        user2 = create(:user)

        create(:category, :custom, name: 'Food', user: user1)
        duplicate = build(:category, :custom, name: 'Food', user: user2)

        expect(duplicate).to be_valid
      end
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user).optional }
    it { is_expected.to have_many(:transactions).dependent(:nullify) }
    it { is_expected.to have_many(:budgets).dependent(:destroy) }
  end

  describe 'scopes' do
    let!(:default_category) { create(:category, :default) }
    let!(:custom_category) { create(:category, :custom) }
    let!(:inactive_category) { create(:category, :inactive) }
    let!(:income_category) { create(:category, :income) }
    let!(:expense_category) { create(:category, :expense) }

    describe '.defaults' do
      it 'returns only default categories' do
        expect(Category.defaults).to include(default_category)
        expect(Category.defaults).not_to include(custom_category)
      end
    end

    describe '.custom' do
      it 'returns only custom categories' do
        expect(Category.custom).to include(custom_category)
        expect(Category.custom).not_to include(default_category)
      end
    end

    describe '.active' do
      it 'returns only active categories' do
        expect(Category.active).to include(default_category, custom_category)
        expect(Category.active).not_to include(inactive_category)
      end
    end

    describe '.for_type' do
      it 'returns categories for given type' do
        expect(Category.for_type('income')).to include(income_category)
        expect(Category.for_type('income')).not_to include(expense_category)
      end
    end

    describe '.for_user' do
      it 'returns categories for given user' do
        user = custom_category.user
        expect(Category.for_user(user)).to include(custom_category)
        expect(Category.for_user(user)).not_to include(default_category)
      end
    end
  end

  describe 'class methods' do
    describe '.available_for_user' do
      let(:user) { create(:user) }
      let!(:default_category) { create(:category, :default) }
      let!(:user_category) { create(:category, :custom, user: user) }
      let!(:other_user_category) { create(:category, :custom) }
      let!(:inactive_category) { create(:category, :default, is_active: false) }

      it 'returns default categories' do
        expect(Category.available_for_user(user)).to include(default_category)
      end

      it 'returns user custom categories' do
        expect(Category.available_for_user(user)).to include(user_category)
      end

      it 'does not return other users categories' do
        expect(Category.available_for_user(user)).not_to include(other_user_category)
      end

      it 'does not return inactive categories' do
        expect(Category.available_for_user(user)).not_to include(inactive_category)
      end
    end
  end

  describe 'instance methods' do
    describe '#total_spent_this_month' do
      let(:user) { create(:user) }
      let(:category) { create(:category, :expense) }
      let(:account) { create(:account, user: user) }

      before do
        create(:transaction, :expense, user: user, category: category, account: account, amount: 100, date: Date.current)
        create(:transaction, :expense, user: user, category: category, account: account, amount: 50, date: Date.current)
        create(:transaction, :expense, user: user, category: category, account: account, amount: 75, date: 2.months.ago)
      end

      it 'returns total spent in current month' do
        expect(category.total_spent_this_month(user)).to eq(150)
      end

      it 'does not include transactions from other months' do
        expect(category.total_spent_this_month(user)).not_to eq(225)
      end

      it 'returns 0 when user is nil' do
        expect(category.total_spent_this_month(nil)).to eq(0)
      end
    end
  end
end