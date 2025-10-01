# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Goal, type: :model do
  describe 'validations' do
    subject { build(:goal) }

    it { is_expected.to validate_presence_of(:title) }
    it { is_expected.to validate_length_of(:title).is_at_most(255) }
    it { is_expected.to validate_presence_of(:target_amount) }
    it { is_expected.to validate_numericality_of(:target_amount).is_greater_than(0) }
    it { is_expected.to validate_presence_of(:current_amount) }
    it { is_expected.to validate_numericality_of(:current_amount).is_greater_than_or_equal_to(0) }

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
    let!(:achieved_goal) { create(:goal, :achieved, user: user) }
    let!(:in_progress_goal) { create(:goal, :in_progress, user: user) }
    let!(:overdue_goal) { create(:goal, :overdue, user: user) }

    describe '.for_user' do
      it 'returns goals for given user' do
        expect(described_class.for_user(user)).to include(achieved_goal, in_progress_goal)
      end
    end

    describe '.achieved' do
      it 'returns only achieved goals' do
        expect(described_class.achieved).to include(achieved_goal)
        expect(described_class.achieved).not_to include(in_progress_goal)
      end
    end

    describe '.in_progress' do
      it 'returns only goals not yet achieved' do
        expect(described_class.in_progress).to include(in_progress_goal, overdue_goal)
        expect(described_class.in_progress).not_to include(achieved_goal)
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
    describe '#percentage_achieved' do
      it 'returns percentage of goal achieved' do
        goal = build(:goal, target_amount: 1000, current_amount: 750)
        expect(goal.percentage_achieved).to eq(75.0)
      end

      it 'returns 0 when target_amount is 0' do
        goal = build(:goal, target_amount: 0, current_amount: 0)
        expect(goal.percentage_achieved).to eq(0)
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
        goal = build(:goal, target_date: 30.days.from_now)
        expect(goal.days_remaining).to be_within(1).of(30)
      end

      it 'returns 0 for overdue goals' do
        goal = build(:goal, target_date: 1.day.ago)
        expect(goal.days_remaining).to eq(0)
      end

      it 'returns 0 when target_date is nil' do
        goal = build(:goal, :no_deadline)
        expect(goal.days_remaining).to eq(0)
      end
    end

    describe '#is_overdue?' do
      it 'returns true when past target_date and not achieved' do
        goal = build(:goal, :overdue)
        expect(goal.is_overdue?).to be true
      end

      it 'returns false when achieved' do
        goal = build(:goal, :achieved, target_date: 1.day.ago)
        expect(goal.is_overdue?).to be false
      end

      it 'returns false when target_date is nil' do
        goal = build(:goal, :no_deadline)
        expect(goal.is_overdue?).to be false
      end
    end

    describe '#mark_as_achieved!' do
      it 'marks goal as achieved' do
        goal = create(:goal)
        goal.mark_as_achieved!
        expect(goal.is_achieved).to be true
      end
    end

    describe '#add_contribution' do
      let(:goal) { create(:goal, target_amount: 1000, current_amount: 500) }

      it 'increases current_amount' do
        expect do
          goal.add_contribution(200)
        end.to change(goal, :current_amount).from(500).to(700)
      end

      it 'marks goal as achieved when target is reached' do
        goal.add_contribution(500)
        expect(goal.is_achieved).to be true
      end
    end

    describe '#suggested_monthly_contribution' do
      it 'calculates monthly amount needed' do
        goal = build(:goal, target_amount: 12_000, current_amount: 0, target_date: 12.months.from_now)
        expect(goal.suggested_monthly_contribution).to eq(1000.0)
      end

      it 'returns 0 when deadline has passed' do
        goal = build(:goal, target_amount: 1000, current_amount: 200, target_date: 1.day.ago)
        # When deadline has passed, suggested monthly contribution is 0 (no time left)
        expect(goal.suggested_monthly_contribution).to eq(0)
      end

      it 'returns 0 when target_date is nil' do
        goal = build(:goal, :no_deadline)
        expect(goal.suggested_monthly_contribution).to eq(0)
      end
    end
  end
end
