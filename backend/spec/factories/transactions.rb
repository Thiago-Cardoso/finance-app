# frozen_string_literal: true

FactoryBot.define do
  factory :transaction do
    user
    category { association :category, :expense, user: user }
    account { association :account, user: user }

    description { Faker::Lorem.sentence(word_count: 3) }
    amount { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    transaction_type { 'expense' }
    date { Date.current }

    trait :income do
      transaction_type { 'income' }
      category { association :category, :income, user: user }
    end

    trait :expense do
      transaction_type { 'expense' }
      category { association :category, :expense, user: user }
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
