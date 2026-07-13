'use client'

interface ErrandBudgetProgressProps {
  initialFunding: number
  totalSpent: number
  remainingCash: number
}

export default function ErrandBudgetProgress({
  initialFunding,
  totalSpent,
  remainingCash,
}: ErrandBudgetProgressProps) {
  // Compute contextual ratios safely
  const rawPercentage =
    initialFunding > 0 ? (totalSpent / initialFunding) * 100 : 0
  const spendPercentage = Math.min(Math.round(rawPercentage), 100)
  const isOverdrawn = remainingCash < 0

  return (
    <div className='bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6'>
      <div className='grid grid-cols-3 gap-4 border-b border-slate-100 pb-4 text-center sm:text-left'>
        <div>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
            Budget
          </span>
          <span className='text-lg sm:text-xl font-black text-slate-900'>
            ₦{initialFunding.toLocaleString()}
          </span>
        </div>
        <div className='border-x border-slate-100 px-4'>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
            Spent
          </span>
          <span className='text-lg sm:text-xl font-black text-slate-700'>
            ₦{totalSpent.toLocaleString()}
          </span>
        </div>
        <div className='px-2'>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
            Remaining
          </span>
          <span
            className={`text-lg sm:text-xl font-black ${isOverdrawn ? 'text-rose-600' : 'text-emerald-600'}`}
          >
            ₦{remainingCash.toLocaleString()}
          </span>
        </div>
      </div>

      {/* High Visibility Progress Engine */}
      <div className='space-y-2'>
        <div className='h-3.5 w-full bg-slate-100 rounded-full overflow-hidden relative'>
          <div
            className={`h-full transition-all duration-500 rounded-full ${isOverdrawn ? 'bg-rose-500' : spendPercentage > 85 ? 'bg-amber-500' : 'bg-slate-900'}`}
            style={{ width: `${spendPercentage}%` }}
          />
        </div>
        <div className='flex items-center justify-between text-xs font-bold text-slate-500'>
          <span>Burn Rate Matrix</span>
          <span className={isOverdrawn ? 'text-rose-600' : 'text-slate-900'}>
            {isOverdrawn ? 'Over Budget' : `${spendPercentage}% Used`}
          </span>
        </div>
      </div>
    </div>
  )
}
