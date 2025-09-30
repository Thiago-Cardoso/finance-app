# frozen_string_literal: true

# User model with Devise authentication
class User < ApplicationRecord
  # Include default devise modules
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable

  # Associations
  has_many :transactions, dependent: :destroy
  has_many :categories, dependent: :destroy
  has_many :accounts, dependent: :destroy
  has_many :budgets, dependent: :destroy
  has_many :goals, dependent: :destroy

  # Validations
  validates :first_name, presence: true, length: { maximum: 100 }
  validates :last_name, presence: true, length: { maximum: 100 }
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :jti, presence: true, uniqueness: true, on: :update

  # Callbacks
  before_validation :generate_jti, on: :create

  # Instance methods
  def full_name
    "#{first_name} #{last_name}"
  end

  def current_month_summary
    current_month = Date.current.beginning_of_month..Date.current.end_of_month
    {
      income: transactions.where(transaction_type: 'income', date: current_month).sum(:amount),
      expenses: transactions.where(transaction_type: 'expense', date: current_month).sum(:amount),
      balance: accounts.sum(:current_balance)
    }
  end

  private

  def generate_jti
    self.jti = SecureRandom.uuid
  end
end