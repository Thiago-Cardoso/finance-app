# frozen_string_literal: true

# SharedGoal model for collaborative goals
class SharedGoal < ApplicationRecord
  belongs_to :goal
  belongs_to :user

  validates :goal_id, uniqueness: { scope: :user_id }
end
