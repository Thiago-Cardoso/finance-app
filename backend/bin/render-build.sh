#!/usr/bin/env bash
# exit on error
set -o errexit

# Change to backend directory
cd "$(dirname "$0")/.."

# Install dependencies
bundle install

# Precompile assets (if needed)
# bundle exec rails assets:precompile

# Run database migrations
bundle exec rails db:migrate

# Seed database with default categories
echo "Seeding database with default categories..."
bundle exec rails db:seed

echo "Build completed successfully!"
