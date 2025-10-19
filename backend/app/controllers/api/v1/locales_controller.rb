# frozen_string_literal: true

module Api
  module V1
    class LocalesController < BaseController
      skip_before_action :authenticate_user!, only: [:index, :show]

      # GET /api/v1/locales
      def index
        locales = I18n.available_locales.map do |locale|
          {
            code: locale.to_s,
            name: I18n.t('locale.name', locale: locale),
            native_name: I18n.t('locale.native_name', locale: locale)
          }
        end

        render json: {
          success: true,
          data: locales,
          default_locale: I18n.default_locale
        }
      end

      # GET /api/v1/locales/:id
      def show
        locale = params[:id].to_sym

        unless I18n.available_locales.include?(locale)
          return render json: {
            success: false,
            message: 'Locale not supported'
          }, status: :not_found
        end

        translations = I18n.backend.translations[locale] || {}

        render json: {
          success: true,
          data: {
            locale: locale,
            translations: translations
          }
        }
      end
    end
  end
end
