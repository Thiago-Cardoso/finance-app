# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:each) do
    # Mock credentials for JWT secret key in each test
    allow(Rails.application.credentials).to receive(:devise_jwt_secret_key).and_return('test_secret_key_minimum_32_characters_long')
    allow(Rails.application.credentials).to receive(:devise_jwt_secret_key!).and_return('test_secret_key_minimum_32_characters_long')
  end
end
