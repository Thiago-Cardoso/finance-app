#!/usr/bin/env ruby
# frozen_string_literal: true

require 'securerandom'

puts "=" * 80
puts "Finance App - Secret Generator"
puts "=" * 80
puts ""
puts "Copy these values to your Render environment variables:"
puts ""
puts "-" * 80
puts "SECRET_KEY_BASE"
puts "-" * 80
puts SecureRandom.hex(64)
puts ""
puts "-" * 80
puts "JWT_SECRET_KEY"
puts "-" * 80
puts SecureRandom.hex(64)
puts ""
puts "=" * 80
puts "Keep these secrets safe and never commit them to version control!"
puts "=" * 80
