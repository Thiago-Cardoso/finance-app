# frozen_string_literal: true

module UserScoped
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def scope_to_current_user(relation)
    relation.where(user: current_user)
  end

  def ensure_user_ownership!(record)
    return if record.user_id == current_user.id

    render json: {
      success: false,
      message: 'Access denied',
      errors: [{ field: 'user', message: 'You do not have permission to access this resource' }]
    }, status: :forbidden
  end
end
