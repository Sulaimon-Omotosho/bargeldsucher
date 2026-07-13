import {
  Bus,
  Utensils,
  Briefcase,
  Zap,
  ShoppingBag,
  HelpCircle,
} from 'lucide-react'

export const CATEGORY_MAP: Record<
  string,
  { label: string; icon: any; color: string; fill: string }
> = {
  FOOD: {
    label: 'Food & Dining',
    icon: Utensils,
    color: 'text-amber-500',
    fill: 'var(--color-food)',
  },
  TRANSPORT: {
    label: 'Transport',
    icon: Bus,
    color: 'text-blue-500',
    fill: 'var(--color-transport)',
  },
  OFFICE: {
    label: 'Office Supplies',
    icon: Briefcase,
    color: 'text-indigo-500',
    fill: 'var(--color-office)',
  },
  UTILITIES: {
    label: 'Utilities & Bills',
    icon: Zap,
    color: 'text-orange-500',
    fill: 'var(--color-utilities)',
  },
  SHOPPING: {
    label: 'Shopping',
    icon: ShoppingBag,
    color: 'text-rose-500',
    fill: 'var(--color-shopping)',
  },
  OTHER: {
    label: 'Other Overhead',
    icon: HelpCircle,
    color: 'text-slate-500',
    fill: 'var(--color-other)',
  },
}
