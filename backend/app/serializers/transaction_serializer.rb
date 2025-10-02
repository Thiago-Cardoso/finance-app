# frozen_string_literal: true

class TransactionSerializer
  def initialize(transaction)
    @transaction = transaction
  end

  def as_json
    if @transaction.respond_to?(:each)
      @transaction.map { |t| serialize_single(t) }
    else
      serialize_single(@transaction)
    end
  end

  private

  def serialize_single(transaction)
    {
      id: transaction.id,
      description: transaction.description,
      amount: formatted_amount(transaction.amount, transaction.transaction_type),
      raw_amount: transaction.amount.to_f,
      transaction_type: transaction.transaction_type,
      date: transaction.date.strftime('%Y-%m-%d'),
      notes: transaction.notes,
      category: serialize_category(transaction.category),
      account: serialize_account(transaction.account),
      transfer_account: serialize_account(transaction.transfer_account),
      created_at: transaction.created_at.iso8601,
      updated_at: transaction.updated_at.iso8601
    }
  end

  def serialize_category(category)
    return nil unless category

    {
      id: category.id,
      name: category.name,
      color: category.color,
      icon: category.icon,
      category_type: category.category_type
    }
  end

  def serialize_account(account)
    return nil unless account

    {
      id: account.id,
      name: account.name,
      account_type: account.account_type,
      current_balance: account.current_balance.to_f
    }
  end

  def formatted_amount(amount, type)
    case type
    when 'expense'
      prefix = '-'
      format('%<prefix>s%<amount>.2f', prefix: prefix, amount: amount)
    when 'transfer'
      format('%.2f', amount)
    else
      prefix = '+'
      format('%<prefix>s%<amount>.2f', prefix: prefix, amount: amount)
    end
  end
end
