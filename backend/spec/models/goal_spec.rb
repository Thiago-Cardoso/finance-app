# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Goal, type: :model do
  describe 'validations' do
    subject { build(:goal) }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_length_of(:name).is_at_most(100) }
    it { is_expected.to validate_presence_of(:target_amount) }
    it { is_expected.to validate_numericality_of(:target_amount).is_greater_than(0) }
    it { is_expected.to validate_numericality_of(:current_amount).is_greater_than_or_equal_to(0) }
    it { is_expected.to validate_presence_of(:goal_type) }
    it { is_expected.to validate_presence_of(:target_date) }
    it { is_expected.to validate_presence_of(:status) }

    context 'when current_amount exceeds target_amount' do
      it 'is invalid' do
        goal = build(:goal, target_amount: 1000, current_amount: 1500)
        expect(goal).not_to be_valid
        expect(goal.errors[:current_amount]).to be_present
      end
    end
  end

  describe 'associations' do
    it { is_expected.to belong_to(:user) }
  end

  describe 'scopes' do
    let(:user) { create(:user) }
    let!(:achieved_goal) { create(:goal, status: :completed, user: user) }
    let!(:in_progress_goal) { create(:goal, status: :active, user: user) }
    let!(:overdue_goal) { create(:goal, status: :active, target_date: 1.day.ago, user: user) }

    describe '.for_user' do
      it 'returns goals for given user' do
        expect(described_class.for_user(user)).to include(achieved_goal, in_progress_goal, overdue_goal)
      end
    end

    describe '.completed' do
      it 'returns only achieved goals' do
        expect(described_class.completed).to include(achieved_goal)
        expect(described_class.completed).not_to include(in_progress_goal)
      end
    end

    describe '.active' do
      it 'returns only goals not yet achieved' do
        expect(described_class.active).to include(in_progress_goal, overdue_goal)
        expect(described_class.active).not_to include(achieved_goal)
      end
    end

    describe '.by_deadline' do
      it 'orders goals by target_date ascending' do
        expect(described_class.by_deadline.first).to eq(overdue_goal)
      end
    end

    describe '.overdue' do
      it 'returns only overdue goals' do
        expect(described_class.overdue).to include(overdue_goal)
        expect(described_class.overdue).not_to include(achieved_goal, in_progress_goal)
      end
    end
  end

  describe 'instance methods' do
    describe '#progress_percentage' do
      it 'returns percentage of goal achieved' do
        goal = build(:goal, target_amount: 1000, current_amount: 750)
        expect(goal.progress_percentage).to eq(75.0)
      end

      it 'returns 0 when target_amount is 0' do
        goal = build(:goal, target_amount: 0, current_amount: 0)
        expect(goal.progress_percentage).to eq(0)
      end
    end

    describe '#remaining_amount' do
      it 'returns remaining amount to reach goal' do
        goal = build(:goal, target_amount: 1000, current_amount: 600)
        expect(goal.remaining_amount).to eq(400)
      end
    end

    describe '#days_remaining' do
      it 'returns days until target_date' do
        goal = build(:goal, target_date: 30.days.from_now.to_date)
        expect(goal.days_remaining).to eq(30)
      end

      it 'returns 0 for overdue goals' do
        goal = build(:goal, target_date: 1.day.ago.to_date)
        expect(goal.days_remaining).to eq(0)
      end

      it 'returns 0 when target_date is nil' do
        goal = build(:goal, target_date: nil)
        expect(goal.days_remaining).to eq(0)
      end
    end

    describe '#is_overdue?' do
      it 'returns true when past target_date and not achieved' do
        goal = build(:goal, target_date: 1.day.ago.to_date, status: :active)
        expect(goal.is_overdue?).to be true
      end

      it 'returns false when achieved' do
        goal = build(:goal, status: :completed, target_date: 1.day.ago.to_date)
        expect(goal.is_overdue?).to be false
      end

      it 'returns false when target_date is nil' do
        goal = build(:goal, target_date: nil)
        expect(goal.is_overdue?).to be false
      end
    end

    describe '#mark_as_achieved!' do
      it 'marks goal as achieved' do
        goal = create(:goal, status: :active)
        goal.mark_as_achieved!
        expect(goal.reload.status).to eq('completed')
      end
    end

    describe '#add_contribution' do
      let(:goal) { create(:goal, target_amount: 1000, current_amount: 500, status: :active) }

      it 'increases current_amount' do
        expect do
          goal.add_contribution(200)
        end.to change(goal, :current_amount).from(500).to(700)
      end

      it 'marks goal as achieved when target is reached' do
        goal.add_contribution(500)
        expect(goal.reload.status).to eq('completed')
      end

      it 'does not exceed target amount' do
        goal.add_contribution(600)
        expect(goal.current_amount).to eq(1000)
      end
    end

    describe '#monthly_target' do
      it 'calculates monthly amount needed' do
        goal = build(:goal, target_amount: 12_000, current_amount: 0, target_date: 12.months.from_now.to_date)
        expect(goal.monthly_target).to eq(1000.0)
      end

      it 'returns 0 when deadline has passed' do
        goal = create(:goal, target_amount: 1000, current_amount: 200, target_date: 1.day.ago.to_date)
        expect(goal.monthly_target).to eq(0)
      end

      it 'returns 0 when months_remaining is 0' do
        goal = create(:goal, target_amount: 1000, current_amount: 200, target_date: Date.current)
        expect(goal.monthly_target).to eq(0)
      end
    end
  end
end