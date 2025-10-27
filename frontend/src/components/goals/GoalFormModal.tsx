'use client';

import { useState, useEffect } from 'react';
import { useCreateGoal, useUpdateGoal } from '@/hooks/useGoals';
import { Goal, CreateGoalData } from '@/types/goal';
import { Modal } from '@/components/ui/Modal/Modal';

interface GoalFormModalProps {
  goal: Goal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalFormModal({ goal, isOpen, onClose }: GoalFormModalProps) {
  const isEditing = !!goal;
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();


  const formatCurrency = (value: string | number): string => {
    const stringValue = typeof value === 'number' ? (value * 100).toString() : value;
    const numbers = stringValue.replace(/\D/g, '');
    if (!numbers) return '';

    const amount = parseInt(numbers) / 100;

    return amount.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;

    const numericValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(numericValue) || 0;
  };

  const [formData, setFormData] = useState<CreateGoalData>({
    name: '',
    description: '',
    target_amount: 0,
    target_date: '',
    goal_type: 'savings',
    priority: 'medium',
    category_id: undefined,
    baseline_amount: 0,
    auto_track_progress: false,
  });

  const [displayValues, setDisplayValues] = useState({
    target_amount: '',
    baseline_amount: '',
  });

  useEffect(() => {
    if (goal) {
      const targetAmount = typeof goal.target_amount === 'string'
        ? parseFloat(goal.target_amount)
        : goal.target_amount;

      const baselineAmount = goal.baseline_amount
        ? typeof goal.baseline_amount === 'string'
          ? parseFloat(goal.baseline_amount)
          : goal.baseline_amount
        : 0;

      setFormData({
        name: goal.name,
        description: goal.description || '',
        target_amount: targetAmount,
        target_date: goal.target_date,
        goal_type: goal.goal_type,
        priority: goal.priority,
        category_id: goal.category_id || undefined,
        baseline_amount: baselineAmount,
        auto_track_progress: goal.auto_track_progress,
      });

      // Formata os valores para exibição
      setDisplayValues({
        target_amount: formatCurrency(targetAmount),
        baseline_amount: formatCurrency(baselineAmount),
      });
    } else {
      // Reset form for new goal
      setFormData({
        name: '',
        description: '',
        target_amount: 0,
        target_date: '',
        goal_type: 'savings',
        priority: 'medium',
        category_id: undefined,
        baseline_amount: 0,
        auto_track_progress: false,
      });

      setDisplayValues({
        target_amount: '',
        baseline_amount: '',
      });
    }
  }, [goal, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && goal) {
        await updateGoal.mutateAsync({
          id: goal.id,
          data: formData,
        });
      } else {
        await createGoal.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      // Error is handled by the mutation hooks
      console.error('Error saving goal:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else if (name === 'target_amount' || name === 'baseline_amount') {
      const formatted = formatCurrency(value);
      setDisplayValues((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      setFormData((prev) => ({
        ...prev,
        [name]: parseCurrency(formatted),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const isSubmitting = createGoal.isPending || updateGoal.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Meta' : 'Nova Meta'}
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nome da Meta *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Ex: Viagem de férias"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
            placeholder="Descreva sua meta..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Goal Type */}
          <div>
            <label htmlFor="goal_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Meta *
            </label>
            <select
              id="goal_type"
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="savings">💰 Poupança</option>
              <option value="debt_payoff">💳 Pagamento de Dívida</option>
              <option value="investment">📈 Investimento</option>
              <option value="expense_reduction">📉 Redução de Gastos</option>
              <option value="general">🎯 Geral</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridade *
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="low">🟢 Baixa</option>
              <option value="medium">🟡 Média</option>
              <option value="high">🟠 Alta</option>
              <option value="urgent">🔴 Urgente</option>
            </select>
          </div>

          {/* Target Amount */}
          <div>
            <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor da Meta (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                R$
              </span>
              <input
                type="text"
                id="target_amount"
                name="target_amount"
                value={displayValues.target_amount}
                onChange={handleChange}
                required
                inputMode="decimal"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Target Date */}
          <div>
            <label htmlFor="target_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Limite *
            </label>
            <input
              type="date"
              id="target_date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Baseline Amount */}
          <div>
            <label htmlFor="baseline_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor Inicial (R$)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                R$
              </span>
              <input
                type="text"
                id="baseline_amount"
                name="baseline_amount"
                value={displayValues.baseline_amount}
                onChange={handleChange}
                inputMode="decimal"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Auto Track Progress */}
          <div className="flex items-center pt-7">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="auto_track_progress"
                name="auto_track_progress"
                checked={formData.auto_track_progress}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              />
            </div>
            <label htmlFor="auto_track_progress" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              Rastrear progresso automaticamente
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Salvando...
              </span>
            ) : (
              isEditing ? '✓ Atualizar Meta' : '+ Criar Meta'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
