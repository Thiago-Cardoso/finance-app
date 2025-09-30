# frozen_string_literal: true

FactoryBot.define do
  factory :transaction do
    association :user
    association :category, :expense
    association :account

    description { Faker::Lorem.sentence(word_count: 3) }
    amount { Faker::Number.decimal(l_digits: 2, r_digits: 2) }
    transaction_type { 'expense' }
    date { Date.current }

    trait :income do
      transaction_type { 'income' }
      association :category, :income
    end

    trait :expense do
      transaction_type { 'expense' }
      association :category, :expense
    end

    trait :transfer do
      transaction_type { 'transfer' }
      association :transfer_account, factory: :account
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