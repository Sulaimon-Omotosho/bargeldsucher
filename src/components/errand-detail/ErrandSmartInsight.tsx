'use client'

import { SerializedExpense } from '@/types/types'
import { TrendingUp, ShoppingBag, Landmark, Percent } from 'lucide-react'

interface ErrandSmartInsightsProps {
  expenses: SerializedExpense[]
  initialFunding: number
  remainingCash: number
}

export default function ErrandSmartInsights({
  expenses,
  initialFunding,
  remainingCash,
}: ErrandSmartInsightsProps) {
  const totalCount = expenses.length

  // 1. Math Analytics Calculations Engine
  // Find Largest Transaction item safely
  const largestItem =
    totalCount > 0
      ? expenses.reduce(
          (max, curr) =>
            Number(curr.amount) > Number(max.amount) ? curr : max,
          expenses[0],
        )
      : null

  // Calculate Remaining Liquid Asset Percentage Allocation
  const remainingPercent =
    initialFunding > 0
      ? Math.max(Math.round((remainingCash / initialFunding) * 100), 0)
      : 0

  // Aggregate Vendor Expenditures dynamically to identify the heavy hitter
  const vendorTotals: Record<string, number> = {}
  expenses.forEach((exp) => {
    const vendorName = (exp as any).vendor?.trim() || 'Direct Cash'
    vendorTotals[vendorName] =
      (vendorTotals[vendorName] || 0) + Number(exp.amount)
  })

  const topVendor =
    Object.keys(vendorTotals).length > 0
      ? Object.entries(vendorTotals).reduce((max, curr) =>
          curr[1] > max[1] ? curr : max,
        )
      : null

  // Extract most recurrent descriptive item categories
  const phraseCounts: Record<string, number> = {}
  expenses.forEach((exp) => {
    const word = exp.description?.trim().toLowerCase() || 'miscellaneous'
    phraseCounts[word] = (phraseCounts[word] || 0) + 1
  })

  const mostFrequentItem =
    Object.keys(phraseCounts).length > 0
      ? Object.entries(phraseCounts).reduce((max, curr) =>
          curr[1] > max[1] ? curr : max,
        )[0]
      : 'None'

  return (
    <div className='space-y-3'>
      <div>
        <h3 className='text-sm font-bold text-slate-400 uppercase tracking-wider'>
          Smart Workspace Insights
        </h3>
        <p className='text-xs text-slate-400'>
          Automated intelligence metrics computed from live ledger entries.
        </p>
      </div>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Metric A: Largest Purchase */}
        <div className='bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-start gap-3'>
          <div className='p-2 bg-slate-50 text-slate-700 rounded-lg shrink-0 mt-0.5'>
            <TrendingUp className='h-4 w-4' />
          </div>
          <div className='truncate min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
              Largest Purchase
            </span>
            <span className='text-sm font-black text-slate-900 block truncate capitalize mt-0.5'>
              {largestItem ? largestItem.description : 'N/A'}
            </span>
            {largestItem && (
              <span className='text-xs font-semibold text-slate-500'>
                ₦{Number(largestItem.amount).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Metric B: Top Supplier Account */}
        <div className='bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-start gap-3'>
          <div className='p-2 bg-slate-50 text-slate-700 rounded-lg shrink-0 mt-0.5'>
            <Landmark className='h-4 w-4' />
          </div>
          <div className='truncate min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
              Top Vendor Burn
            </span>
            <span className='text-sm font-black text-slate-900 block truncate capitalize mt-0.5'>
              {topVendor ? topVendor[0] : 'N/A'}
            </span>
            {topVendor && (
              <span className='text-xs font-semibold text-slate-500'>
                ₦{topVendor[1].toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Metric C: Most Frequent Purpose */}
        <div className='bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-start gap-3'>
          <div className='p-2 bg-slate-50 text-slate-700 rounded-lg shrink-0 mt-0.5'>
            <ShoppingBag className='h-4 w-4' />
          </div>
          <div className='truncate min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
              Most Purchases
            </span>
            <span className='text-sm font-black text-slate-900 block truncate capitalize mt-1'>
              {mostFrequentItem}
            </span>
          </div>
        </div>

        {/* Metric D: Relative Balance Runway */}
        <div className='bg-white border border-slate-200/60 p-4 rounded-xl shadow-sm flex items-start gap-3'>
          <div className='p-2 bg-slate-50 text-slate-700 rounded-lg shrink-0 mt-0.5'>
            <Percent className='h-4 w-4' />
          </div>
          <div className='truncate min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
              Remaining Capital
            </span>
            <span
              className={`text-sm font-black block mt-1 ${remainingCash < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
            >
              {remainingPercent}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
