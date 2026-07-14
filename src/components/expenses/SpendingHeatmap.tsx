'use client'

import { useMemo } from 'react'
import { Expense } from '@/types/types'

interface MonthDayBlock {
  dayNum: number
  dateStr: string
  total: number
}

// 2. Declare the type signature for the parent month bucket container
interface MonthGroup {
  monthName: string
  year: number
  days: MonthDayBlock[]
}

export default function SpendingHeatmap({ expenses }: { expenses: Expense[] }) {
  const heatmapData = useMemo(() => {
    const monthsData: MonthGroup[] = []
    const now = new Date()

    // Loop backwards for 6 calendar months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const year = d.getFullYear()
      const month = d.getMonth()
      const monthName = d.toLocaleDateString(undefined, { month: 'short' })

      const totalDaysInMonth = new Date(year, month + 1, 0).getDate()

      const days = Array.from({ length: totalDaysInMonth }, (_, index) => {
        const dayNum = index + 1
        return {
          dayNum,
          dateStr: new Date(year, month, dayNum).toDateString(),
          total: 0,
        }
      })

      monthsData.push({
        monthName,
        year,
        days,
      })
    }

    expenses.forEach((exp) => {
      const expDateStr = new Date(exp.expenseDate).toDateString()

      for (const m of monthsData) {
        const dayMatch = m.days.find((d) => d.dateStr === expDateStr)
        if (dayMatch) {
          dayMatch.total += exp.amount
          break
        }
      }
    })

    return monthsData
  }, [expenses])

  // Helper intensity layout map matrix calculator
  const getColorDensity = (amount: number) => {
    if (amount === 0) return 'bg-slate-100'
    if (amount <= 5000) return 'bg-rose-100'
    if (amount <= 20000) return 'bg-rose-300'
    if (amount <= 50000) return 'bg-rose-500'
    return 'bg-rose-700'
  }

  return (
    <div className='bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm space-y-4 w-full'>
      <div>
        <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
          Spending Density
        </h3>
        {/* <p className='text-[11px] text-slate-400 font-medium'>
          Static grid view of calendar months
        </p> */}
      </div>

      {/* Grid wrapper automatically hiding trailing months on smaller screens */}
      <div className='grid grid-cols-3 md:grid-cols-6 gap-4 pt-1'>
        {heatmapData.map((month, mIdx) => (
          <div
            key={mIdx}
            // Tailwind utilities hide the last 3 older months on screen widths below 'md'
            className={`space-y-2 ${mIdx < 3 ? 'block' : 'hidden md:block'}`}
          >
            {/* Month Title Label */}
            <div className='text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center justify-between'>
              <span>{month.monthName}</span>
              <span className='text-[9px] font-medium opacity-60'>
                {month.year}
              </span>
            </div>

            {/* Static Grid Blocks containing days of that month */}
            <div className='grid grid-cols-7 gap-1 bg-slate-50/50 p-2 rounded-xl border border-slate-100'>
              {month.days.map((day) => (
                <div
                  key={day.dayNum}
                  title={`${month.monthName} ${day.dayNum}: ₦${day.total.toLocaleString()}`}
                  className={`aspect-square w-full rounded-[3px] transition-transform duration-150 hover:scale-115 cursor-crosshair ${getColorDensity(day.total)}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Shared Interactive Footer Legend Index Indicator */}
      <div className='flex items-center justify-between text-[9px] font-bold text-slate-400 pt-1 border-t border-slate-50'>
        <span className='hidden sm:inline font-medium text-slate-400/80'>
          Hover block squares to read daily sum total logs.
        </span>
        <div className='flex items-center gap-1.5 ml-auto'>
          <span>Less</span>
          <div className='h-2.5 w-2.5 rounded-[2px] bg-slate-100' />
          <div className='h-2.5 w-2.5 rounded-[2px] bg-rose-100' />
          <div className='h-2.5 w-2.5 rounded-[2px] bg-rose-300' />
          <div className='h-2.5 w-2.5 rounded-[2px] bg-rose-500' />
          <div className='h-2.5 w-2.5 rounded-[2px] bg-rose-700' />
          <span>More</span>
        </div>
      </div>
    </div>
  )
}
