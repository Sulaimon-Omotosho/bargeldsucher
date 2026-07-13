'use client'

import { SerializedExpense } from '@/types/types'

interface ErrandVendorBreakdownProps {
  expenses: SerializedExpense[]
  totalSpent: number
}

export default function ErrandVendorBreakdown({
  expenses,
  totalSpent,
}: ErrandVendorBreakdownProps) {
  if (expenses.length === 0) return null

  // 1. Group values directly in memory arrays
  const vendorMap: Record<string, number> = {}
  expenses.forEach((exp) => {
    const name = (exp as any).vendor?.trim() || 'Direct Cash Transaction'
    vendorMap[name] = (vendorMap[name] || 0) + Number(exp.amount)
  })

  // Sort out the highest allocation accounts first
  const sortedVendors = Object.entries(vendorMap).sort((a, b) => b[1] - a[1])

  return (
    <div className='bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4'>
      <div>
        <h3 className='text-base font-bold text-slate-900'>
          Vendor Outflow Share
        </h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Distribution weight mapping across suppliers and markets.
        </p>
      </div>

      <div className='space-y-3.5'>
        {sortedVendors.map(([vendorName, amount]) => {
          const ratio = totalSpent > 0 ? (amount / totalSpent) * 100 : 0

          return (
            <div key={vendorName} className='space-y-1.5'>
              <div className='flex items-center justify-between text-xs font-semibold'>
                <span className='text-slate-700 capitalize truncate max-w-[65%]'>
                  {vendorName}
                </span>
                <span className='text-slate-950 shrink-0 font-bold'>
                  ₦{amount.toLocaleString()}{' '}
                  <span className='text-[10px] text-slate-400 font-medium ml-1'>
                    ({ratio.toFixed(0)}%)
                  </span>
                </span>
              </div>
              <div className='h-1.5 w-full bg-slate-50 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-slate-400 rounded-full transition-all duration-300'
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
