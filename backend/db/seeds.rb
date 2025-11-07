# frozen_string_literal: true

# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts 'Seeding database...'

# Clear existing default categories (only if you want to reset)
# Category.where(is_default: true).destroy_all

# Default expense categories
expense_categories = [
  { name: 'Supermercado', icon: '🛒', color: '#10b981', category_type: 'expense' },
  { name: 'Transporte', icon: '🚗', color: '#3b82f6', category_type: 'expense' },
  { name: 'Serviços Públicos', icon: '💡', color: '#f59e0b', category_type: 'expense' },
  { name: 'Saúde', icon: '🏥', color: '#ef4444', category_type: 'expense' },
  { name: 'Entretenimento', icon: '🎬', color: '#8b5cf6', category_type: 'expense' },
  { name: 'Refeições Fora', icon: '🍽️', color: '#ec4899', category_type: 'expense' },
  { name: 'Compras', icon: '🛍️', color: '#6366f1', category_type: 'expense' },
  { name: 'Educação', icon: '📚', color: '#14b8a6', category_type: 'expense' },
  { name: 'Seguro', icon: '🛡️', color: '#6b7280', category_type: 'expense' },
  { name: 'Aluguel/Hipoteca', icon: '🏠', color: '#dc2626', category_type: 'expense' },
  { name: 'Assinaturas', icon: '📱', color: '#7c3aed', category_type: 'expense' },
  { name: 'Cuidados Pessoais', icon: '💇', color: '#f97316', category_type: 'expense' },
  { name: 'Presentes', icon: '🎁', color: '#ec4899', category_type: 'expense' },
  { name: 'Viagens', icon: '✈️', color: '#0ea5e9', category_type: 'expense' },
  { name: 'Academia/Fitness', icon: '💪', color: '#22c55e', category_type: 'expense' },
  { name: 'Outras Despesas', icon: '📝', color: '#94a3b8', category_type: 'expense' }
]

# Default income categories
income_categories = [
  { name: 'Salário', icon: '💰', color: '#10b981', category_type: 'income' },
  { name: 'Freelance', icon: '💼', color: '#3b82f6', category_type: 'income' },
  { name: 'Investimentos', icon: '📈', color: '#8b5cf6', category_type: 'income' },
  { name: 'Renda de Aluguel', icon: '🏢', color: '#f59e0b', category_type: 'income' },
  { name: 'Negócio', icon: '🏪', color: '#ec4899', category_type: 'income' },
  { name: 'Bônus', icon: '🎯', color: '#14b8a6', category_type: 'income' },
  { name: 'Presentes Recebidos', icon: '🎁', color: '#f43f5e', category_type: 'income' },
  { name: 'Reembolsos', icon: '↩️', color: '#6366f1', category_type: 'income' },
  { name: 'Outras Receitas', icon: '💵', color: '#22c55e', category_type: 'income' }
]

# Create expense categories
expense_categories.each do |category_data|
  category = Category.find_or_initialize_by(
    name: category_data[:name],
    category_type: category_data[:category_type],
    is_default: true,
    user_id: nil
  )

  category.assign_attributes(
    icon: category_data[:icon],
    color: category_data[:color],
    is_active: true
  )

  if category.new_record?
    category.save!
    puts "✅ Created default expense category: #{category_data[:name]}"
  elsif category.changed?
    category.save!
    puts "♻️  Updated default expense category: #{category_data[:name]}"
  else
    puts "⏭️  Skipped (already exists): #{category_data[:name]}"
  end
end

# Create income categories
income_categories.each do |category_data|
  category = Category.find_or_initialize_by(
    name: category_data[:name],
    category_type: category_data[:category_type],
    is_default: true,
    user_id: nil
  )

  category.assign_attributes(
    icon: category_data[:icon],
    color: category_data[:color],
    is_active: true
  )

  if category.new_record?
    category.save!
    puts "✅ Created default income category: #{category_data[:name]}"
  elsif category.changed?
    category.save!
    puts "♻️  Updated default income category: #{category_data[:name]}"
  else
    puts "⏭️  Skipped (already exists): #{category_data[:name]}"
  end
end

puts "Seed completed! Created #{Category.count} default categories."
puts "  - #{Category.where(category_type: 'expense').count} expense categories"
puts "  - #{Category.where(category_type: 'income').count} income categories"