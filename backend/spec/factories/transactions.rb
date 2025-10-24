# frozen_string_literal: true

 FactoryBot.define do
  factory :transaction do
    user
    account { association :account, user: user }

    sequence(:description) { |n| "Transaction #{n}" }
    amount { 100.00 }
    transaction_type { 'expense' }
    date { Date.current }

    trait :income do
      transaction_type { 'income' }
    end

    trait :expense do
      transaction_type { 'expense' }
    end

    trait :transfer do
      transaction_type { 'transfer' }
      transfer_account { association :account, user: user }
      category { nil }
    end

    trait :last_month do
      date { 1.month.ago }
    end

    trait :this_month do
      date { Date.current.beginning_of_month }
    end
  end
end
