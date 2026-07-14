import { Expense } from '@/types/types'
import { Receipt, Zap, BarChart3, TrendingUp } from 'lucide-react'

interface KpiProps {
  expenses: Expense[]
  rawExpenses: Expense[]
}

export default function ExpenseKpiCards({ expenses, rawExpenses }: KpiProps) {
  // 1. ANCHORED GLOBAL METRICS: Calculate from ALL raw data records
  const globalTotalExpenses = rawExpenses.reduce(
    (acc, curr) => acc + curr.amount,
    0,
  )

  const globalTodaySpending = rawExpenses
    .filter((e) => {
      const d = new Date(e.expenseDate)
      const target = new Date()
      return (
        d.getDate() === target.getDate() &&
        d.getMonth() === target.getMonth() &&
        d.getFullYear() === target.getFullYear()
      )
    })
    .reduce((acc, curr) => acc + curr.amount, 0)

  // 2. DYNAMIC CONTEXT METRICS: Recalculate based on active filters/searches
  const filteredTotal = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const averageExpense =
    expenses.length > 0 ? filteredTotal / expenses.length : 0
  const largestExpense =
    expenses.length > 0 ? Math.max(...expenses.map((e) => e.amount)) : 0

  const cards = [
    {
      title: 'Total Expenses (Global)',
      value: globalTotalExpenses, // Fixed anchor
      icon: Receipt,
      color: 'text-rose-500 bg-rose-50',
    },
    {
      title: "Today's Spending",
      value: globalTodaySpending, // Fixed anchor
      icon: Zap,
      color: 'text-amber-500 bg-amber-50',
    },
    {
      title: 'Average (Filtered)',
      value: averageExpense, // Dynamic context
      icon: BarChart3,
      color: 'text-blue-500 bg-blue-50',
    },
    {
      title: 'Largest (Filtered)',
      value: largestExpense, // Dynamic context
      icon: TrendingUp,
      color: 'text-purple-500 bg-purple-50',
    },
  ]

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4'>
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className='rounded-2xl border border-slate-200/70 bg-white p-4 sm:p-5 shadow-sm hover:shadow transition duration-200'
          >
            <div className='flex items-center justify-between text-slate-400'>
              <span className='text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 truncate'>
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.color}`}>
                <Icon className='h-4 w-4 shrink-0' />
              </div>
            </div>
            <h3 className='mt-2.5 text-lg sm:text-2xl font-black text-slate-900 tracking-tight'>
              ₦
              {card.value.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
        )
      })}
    </div>
  )
}
