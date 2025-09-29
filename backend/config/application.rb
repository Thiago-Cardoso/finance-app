require_relative "boot"

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
# require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
# require "action_mailbox/engine"
# require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module FinanceApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`.
    config.autoload_lib(ignore: %w(assets tasks))

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # CORS configuration
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins Rails.env.production? ?
          ['https://finance-app.vercel.app'] :
          ['http://localhost:3000', 'http://127.0.0.1:3000']

        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: true,
          expose: ['Authorization']
      end
    end

    # Security middleware
    config.middleware.use Rack::Attack
    config.force_ssl = Rails.env.production?
    config.middleware.use SecureHeaders::Middleware

    # JSON responses by default
    config.middleware.use ActionDispatch::ContentSecurityPolicy::Middleware

    # Time zone
    config.time_zone = 'America/Sao_Paulo'

    # Autoload paths
    config.autoload_paths += %W(#{config.root}/lib)

    # Generators configuration
    config.generators do |g|
      g.test_framework :rspec
      g.fixture_replacement :factory_bot, dir: 'spec/factories'
      g.view_specs false
      g.helper_specs false
      g.routing_specs false
    end
  end
end