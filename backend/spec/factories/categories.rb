# frozen_string_literal: true

FactoryBot.define do
  factory :category do
    name { Faker::Commerce.department }
    color { '#6366f1' }
    category_type { 'expense' }
    is_active { true }
    is_default { false }

    trait :income do
      category_type { 'income' }
    end

    trait :expense do
      category_type { 'expense' }
    end

    trait :default do
      user { nil }
      is_default { true }
    end

    trait :custom do
      association :user
      is_default { false }
    end

    trait :inactive do
      is_active { false }
    end
  end
end