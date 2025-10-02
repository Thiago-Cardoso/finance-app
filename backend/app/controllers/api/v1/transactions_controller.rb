# frozen_string_literal: true

module Api
  module V1
    class TransactionsController < BaseController
      before_action :authenticate_user!
      before_action :set_transaction, only: %i[show update destroy]

      def index
        @transactions = current_user.transactions
                                    .includes(:category, :account, :transfer_account)
                                    .apply_filters(filter_params)
                                    .page(params[:page])
                                    .per(per_page)
                                    .order(date: :desc, created_at: :desc)

        render json: {
          success: true,
          data: TransactionSerializer.new(@transactions).as_json,
          meta: pagination_meta(@transactions)
        }
      end

      def show
        render json: {
          success: true,
          data: TransactionSerializer.new(@transaction).as_json
        }
      end

      def create
        @transaction = current_user.transactions.build(transaction_params)

        if @transaction.save
          render json: {
            success: true,
            data: TransactionSerializer.new(@transaction).as_json,
            message: 'Transaction created successfully'
          }, status: :created
        else
          render_error('Failed to create transaction', format_errors(@transaction.errors))
        end
      end

      def update
        if @transaction.update(transaction_params)
          render json: {
            success: true,
            data: TransactionSerializer.new(@transaction).as_json,
            message: 'Transaction updated successfully'
          }
        else
          render_error('Failed to update transaction', format_errors(@transaction.errors))
        end
      end

      def destroy
        @transaction.destroy

        render json: {
          success: true,
          message: 'Transaction deleted successfully'
        }
      end

      def summary
        start_date = parse_date(params[:start_date]) || Date.current.beginning_of_month
        end_date = parse_date(params[:end_date]) || Date.current.end_of_month

        summary_data = Transaction.summary_for_period(current_user, start_date, end_date)

        render json: {
          success: true,
          data: summary_data
        }
      end

      private

      def set_transaction
        @transaction = current_user.transactions.find(params[:id])
      end

      def transaction_params
        params.require(:transaction).permit(
          :description, :amount, :transaction_type, :date, :notes,
          :category_id, :account_id, :transfer_account_id
        )
      end

      def filter_params
        params.permit(
          :category_id, :transaction_type, :account_id,
          :date_from, :date_to, :search, :min_amount, :max_amount
        )
      end

      def per_page
        [params[:per_page]&.to_i || 20, 100].min
      end

      def pagination_meta(collection)
        {
          pagination: {
            current_page: collection.current_page,
            total_pages: collection.total_pages,
            total_count: collection.total_count,
            per_page: collection.limit_value
          }
        }
      end

      def format_errors(errors)
        errors.map { |error| { field: error.attribute, message: error.message } }
      end

      def parse_date(date_string)
        return nil unless date_string.present?

        Date.parse(date_string)
      rescue ArgumentError
        nil
      end
    end
  end
end
