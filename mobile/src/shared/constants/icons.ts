/**
 * Icons Constants
 *
 * Lista de ícones disponíveis do Lucide para categorias.
 * Agrupados por tipo para facilitar a seleção.
 */

import {
  Utensils,
  Car,
  Home,
  Gamepad2,
  Heart,
  BookOpen,
  ShoppingBag,
  Wrench,
  CreditCard,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Laptop,
  Tag,
  Plus,
  Wallet,
  DollarSign,
  Receipt,
  PiggyBank,
  Banknote,
  Building2,
  Bus,
  Plane,
  Train,
  Bike,
  Fuel,
  Coffee,
  Pizza,
  Wine,
  ShoppingCart,
  Gift,
  Baby,
  Dog,
  Cat,
  Music,
  Film,
  Tv,
  Monitor,
  Smartphone,
  Headphones,
  Camera,
  Scissors,
  Shirt,
  Gem,
  Watch,
  Glasses,
  Bed,
  Bath,
  Sofa,
  Lightbulb,
  Droplets,
  Flame,
  Wifi,
  Phone,
  Pill,
  Stethoscope,
  Dumbbell,
  Cigarette,
  GraduationCap,
  BookMarked,
  Newspaper,
  FileText,
  Calculator,
  Building,
  MapPin,
  Globe,
  Sun,
  Moon,
  Star,
  Zap,
  Sparkles,
  Award,
  Trophy,
  Target,
  Rocket,
  type LucideIcon,
} from 'lucide-react-native';

export interface IconDefinition {
  name: string;
  component: LucideIcon;
  category: IconCategory;
}

export type IconCategory =
  | 'food'
  | 'transport'
  | 'home'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'shopping'
  | 'finance'
  | 'tech'
  | 'lifestyle'
  | 'general';

