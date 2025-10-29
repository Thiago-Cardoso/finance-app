# frozen_string_literal: true

FactoryBot.define do
  factory :goal do
    association :user

    name { Faker::Lorem.words(number: 4).join(' ').capitalize }
    description { Faker::Lorem.words(number: 10).join(' ').capitalize }
    target_amount { 10_000.00 }
    current_amount { 0.00 }
    target_date { 6.months.from_now }
    goal_type { :savings }
    status { :active }

    trait :achieved do
      current_amount { 10_000.00 }
      status { :completed }
    end

    trait :in_progress do
      current_amount { 5000.00 }
      status { :active }
    end

    trait :overdue do
      target_date { 2.months.from_now }
      status { :active }

      after(:create) do |goal|
        goal.update_column(:target_date, 1.month.ago)
      end
    end

    trait :no_deadline do
      after(:create) do |goal|
        goal.update_column(:target_date, nil)
      end
    end
  end
end
