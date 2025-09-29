class Api::V1::HealthController < Api::V1::BaseController
  # Health check endpoint - no authentication required
  # skip_before_action :authenticate_user!

  def show
    # Basic health checks
    health_status = perform_health_checks

    if health_status[:healthy]
      success_response(
        data: health_status,
        message: 'Service is healthy'
      )
    else
      error_response(
        message: 'Service is unhealthy',
        errors: health_status[:errors],
        status: :service_unavailable
      )
    end
  end

  private

  def perform_health_checks
    checks = {
      timestamp: Time.current.iso8601,
      version: Rails.application.config.version || '1.0.0',
      environment: Rails.env,
      rails_version: Rails.version,
      ruby_version: RUBY_VERSION
    }

    errors = []

    # Database connectivity check
    begin
      ActiveRecord::Base.connection.execute('SELECT 1')
      checks[:database] = 'connected'
    rescue => e
      checks[:database] = 'disconnected'
      errors << "Database: #{e.message}"
    end

    # Redis connectivity check (if Redis is configured)
    begin
      if defined?(Redis)
        Redis.current.ping
        checks[:redis] = 'connected'
      else
        checks[:redis] = 'not_configured'
      end
    rescue => e
      checks[:redis] = 'disconnected'
      errors << "Redis: #{e.message}"
    end

    # Memory usage check
    if defined?(GC)
      checks[:memory] = {
        gc_count: GC.count,
        gc_stat: GC.stat
      }
    end

    # Overall health status
    checks[:healthy] = errors.empty?
    checks[:errors] = errors if errors.any?

    checks
  end
end