export const AVAILABLE_ICONS: IconDefinition[] = [
  // Food & Drinks
  { name: 'Utensils', component: Utensils, category: 'food' },
  { name: 'Coffee', component: Coffee, category: 'food' },
  { name: 'Pizza', component: Pizza, category: 'food' },
  { name: 'Wine', component: Wine, category: 'food' },

  // Transport
  { name: 'Car', component: Car, category: 'transport' },
  { name: 'Bus', component: Bus, category: 'transport' },
  { name: 'Plane', component: Plane, category: 'transport' },
  { name: 'Train', component: Train, category: 'transport' },
  { name: 'Bike', component: Bike, category: 'transport' },
  { name: 'Fuel', component: Fuel, category: 'transport' },

  // Home & Living
  { name: 'Home', component: Home, category: 'home' },
  { name: 'Building2', component: Building2, category: 'home' },
  { name: 'Bed', component: Bed, category: 'home' },
  { name: 'Bath', component: Bath, category: 'home' },
  { name: 'Sofa', component: Sofa, category: 'home' },
  { name: 'Lightbulb', component: Lightbulb, category: 'home' },
  { name: 'Droplets', component: Droplets, category: 'home' },
  { name: 'Flame', component: Flame, category: 'home' },
  { name: 'Wifi', component: Wifi, category: 'home' },

  // Entertainment
  { name: 'Gamepad2', component: Gamepad2, category: 'entertainment' },
  { name: 'Music', component: Music, category: 'entertainment' },
  { name: 'Film', component: Film, category: 'entertainment' },
  { name: 'Tv', component: Tv, category: 'entertainment' },
  { name: 'Headphones', component: Headphones, category: 'entertainment' },
  { name: 'Camera', component: Camera, category: 'entertainment' },

  // Health & Fitness
  { name: 'Heart', component: Heart, category: 'health' },
  { name: 'Pill', component: Pill, category: 'health' },
  { name: 'Stethoscope', component: Stethoscope, category: 'health' },
  { name: 'Dumbbell', component: Dumbbell, category: 'health' },
  { name: 'Cigarette', component: Cigarette, category: 'health' },

  // Education
  { name: 'BookOpen', component: BookOpen, category: 'education' },
  { name: 'GraduationCap', component: GraduationCap, category: 'education' },
  { name: 'BookMarked', component: BookMarked, category: 'education' },
  { name: 'Newspaper', component: Newspaper, category: 'education' },

  // Shopping & Fashion
  { name: 'ShoppingBag', component: ShoppingBag, category: 'shopping' },
  { name: 'ShoppingCart', component: ShoppingCart, category: 'shopping' },
  { name: 'Gift', component: Gift, category: 'shopping' },
  { name: 'Scissors', component: Scissors, category: 'shopping' },
  { name: 'Shirt', component: Shirt, category: 'shopping' },
  { name: 'Gem', component: Gem, category: 'shopping' },
  { name: 'Watch', component: Watch, category: 'shopping' },
  { name: 'Glasses', component: Glasses, category: 'shopping' },
  { name: 'Tag', component: Tag, category: 'shopping' },

  // Finance
  { name: 'Wallet', component: Wallet, category: 'finance' },
  { name: 'DollarSign', component: DollarSign, category: 'finance' },
  { name: 'Receipt', component: Receipt, category: 'finance' },
  { name: 'PiggyBank', component: PiggyBank, category: 'finance' },
  { name: 'Banknote', component: Banknote, category: 'finance' },
  { name: 'CreditCard', component: CreditCard, category: 'finance' },
  { name: 'TrendingUp', component: TrendingUp, category: 'finance' },
  { name: 'Calculator', component: Calculator, category: 'finance' },

  // Tech & Work
  { name: 'Laptop', component: Laptop, category: 'tech' },
  { name: 'Monitor', component: Monitor, category: 'tech' },
  { name: 'Smartphone', component: Smartphone, category: 'tech' },
  { name: 'Phone', component: Phone, category: 'tech' },
  { name: 'Briefcase', component: Briefcase, category: 'tech' },
  { name: 'Building', component: Building, category: 'tech' },
  { name: 'FileText', component: FileText, category: 'tech' },
  { name: 'Wrench', component: Wrench, category: 'tech' },

  // Lifestyle
  { name: 'Baby', component: Baby, category: 'lifestyle' },
  { name: 'Dog', component: Dog, category: 'lifestyle' },
  { name: 'Cat', component: Cat, category: 'lifestyle' },
  { name: 'MapPin', component: MapPin, category: 'lifestyle' },
  { name: 'Globe', component: Globe, category: 'lifestyle' },
  { name: 'Sun', component: Sun, category: 'lifestyle' },
  { name: 'Moon', component: Moon, category: 'lifestyle' },

  // General
  { name: 'Plus', component: Plus, category: 'general' },
  { name: 'MoreHorizontal', component: MoreHorizontal, category: 'general' },
  { name: 'Star', component: Star, category: 'general' },
  { name: 'Zap', component: Zap, category: 'general' },
  { name: 'Sparkles', component: Sparkles, category: 'general' },
  { name: 'Award', component: Award, category: 'general' },
  { name: 'Trophy', component: Trophy, category: 'general' },
  { name: 'Target', component: Target, category: 'general' },
  { name: 'Rocket', component: Rocket, category: 'general' },
];

/**
 * Get icon component by name
 */
export function getIconByName(name: string): LucideIcon | undefined {
  const icon = AVAILABLE_ICONS.find((i) => i.name === name);
  return icon?.component;
}

/**
 * Get icons by category
 */
export function getIconsByCategory(category: IconCategory): IconDefinition[] {
  return AVAILABLE_ICONS.filter((icon) => icon.category === category);
}

/**
 * Get all icon names
 */
export function getAllIconNames(): string[] {
  return AVAILABLE_ICONS.map((icon) => icon.name);
}

/**
 * Icon category labels for UI
 */
export const ICON_CATEGORY_LABELS: Record<IconCategory, string> = {
  food: 'Alimentação',
  transport: 'Transporte',
  home: 'Casa',
  entertainment: 'Entretenimento',
  health: 'Saúde',
  education: 'Educação',
  shopping: 'Compras',
  finance: 'Finanças',
  tech: 'Tecnologia',
  lifestyle: 'Estilo de Vida',
  general: 'Geral',
};

export default AVAILABLE_ICONS;
