# frozen_string_literal: true

# Goal model for financial goals tracking
class Goal < ApplicationRecord
  # Associations
  belongs_to :user

  # Validations
  validates :title, presence: true, length: { maximum: 255 }
  validates :target_amount, presence: true, numericality: { greater_than: 0 }
  validates :current_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validate :current_amount_not_greater_than_target

  # Scopes
  scope :for_user, ->(user) { where(user: user) }
  scope :achieved, -> { where(is_achieved: true) }
  scope :in_progress, -> { where(is_achieved: false) }
  scope :by_deadline, -> { order(target_date: :asc) }
  scope :overdue, -> { where('target_date < ? AND is_achieved = false', Date.current) }

  # Instance methods
  def percentage_achieved
    return 0 if target_amount.zero?

    ((current_amount / target_amount) * 100).round(2)
  end

  def remaining_amount
    target_amount - current_amount
  end

  def days_remaining
    return 0 if target_date.blank? || target_date < Date.current

    (target_date - Date.current).to_i
  end

  def is_overdue?
    return false if target_date.blank? || is_achieved?

    target_date < Date.current
  end

  def mark_as_achieved!
    update!(is_achieved: true)
  end

  def add_contribution(amount)
    increment(:current_amount, amount)

    self.is_achieved = true if current_amount >= target_amount

    save!
  end

  def suggested_monthly_contribution
    return 0 if target_date.blank? || target_date < Date.current

    months_remaining = (((target_date.year * 12) + target_date.month) -
                       ((Date.current.year * 12) + Date.current.month))

    return remaining_amount if months_remaining <= 0

    (remaining_amount / months_remaining).round(2)
  end

  private

  def current_amount_not_greater_than_target
    return if current_amount.blank? || target_amount.blank?

    return unless current_amount > target_amount

    errors.add(:current_amount, 'cannot be greater than target amount')
  end
end
