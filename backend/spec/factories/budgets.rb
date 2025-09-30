# frozen_string_literal: true

FactoryBot.define do
  factory :budget do
    association :user
    association :category, category_type: 'expense'

    name { "Budget for #{Faker::Commerce.department}" }
    amount { 500.00 }
    spent { 0.00 }
    period { 'monthly' }
    start_date { Date.current.beginning_of_month }
    end_date { Date.current.end_of_month }
    is_active { true }

    trait :weekly do
      period { 'weekly' }
      start_date { Date.current.beginning_of_week }
      end_date { Date.current.end_of_week }
    end

    trait :monthly do
      period { 'monthly' }
      start_date { Date.current.beginning_of_month }
      end_date { Date.current.end_of_month }
    end

    trait :yearly do
      period { 'yearly' }
      start_date { Date.current.beginning_of_year }
      end_date { Date.current.end_of_year }
    end

    trait :over_budget do
      after(:create) do |budget|
        budget.update_column(:spent, 600.00)
      end
    end

    trait :near_limit do
      after(:create) do |budget|
        budget.update_column(:spent, 450.00)
      end
    end
  end
end