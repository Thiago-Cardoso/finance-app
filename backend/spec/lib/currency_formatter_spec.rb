# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CurrencyFormatter, type: :lib do
  describe '.format' do
    it 'formats positive amounts correctly' do
      expect(CurrencyFormatter.format(1234.56)).to eq('R$ 1.234,56')
    end

    it 'formats amounts with no decimal places' do
      expect(CurrencyFormatter.format(1000)).to eq('R$ 1.000,00')
    end

    it 'formats small amounts correctly' do
      expect(CurrencyFormatter.format(12.34)).to eq('R$ 12,34')
    end

    it 'formats large amounts with proper thousands separators' do
      expect(CurrencyFormatter.format(1234567.89)).to eq('R$ 1.234.567,89')
    end

    it 'handles zero amount' do
      expect(CurrencyFormatter.format(0)).to eq('R$ 0,00')
    end

    it 'handles nil amount' do
      expect(CurrencyFormatter.format(nil)).to eq('R$ 0,00')
    end

    it 'formats negative amounts correctly' do
      expect(CurrencyFormatter.format(-1234.56)).to eq('R$ -1.234,56')
    end
  end

  describe '.format_with_raw' do
    it 'returns both raw and formatted values' do
      result = CurrencyFormatter.format_with_raw(1234.56)

      expect(result[:raw]).to eq(1234.56)
      expect(result[:formatted]).to eq('R$ 1.234,56')
    end

    it 'handles zero amounts in raw format' do
      result = CurrencyFormatter.format_with_raw(0)

      expect(result[:raw]).to eq(0.0)
      expect(result[:formatted]).to eq('R$ 0,00')
    end
  end
end