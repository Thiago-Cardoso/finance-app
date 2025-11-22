/**
 * Colors Constants
 *
 * Paleta de cores pré-definidas para categorias.
 */

export interface ColorOption {
  name: string;
  value: string;
}

export const CATEGORY_COLORS: ColorOption[] = [
  // Greens
  { name: 'Verde', value: '#10B981' },
  { name: 'Verde Escuro', value: '#059669' },
  { name: 'Teal', value: '#14B8A6' },

  // Blues
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Azul Claro', value: '#0EA5E9' },
  { name: 'Ciano', value: '#06B6D4' },
  { name: 'Índigo', value: '#6366F1' },

  // Purples
  { name: 'Roxo', value: '#8B5CF6' },
  { name: 'Violeta', value: '#7C3AED' },
  { name: 'Fúcsia', value: '#D946EF' },

  // Pinks
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Rosa Claro', value: '#F472B6' },

  // Reds
  { name: 'Vermelho', value: '#EF4444' },
  { name: 'Vermelho Escuro', value: '#DC2626' },
  { name: 'Rosa Avermelhado', value: '#F43F5E' },

  // Oranges
  { name: 'Laranja', value: '#F97316' },
  { name: 'Âmbar', value: '#F59E0B' },

  // Yellows
  { name: 'Amarelo', value: '#EAB308' },
  { name: 'Lima', value: '#84CC16' },

  // Neutrals
  { name: 'Cinza', value: '#64748B' },
  { name: 'Cinza Escuro', value: '#475569' },
  { name: 'Grafite', value: '#374151' },
  { name: 'Azul Cinza', value: '#94A3B8' },
];

/**
 * Default income color
 */
export const INCOME_COLOR = '#10B981';

/**
 * Default expense color
 */
export const EXPENSE_COLOR = '#EF4444';

/**
 * Get color option by value
 */
export function getColorByValue(value: string): ColorOption | undefined {
  return CATEGORY_COLORS.find((c) => c.value.toLowerCase() === value.toLowerCase());
}

/**
 * Get all color values
 */
export function getAllColorValues(): string[] {
  return CATEGORY_COLORS.map((c) => c.value);
}

/**
 * Check if a color is valid
 */
export function isValidColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export default CATEGORY_COLORS;
