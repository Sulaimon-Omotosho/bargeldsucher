'use client'

import { useMemo, useState } from 'react'
import { Expense } from '@/types/types'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { CalendarDays } from 'lucide-react'

export default function MonthlySpendingChart({
  expenses,
}: {
  expenses: Expense[]
}) {
  // Default to the current calendar year (e.g., 2026)
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  )

  // 1. Dynamically extract all unique years where the user has active expenses
  const activeYears = useMemo(() => {
    if (expenses.length === 0) return [new Date().getFullYear()]

    const years = expenses.map((exp) => new Date(exp.expenseDate).getFullYear())
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => b - a) // Most recent first

    return uniqueYears
  }, [expenses])

  // 2. Process and aggregate chart data ONLY for the selected year
  const chartData = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]

    // Initialize empty monthly map
    const dynamicMap = months.reduce(
      (acc, month) => {
        acc[month] = 0
        return acc
      },
      {} as Record<string, number>,
    )

    // Filter by year first, then aggregate by month index
    expenses.forEach((exp) => {
      const date = new Date(exp.expenseDate)
      if (date.getFullYear() === selectedYear) {
        const monthName = months[date.getMonth()]
        dynamicMap[monthName] += exp.amount
      }
    })

    return months.map((month) => ({
      name: month,
      Amount: dynamicMap[month],
    }))
  }, [expenses, selectedYear])

  return (
    <div className='w-full space-y-4'>
      {/* Header Block with Year Selector Dropdown */}
      <div className='flex items-center justify-between gap-2'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
            Monthly Outflow Trend
          </h3>
          <p className='text-[11px] text-slate-400 font-medium'>
            Trajectory for the year {selectedYear}
          </p>
        </div>

        {/* Dynamic Year Picker */}
        <div className='relative shrink-0'>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className='rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 outline-none transition cursor-pointer appearance-none hover:bg-slate-100/70 focus:border-slate-900'
          >
            {activeYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <CalendarDays className='absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none' />
        </div>
      </div>

      {/* Chart Layout Container */}
      <div className='h-64 w-full text-[11px] font-bold'>
        {expenses.length === 0 ? (
          <div className='h-full flex items-center justify-center text-xs font-medium text-slate-400'>
            No active data records found to parse.
          </div>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' />
              <XAxis dataKey='name' stroke='#94a3b8' tickLine={false} />
              <YAxis
                stroke='#94a3b8'
                tickLine={false}
                tickFormatter={(v) =>
                  `₦${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`
                }
              />
              <Tooltip
                formatter={(value: any) => {
                  if (value === undefined || value === null)
                    return ['₦0.00', 'Spent']
                  return [`₦${Number(value).toLocaleString()}`, 'Spent']
                }}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              />
              <Line
                type='monotone'
                dataKey='Amount'
                stroke='#10b981'
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
