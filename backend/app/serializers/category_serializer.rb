# frozen_string_literal: true

class CategorySerializer < ActiveModel::Serializer
  attributes :id, :name, :icon, :color, :category_type,
             :is_default, :is_active, :user_id,
             :created_at, :updated_at, :usage_stats

  def usage_stats
    {
      transactions_count: object.transactions.count,
      total_amount_current_month: object.total_amount_this_month,
      can_be_deleted: object.can_be_deleted?
    }
  end
end
