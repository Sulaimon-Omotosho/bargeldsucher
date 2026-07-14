'use client'

import { useMemo, useState } from 'react'
import { Expense } from '@/types/types'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Clock } from 'lucide-react'

type TimeframeDays = 7 | 30 | 365

export default function SpendingByCategory({
  expenses,
}: {
  expenses: Expense[]
}) {
  const [timeframe, setTimeframe] = useState<TimeframeDays>(30)

  // 1. Filter and compute category data based on the selected historical window range
  const chartData = useMemo(() => {
    const categories: Record<string, number> = {}
    let total = 0

    // Compute target historical boundary timestamp
    const boundaryDate = new Date()
    boundaryDate.setDate(boundaryDate.getDate() - timeframe)

    expenses.forEach((exp) => {
      const expDate = new Date(exp.expenseDate)

      // Strict timeframe filtering boundary condition check
      if (expDate >= boundaryDate) {
        const cat = exp.category || 'Uncategorized'
        categories[cat] = (categories[cat] || 0) + exp.amount
        total += exp.amount
      }
    })

    const COLORS = [
      '#10b981',
      '#f59e0b',
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#64748b',
    ]

    return Object.keys(categories).map((key, index) => ({
      name: key.toLowerCase(),
      value: categories[key],
      percentage:
        total > 0 ? ((categories[key] / total) * 100).toFixed(0) : '0',
      color: COLORS[index % COLORS.length],
    }))
  }, [expenses, timeframe])

  return (
    <div className='w-full h-full flex flex-col justify-between space-y-4'>
      {/* Header with Custom Timeframe Select Box Dropdown */}
      <div className='flex items-center justify-between gap-2'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
            Category Allocations
          </h3>
          <p className='text-[11px] text-slate-400 font-medium'>
            Volumetric distribution weights
          </p>
        </div>

        {/* Time Window Option Selector Wrapper Element */}
        <div className='relative shrink-0'>
          <select
            value={timeframe}
            onChange={(e) =>
              setTimeframe(Number(e.target.value) as TimeframeDays)
            }
            className='rounded-xl border border-slate-200 bg-slate-50 pl-3 pr-8 py-1.5 text-xs font-bold text-slate-700 outline-none transition cursor-pointer appearance-none hover:bg-slate-100/70 focus:border-slate-900'
          >
            <option value={7}>Past Week</option>
            <option value={30}>Past Month</option>
            <option value={365}>Past Year</option>
          </select>
          <Clock className='absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400 pointer-events-none' />
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className='h-52 flex flex-col items-center justify-center text-xs font-semibold text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50/30'>
          No records logged in the past {timeframe} days.
        </div>
      ) : (
        <div className='flex flex-col sm:flex-row items-center gap-4'>
          {/* Donut graphic core component viewport anchor */}
          <div className='h-44 w-44 shrink-0'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={chartData}
                  cx='50%'
                  cy='50%'
                  innerRadius={50}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey='value'
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => {
                    if (value === undefined || value === null) return ['₦0.00']
                    return [`₦${Number(value).toLocaleString()}`]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Context Side Legend Rows */}
          <div className='w-full space-y-1.5 max-h-44 overflow-y-auto pr-1'>
            {chartData.map((item, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between text-xs font-semibold'
              >
                <div className='flex items-center gap-2 truncate text-slate-600 capitalize'>
                  <span
                    className='h-2.5 w-2.5 shrink-0 rounded-full'
                    style={{ backgroundColor: item.color }}
                  />
                  <span className='truncate'>{item.name}</span>
                </div>
                <span className='text-slate-900 font-bold'>
                  {item.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
