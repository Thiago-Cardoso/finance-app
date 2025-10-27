'use client';

import { useState } from 'react';
import { useAddContribution } from '@/hooks/useGoals';

interface ContributionFormProps {
  goalId: number;
  onSuccess?: () => void;
}

export function ContributionForm({ goalId, onSuccess }: ContributionFormProps) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const addContribution = useAddContribution();

  // Formata número para exibição (1234.56 -> 1.234,56)
  const formatCurrency = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseInt(numbers) / 100;
    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Converte valor formatado para número (1.234,56 -> 1234.56)
  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    const numericValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericAmount = parseCurrency(amount);
    if (!amount || numericAmount <= 0) return;

    try {
      await addContribution.mutateAsync({
        goalId,
        data: {
          amount: numericAmount,
          description: description || undefined,
        },
      });

      setAmount('');
      setDescription('');
      onSuccess?.();
    } catch (error) {
      console.error('Error adding contribution:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Valor (R$) *
          </label>
          <input
            type="text"
            id="amount"
            value={amount}
            onChange={(e) => {
              const formatted = formatCurrency(e.target.value);
              setAmount(formatted);
            }}
            required
            inputMode="decimal"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0,00"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descrição
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Pagamento mensal"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={addContribution.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {addContribution.isPending ? 'Adicionando...' : 'Adicionar Contribuição'}
        </button>
      </div>
    </form>
  );
}
