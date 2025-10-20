# frozen_string_literal: true

FactoryBot.define do
  factory :account do
    association :user
    sequence(:name) { |n| "Account #{n}" }
    account_type { 'checking' }
    initial_balance { 1000.00 }
    current_balance { 1000.00 }
    is_active { true }

    trait :checking do
      account_type { 'checking' }
    end

    trait :savings do
      account_type { 'savings' }
    end

    trait :credit_card do
      account_type { 'credit_card' }
    end

    trait :investment do
      account_type { 'investment' }
    end

    trait :cash do
      account_type { 'cash' }
    end

    trait :inactive do
      is_active { false }
    end
  end
end
