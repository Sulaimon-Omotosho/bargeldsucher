'use client'

import { SerializedExpense } from '@/types/types'

interface ErrandQuickStatsProps {
  expenses: SerializedExpense[]
}

export default function ErrandQuickStats({ expenses }: ErrandQuickStatsProps) {
  const totalCount = expenses.length

  // Quick mathematical reductions
  const averageExpense =
    totalCount > 0
      ? Math.round(
          expenses.reduce((acc, c) => acc + Number(c.amount), 0) / totalCount,
        )
      : 0

  const largestExpense =
    totalCount > 0 ? Math.max(...expenses.map((e) => Number(e.amount))) : 0

  const todayMidnight = new Date().setHours(0, 0, 0, 0)
  const todaySpending = expenses
    .filter((e) => new Date(e.createdAt).setHours(0, 0, 0, 0) === todayMidnight)
    .reduce((acc, c) => acc + Number(c.amount), 0)

  const statItems = [
    { label: 'Expenses', value: totalCount.toString() },
    { label: 'Average Expense', value: `₦${averageExpense.toLocaleString()}` },
    { label: 'Largest Expense', value: `₦${largestExpense.toLocaleString()}` },
    { label: "Today's Spending", value: `₦${todaySpending.toLocaleString()}` },
  ]

  return (
    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
      {statItems.map((stat, i) => (
        <div
          key={i}
          className='bg-white rounded-xl border border-slate-200/60 p-4 shadow-sm flex flex-col justify-between'
        >
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
            {stat.label}
          </span>
          <span className='text-base font-black text-slate-900 mt-1 block'>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  )
}
