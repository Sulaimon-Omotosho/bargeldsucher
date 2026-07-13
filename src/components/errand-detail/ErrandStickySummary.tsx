'use client'

import CreateExpense from '@/components/dashboard/CreateExpense'

interface ErrandStickySummaryProps {
  id: string
  initialFunding: number
  totalSpent: number
  remainingCash: number
  isCompleted: boolean
}

export default function ErrandStickySummary({
  id,
  initialFunding,
  totalSpent,
  remainingCash,
  isCompleted,
}: ErrandStickySummaryProps) {
  return (
    <div className='sticky top-6 bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm space-y-4 hidden lg:block animate-in fade-in duration-300'>
      <div>
        <h3 className='text-xs font-black text-slate-900 uppercase tracking-wider'>
          Real-time Float Matrix
        </h3>
      </div>

      <div className='space-y-3 divide-y divide-slate-50'>
        <div className='flex justify-between items-center text-xs font-semibold text-slate-500 pt-1'>
          <span>Total Budget</span>
          <span className='text-slate-900 font-bold'>
            ₦{initialFunding.toLocaleString()}
          </span>
        </div>
        <div className='flex justify-between items-center text-xs font-semibold text-slate-500 pt-2.5'>
          <span>Spent Balance</span>
          <span className='text-slate-700 font-bold'>
            ₦{totalSpent.toLocaleString()}
          </span>
        </div>
        <div className='flex justify-between items-center text-xs font-semibold text-slate-500 pt-2.5'>
          <span>Remaining Liquidity</span>
          <span
            className={`font-black ${remainingCash < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
          >
            ₦{remainingCash.toLocaleString()}
          </span>
        </div>
      </div>

      {!isCompleted && (
        <div className='pt-2'>
          {/* Reuse your native modal insertion tool straight out of the box */}
          <CreateExpense errandId={id} />
        </div>
      )}
    </div>
  )
}
