# frozen_string_literal: true

# Utility class for Brazilian currency formatting
class CurrencyFormatter
  class << self
    # Format amount as Brazilian currency (R$ 1.234,56)
    def format(amount)
      return 'R$ 0,00' if amount.nil? || amount.zero?

      integer_part = amount.to_i.to_s.reverse.gsub(/(\d{3})(?=\d)/, '\\1.').reverse
      decimal_part = format('%.2f', amount).split('.').last

      "R$ #{integer_part},#{decimal_part}"
    end

    # Format amount with both raw and formatted values
    def format_with_raw(amount)
      {
        raw: amount.to_f,
        formatted: format(amount)
      }
    end
  end
end