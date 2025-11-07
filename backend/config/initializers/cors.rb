# Be sure to restart your server when you modify this file.

# Avoid CORS issues when API is called from the frontend app.
# Handle Cross-Origin Resource Sharing (CORS) in order to accept cross-origin AJAX requests.

# Read more: https://github.com/cyu/rack-cors

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # In production, use FRONTEND_URL env variable or default domains
    # In development, allow localhost on multiple ports
    origins Rails.env.production? ?
      (ENV['FRONTEND_URL'] || 'https://finance-app.vercel.app').split(',').map(&:strip) :
      ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://localhost:3002']

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
      max_age: 86400 # 24 hours
  end
end