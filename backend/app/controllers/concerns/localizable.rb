# frozen_string_literal: true

module Localizable
  extend ActiveSupport::Concern

  included do
    around_action :switch_locale
  end

  def switch_locale(&action)
    locale = extract_locale_from_header || I18n.default_locale
    I18n.with_locale(locale, &action)
  end

  private

  def extract_locale_from_header
    locale = request.headers['Accept-Language']&.scan(/^[a-z]{2}/)&.first
    return nil unless locale

    case locale
    when 'pt'
      :'pt-BR'
    when 'en'
      :'en-US'
    else
      I18n.default_locale
    end
  end
end
