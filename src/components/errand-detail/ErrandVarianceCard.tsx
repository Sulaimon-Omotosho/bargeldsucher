'use client'

import { TrendingDown, TrendingUp, CheckCircle } from 'lucide-react'

interface ErrandVarianceCardProps {
  initialFunding: number
  totalSpent: number
  remainingCash: number
  isCompleted: boolean
}

export default function ErrandVarianceCard({
  initialFunding,
  totalSpent,
  isCompleted,
  remainingCash,
}: ErrandVarianceCardProps) {
  const variance = initialFunding - totalSpent
  const isOverspent = variance < 0
  const absoluteVariance = Math.abs(variance)

  // Calculate delta margin percentage
  const marginPercentage =
    initialFunding > 0
      ? Math.round((absoluteVariance / initialFunding) * 100)
      : 0

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition-all ${
        isOverspent
          ? 'bg-rose-50/10 border-rose-200'
          : variance === 0
            ? 'bg-slate-50/50 border-slate-200'
            : 'bg-emerald-50/10 border-emerald-200/60'
      }`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
            Budget Variance Analysis
          </span>
          <h4 className='text-sm font-black text-slate-900 mt-0.5'>
            {isOverspent
              ? 'Over Budget Execution'
              : variance === 0
                ? 'Exact Budget Match'
                : 'Under Budget Efficiency'}
          </h4>
        </div>

        <div
          className={`p-2 rounded-xl border ${
            isOverspent
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : variance === 0
                ? 'bg-slate-100 text-slate-600 border-slate-200'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}
        >
          {isOverspent ? (
            <TrendingUp className='h-4 w-4' />
          ) : variance === 0 ? (
            <CheckCircle className='h-4 w-4' />
          ) : (
            <TrendingDown className='h-4 w-4' />
          )}
        </div>
      </div>

      <div className='grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100/60 text-center sm:text-left'>
        <div>
          <span className='text-[9px] font-bold text-slate-400 uppercase block'>
            Allocated
          </span>
          <span className='text-sm font-bold text-slate-900'>
            ₦{initialFunding.toLocaleString()}
          </span>
        </div>
        <div className='border-x border-slate-100 px-2'>
          <span className='text-[9px] font-bold text-slate-400 uppercase block'>
            Spent
          </span>
          <span className='text-sm font-bold text-slate-800'>
            ₦{totalSpent.toLocaleString()}
          </span>
        </div>
        <div>
          <span
            className={`text-[9px] font-bold uppercase block ${isOverspent ? 'text-rose-500' : 'text-emerald-600'}`}
          >
            {isOverspent ? 'Overspent' : isCompleted ? 'Saved' : 'Available'}
          </span>
          <span
            className={`text-sm font-black ${isOverspent ? 'text-rose-600' : 'text-emerald-600'}`}
          >
            {isOverspent ? '-' : ''}₦{absoluteVariance.toLocaleString()}
          </span>
        </div>
      </div>

      <div className='mt-3.5 text-[11px] font-semibold text-slate-500'>
        This mini-project ran{' '}
        <span
          className={`font-bold ${isOverspent ? 'text-rose-600' : 'text-emerald-600'}`}
        >
          {marginPercentage}% {isOverspent ? 'over' : 'under'} budget
        </span>{' '}
        parameters.
      </div>
    </div>
  )
}
