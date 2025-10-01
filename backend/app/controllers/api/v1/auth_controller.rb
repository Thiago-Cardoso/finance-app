# frozen_string_literal: true

# Authentication controller for user sign up, sign in, sign out, and password management
module Api
  module V1
    class AuthController < BaseController
      skip_before_action :authenticate_user!,
                         only: %i[sign_up sign_in refresh_token reset_password update_password confirm_email]

      # POST /api/v1/auth/sign_up
      def sign_up
        user = User.new(sign_up_params)

        if user.save
          user.send_confirmation_instructions unless user.confirmed?
          tokens = JwtService.generate_tokens(user)

          render_success({
                           user: user_data(user),
                           **tokens
                         }, 'User created successfully', :created)
        else
          render_validation_errors(ActiveRecord::RecordInvalid.new(user))
        end
      end

      # POST /api/v1/auth/sign_in
      def sign_in
        user = User.find_for_database_authentication(email: sign_in_params[:email])

        if user&.valid_password?(sign_in_params[:password])
          if user.confirmed?
            tokens = JwtService.generate_tokens(user)

            render_success({
                             user: user_data(user),
                             **tokens
                           }, 'Signed in successfully')
          else
            render_error('Please confirm your email before signing in',
                         [{ field: 'email', message: 'Email not confirmed' }],
                         :unauthorized)
          end
        else
          render_error('Invalid email or password',
                       [{ field: 'credentials', message: 'Invalid email or password' }],
                       :unauthorized)
        end
      end

      # DELETE /api/v1/auth/sign_out
      def sign_out
        if current_user
          # Invalidate token by updating jti
          current_user.update!(jti: SecureRandom.uuid)
          render_success({}, 'Signed out successfully')
        else
          render_unauthorized
        end
      end

      # POST /api/v1/auth/refresh_token
      def refresh_token
        refresh_token = params[:refresh_token]
        unless refresh_token
          return render_error('Refresh token required',
                              [{ field: 'refresh_token', message: 'Refresh token is required' }])
        end

        tokens = JwtService.refresh_access_token(refresh_token)
        render_success(tokens, 'Token refreshed successfully')
      rescue JwtService::TokenInvalidError => e
        render_error('Invalid refresh token',
                     [{ field: 'refresh_token', message: e.message }],
                     :unauthorized)
      end

      # POST /api/v1/auth/reset_password
      def reset_password
        user = User.find_by(email: reset_password_params[:email])

        if user
          user.send_reset_password_instructions
        else
          # Don't reveal if email exists for security
        end
        render_success({}, 'Password reset instructions sent')
      end

      # PUT /api/v1/auth/update_password
      def update_password
        user = User.reset_password_by_token(update_password_params)

        if user.errors.empty?
          tokens = JwtService.generate_tokens(user)
          render_success({
                           user: user_data(user),
                           **tokens
                         }, 'Password updated successfully')
        else
          render_validation_errors(ActiveRecord::RecordInvalid.new(user))
        end
      end

      # POST /api/v1/auth/confirm_email
      def confirm_email
        user = User.confirm_by_token(params[:confirmation_token])

        if user.errors.empty?
          tokens = JwtService.generate_tokens(user)
          render_success({
                           user: user_data(user),
                           **tokens
                         }, 'Email confirmed successfully')
        else
          render_validation_errors(ActiveRecord::RecordInvalid.new(user))
        end
      end

      private

      # Strong parameters for sign up
      def sign_up_params
        params.require(:user).permit(:email, :password, :password_confirmation, :first_name, :last_name)
      end

      # Strong parameters for sign in
      def sign_in_params
        params.require(:user).permit(:email, :password)
      end

      # Strong parameters for reset password
      def reset_password_params
        params.require(:user).permit(:email)
      end

      # Strong parameters for update password
      def update_password_params
        params.require(:user).permit(:reset_password_token, :password, :password_confirmation)
      end

      # Format user data for API response
      def user_data(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          confirmed_at: user.confirmed_at
        }
      end
    end
  end
end