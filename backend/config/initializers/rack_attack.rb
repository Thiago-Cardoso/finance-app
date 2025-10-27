# Rate limiting and attack protection
class Rack::Attack
  # Enabled by default in production, can be disabled for development
  Rack::Attack.enabled = Rails.env.production?

  # Always allow requests from localhost in development
  Rack::Attack.safelist('allow from localhost') do |req|
    '127.0.0.1' == req.ip || '::1' == req.ip if Rails.env.development?
  end

  # Allow an IP address to make requests if it has an allow list entry
  Rack::Attack.safelist('allow from allowlist') do |req|
    allowlist = ENV['RACK_ATTACK_ALLOWLIST']&.split(',') || []
    allowlist.include?(req.ip)
  end

  # Block specific IPs
  Rack::Attack.blocklist('block bad actors') do |req|
    blocklist = ENV['RACK_ATTACK_BLOCKLIST']&.split(',') || []
    blocklist.include?(req.ip)
  end

  # Throttle general requests by IP
  Rack::Attack.throttle('requests by ip', limit: 1000, period: 1.hour) do |request|
    request.ip
  end

  # Throttle login attempts by IP
  Rack::Attack.throttle('login attempts', limit: 10, period: 1.minute) do |request|
    if request.path == '/api/v1/auth/sign_in' && request.post?
      request.ip
    end
  end

  # Throttle signup attempts by IP
  Rack::Attack.throttle('signup attempts', limit: 5, period: 1.hour) do |request|
    if request.path == '/api/v1/auth/sign_up' && request.post?
      request.ip
    end
  end

  # Throttle password reset attempts
  Rack::Attack.throttle('password reset attempts', limit: 5, period: 1.hour) do |request|
    if request.path.match?(/\/api\/v1\/auth\/password/) && request.post?
      request.ip
    end
  end

  # Exponential backoff for repeated failed requests
  Rack::Attack.track("failed requests", limit: 300, period: 5.minutes) do |req|
    req.ip
  end

  # Response when throttle limit is exceeded
  self.throttled_responder = lambda do |env|
    retry_after = (env['rack.attack.match_data'] || {})[:period]
    [
      429,
      {
        'Content-Type' => 'application/json',
        'Retry-After' => retry_after.to_s
      },
      [{
        success: false,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.'
      }.to_json]
    ]
  end

  # Response when request is blocked
  self.blocklisted_responder = lambda do |env|
    [
      403,
      { 'Content-Type' => 'application/json' },
      [{
        success: false,
        error: 'Forbidden',
        message: 'Your request has been blocked.'
      }.to_json]
    ]
  end
end

# Log blocked and throttled requests
ActiveSupport::Notifications.subscribe('rack.attack') do |name, start, finish, request_id, req|
  Rails.logger.warn "Rack::Attack: #{req.env['rack.attack.match_type']} #{req.ip} #{req.request_method} #{req.fullpath}"
end