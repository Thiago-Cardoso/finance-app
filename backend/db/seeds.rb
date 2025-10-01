# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

Rails.logger.debug 'Seeding database...'

# Clear existing default categories
Category.where(is_default: true).destroy_all

# Default expense categories
expense_categories = [
  { name: 'Groceries', icon: '🛒', color: '#10b981', category_type: 'expense' },
  { name: 'Transportation', icon: '🚗', color: '#3b82f6', category_type: 'expense' },
  { name: 'Utilities', icon: '💡', color: '#f59e0b', category_type: 'expense' },
  { name: 'Healthcare', icon: '🏥', color: '#ef4444', category_type: 'expense' },
  { name: 'Entertainment', icon: '🎬', color: '#8b5cf6', category_type: 'expense' },
  { name: 'Dining Out', icon: '🍽️', color: '#ec4899', category_type: 'expense' },
  { name: 'Shopping', icon: '🛍️', color: '#6366f1', category_type: 'expense' },
  { name: 'Education', icon: '📚', color: '#14b8a6', category_type: 'expense' },
  { name: 'Insurance', icon: '🛡️', color: '#6b7280', category_type: 'expense' },
  { name: 'Rent/Mortgage', icon: '🏠', color: '#dc2626', category_type: 'expense' },
  { name: 'Subscriptions', icon: '📱', color: '#7c3aed', category_type: 'expense' },
  { name: 'Personal Care', icon: '💇', color: '#f97316', category_type: 'expense' },
  { name: 'Gifts', icon: '🎁', color: '#ec4899', category_type: 'expense' },
  { name: 'Travel', icon: '✈️', color: '#0ea5e9', category_type: 'expense' },
  { name: 'Fitness', icon: '💪', color: '#22c55e', category_type: 'expense' },
  { name: 'Other Expenses', icon: '📝', color: '#94a3b8', category_type: 'expense' }
]

# Default income categories
income_categories = [
  { name: 'Salary', icon: '💰', color: '#10b981', category_type: 'income' },
  { name: 'Freelance', icon: '💼', color: '#3b82f6', category_type: 'income' },
  { name: 'Investment', icon: '📈', color: '#8b5cf6', category_type: 'income' },
  { name: 'Rental Income', icon: '🏢', color: '#f59e0b', category_type: 'income' },
  { name: 'Business', icon: '🏪', color: '#ec4899', category_type: 'income' },
  { name: 'Bonus', icon: '🎯', color: '#14b8a6', category_type: 'income' },
  { name: 'Gifts Received', icon: '🎁', color: '#f43f5e', category_type: 'income' },
  { name: 'Refunds', icon: '↩️', color: '#6366f1', category_type: 'income' },
  { name: 'Other Income', icon: '💵', color: '#22c55e', category_type: 'income' }
]

# Create expense categories
expense_categories.each do |category_data|
  Category.create!(
    name: category_data[:name],
    icon: category_data[:icon],
    color: category_data[:color],
    category_type: category_data[:category_type],
    is_default: true,
    is_active: true,
    user_id: nil
  )
  Rails.logger.debug { "Created default expense category: #{category_data[:name]}" }
end

# Create income categories
income_categories.each do |category_data|
  Category.create!(
    name: category_data[:name],
    icon: category_data[:icon],
    color: category_data[:color],
    category_type: category_data[:category_type],
    is_default: true,
    is_active: true,
    user_id: nil
  )
  Rails.logger.debug { "Created default income category: #{category_data[:name]}" }
end

Rails.logger.debug { "Seed completed! Created #{Category.count} default categories." }
Rails.logger.debug { "  - #{Category.where(category_type: 'expense').count} expense categories" }
Rails.logger.debug { "  - #{Category.where(category_type: 'income').count} income categories" }
