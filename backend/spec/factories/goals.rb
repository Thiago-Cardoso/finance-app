# frozen_string_literal: true

FactoryBot.define do
  factory :goal do
    association :user

    title { Faker::Lorem.sentence(word_count: 4) }
    description { Faker::Lorem.paragraph }
    target_amount { 10_000.00 }
    current_amount { 0.00 }
    target_date { 6.months.from_now }
    is_achieved { false }

    trait :achieved do
      current_amount { 10_000.00 }
      is_achieved { true }
    end

    trait :in_progress do
      current_amount { 5000.00 }
      is_achieved { false }
    end

    trait :overdue do
      target_date { 1.month.ago }
      is_achieved { false }
    end

    trait :no_deadline do
      target_date { nil }
    end
  end
end
