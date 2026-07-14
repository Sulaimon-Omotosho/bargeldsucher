'use client'

import { useMemo, useState } from 'react'
import { Expense } from '@/types/types'
import { Store, ArrowDownLeft, Clock } from 'lucide-react'

type TimeframeDays = 7 | 30 | 365

export default function TopVendorsList({ expenses }: { expenses: Expense[] }) {
  const [timeframe, setTimeframe] = useState<TimeframeDays>(30)

  // Filter and compute vendor rankings within the selected time window range
  const topVendors = useMemo(() => {
    const vendors: Record<string, number> = {}

    // Calculate dynamic backward bounding date parameters
    const boundaryDate = new Date()
    boundaryDate.setDate(boundaryDate.getDate() - timeframe)

    expenses.forEach((exp) => {
      const expDate = new Date(exp.expenseDate)

      // Only evaluate metrics if the record falls cleanly within the timeframe
      if (expDate >= boundaryDate) {
        const name = exp.vendor?.trim() || 'Direct Expense / Out-of-pocket'
        vendors[name] = (vendors[name] || 0) + exp.amount
      }
    })

    return Object.keys(vendors)
      .map((name) => ({ name, total: vendors[name] }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3) // Return only the top three highest cash recipients
  }, [expenses, timeframe])

  return (
    <div className='w-full space-y-4'>
      {/* Header Block with Dropdown Time Window Selector Toggle */}
      <div className='flex items-center justify-between gap-2'>
        <div>
          <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
            Top Vendors Summary
          </h3>
          <p className='text-[11px] text-slate-400 font-medium'>
            Recipient entities receiving highest volume velocities
          </p>
        </div>

        {/* Dynamic Lookback Timeframe Dropdown */}
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

      {/* Dynamic Vendor Cards Layout List Grid */}
      {topVendors.length === 0 ? (
        <div className='text-center py-6 text-xs font-medium text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50/30'>
          No merchant activity tracked in the past {timeframe} days.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3.5'>
          {topVendors.map((vendor, idx) => (
            <div
              key={idx}
              className='flex items-center justify-between p-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl transition duration-150 group'
            >
              <div className='flex items-center gap-3 truncate'>
                <div className='flex items-center justify-center h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 font-black text-xs shrink-0'>
                  #{idx + 1}
                </div>
                <div className='truncate'>
                  <h4 className='text-xs font-bold text-slate-900 truncate capitalize max-w-[150px] sm:max-w-none'>
                    {vendor.name}
                  </h4>
                  <span className='text-[10px] text-slate-400 font-medium flex items-center gap-0.5'>
                    <Store className='h-2.5 w-2.5' /> Outflow partner
                  </span>
                </div>
              </div>

              <div className='text-right font-black text-slate-900 text-xs sm:text-sm tracking-tight flex items-center gap-1 shrink-0'>
                <ArrowDownLeft className='h-3 w-3 text-rose-500 shrink-0 transition-transform group-hover:translate-x-[-1px] group-hover:translate-y-[1px]' />
                ₦
                {vendor.total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
