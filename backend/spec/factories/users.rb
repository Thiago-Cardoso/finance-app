# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { 'Password123!' }
    password_confirmation { 'Password123!' }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    confirmed_at { Time.current }

    trait :unconfirmed do
      confirmed_at { nil }
    end

    trait :with_transactions do
      after(:create) do |user|
        create_list(:transaction, 5, user: user)
      end
    end

    trait :with_accounts do
      after(:create) do |user|
        create_list(:account, 3, user: user)
      end
    end

    trait :with_categories do
      after(:create) do |user|
        create_list(:category, 5, :custom, user: user)
      end
    end
  end
end
