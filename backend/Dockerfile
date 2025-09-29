# Use the official Ruby image
FROM ruby:3.2-alpine

# Install system dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    git \
    tzdata \
    nodejs \
    npm \
    bash \
    curl

# Set working directory
WORKDIR /app

# Copy Gemfile and Gemfile.lock
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# Copy the application code
COPY . .

# Create a non-root user
RUN addgroup -g 1000 -S appuser && \
    adduser -u 1000 -S appuser -G appuser

# Change ownership of the app directory
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start the Rails server
CMD ["bundle", "exec", "rails", "server", "-b", "0.0.0.0"]