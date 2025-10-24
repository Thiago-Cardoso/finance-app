# frozen_string_literal: true

# UserAchievement model for gamification badges and achievements
class UserAchievement < ApplicationRecord
  belongs_to :user

  validates :badge_type, presence: true
  validates :title, presence: true
  validates :description, presence: true
  validates :points_earned, presence: true, numericality: { greater_than_or_equal_to: 0 }

  enum :badge_type, {
    goal_master: 0,
    savings_champion: 1,
    debt_destroyer: 2,
    investment_guru: 3,
    budget_wizard: 4,
    milestone_crusher: 5,
    consistency_king: 6,
    early_achiever: 7
  }

  scope :recent, -> { order(earned_at: :desc) }
  scope :by_type, ->(type) { where(badge_type: type) }

  def icon
    case badge_type
    when 'goal_master'
      '🏆'
    when 'savings_champion'
      '💰'
    when 'debt_destroyer'
      '⚔️'
    when 'investment_guru'
      '📈'
    when 'budget_wizard'
      '🧙‍♂️'
    when 'milestone_crusher'
      '🎯'
    when 'consistency_king'
      '👑'
    when 'early_achiever'
      '⚡'
    else
      '🏅'
    end
  end
end
