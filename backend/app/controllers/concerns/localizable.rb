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
    accept_language = request.headers['Accept-Language']
    return I18n.default_locale unless accept_language

    # Parse the Accept-Language header following RFC 2616
    locales = accept_language.split(',').map do |lang|
      lang, quality = lang.split(';q=')
      quality = quality ? quality.to_f : 1.0
      [lang.strip.downcase, quality]
    end.sort_by { |_, q| -q }

    # Try to find the first matching locale
    locales.each do |lang, _|
      base_lang = lang.split('-').first
      case base_lang
      when 'pt'
        return :'pt-BR'
      when 'en'
        return :'en-US'
      end
    end

    I18n.default_locale
  end
end
