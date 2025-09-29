# Security headers configuration
SecureHeaders::Configuration.default do |config|
  # HSTS - HTTP Strict Transport Security
  config.hsts = "max-age=#{1.year.to_i}; includeSubdomains"

  # X-Frame-Options
  config.x_frame_options = "DENY"

  # X-Content-Type-Options
  config.x_content_type_options = "nosniff"

  # X-XSS-Protection
  config.x_xss_protection = "1; mode=block"

  # X-Download-Options
  config.x_download_options = "noopen"

  # X-Permitted-Cross-Domain-Policies
  config.x_permitted_cross_domain_policies = "none"

  # Referrer Policy
  config.referrer_policy = %w(origin-when-cross-origin strict-origin-when-cross-origin)

  # Content Security Policy - For API only, we keep it minimal
  config.csp = {
    default_src: %w('self'),
    script_src: %w('self'),
    style_src: %w('self' 'unsafe-inline'), # unsafe-inline for development
    img_src: %w('self' data: https:),
    font_src: %w('self' data:),
    connect_src: %w('self'),
    object_src: %w('none'),
    media_src: %w('self'),
    frame_src: %w('none'),
    base_uri: %w('self'),
    form_action: %w('self'),
    upgrade_insecure_requests: Rails.env.production?
  }

  # Disable CSP in development for easier debugging
  config.csp = SecureHeaders::OPT_OUT if Rails.env.development?
end