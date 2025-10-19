# frozen_string_literal: true

module Api
  module V1
    # Accounts Controller for managing financial accounts
    class AccountsController < BaseController
      before_action :authenticate_user!
      before_action :set_account, only: %i[show update destroy]

      # GET /api/v1/accounts
      def index
        @accounts = Account.for_user(current_user)
                          .active
                          .order(:name)

        # Filter by type if provided
        @accounts = @accounts.by_type(params[:account_type]) if params[:account_type].present?

        # Return all accounts without pagination (useful for dropdowns)
        if params[:all] == 'true'
          render json: @accounts.map { |account|
            {
              id: account.id,
              name: account.name,
              account_type: account.account_type,
              current_balance: account.current_balance,
              is_active: account.is_active
            }
          }
        else
          paginate @accounts
        end
      end

      # GET /api/v1/accounts/:id
      def show
        render json: @account
      end

      # POST /api/v1/accounts
      def create
        @account = current_user.accounts.build(account_params)

        if @account.save
          render json: @account, status: :created
        else
          render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /api/v1/accounts/:id
      def update
        if @account.update(account_params)
          render json: @account
        else
          render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/accounts/:id
      def destroy
        if @account.update(is_active: false)
          head :no_content
        else
          render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_account
        @account = Account.for_user(current_user).find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'Account not found' }, status: :not_found
      end

      def account_params
        params.require(:account).permit(
          :name,
          :account_type,
          :initial_balance,
          :current_balance,
          :is_active
        )
      end
    end
  end
end
