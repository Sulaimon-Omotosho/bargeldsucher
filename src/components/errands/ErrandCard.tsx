'use client'

import Link from 'next/link'
import { Calendar, Layers, ArrowRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Errand } from '@/types/dashboard'

interface ErrandCardProps {
  errand: Errand
}

export default function ErrandCard({ errand }: ErrandCardProps) {
  // 1. Math Operational Engine
  const allocated = Number(errand.amountReceived)
  const spent = errand.expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  )
  const remaining = allocated - spent
  const expenseCount = errand.expenses.length

  // Safety caps execution metrics cleanly inside 0-100% ranges
  const rawPercentage = allocated > 0 ? (spent / allocated) * 100 : 0
  const displayPercent = Math.min(Math.max(rawPercentage, 0), 100)

  // 2. Derive System Health Parameters & Status Badges
  let statusText = '🟢 Active'
  let badgeStyles = 'bg-emerald-50 text-emerald-700 border-emerald-100'
  let cardStyles = 'border-slate-200/60 hover:border-slate-300'
  let progressColor = '[&>div]:bg-emerald-500'

  if (remaining < 0) {
    statusText = '🔴 Over Budget'
    badgeStyles = 'bg-rose-50 text-rose-700 border-rose-100'
    cardStyles = 'border-rose-200/70 bg-rose-50/5 hover:border-rose-300'
    progressColor = '[&>div]:bg-rose-600'
  } else if (remaining === 0 && allocated > 0) {
    statusText = '⚪ Completed'
    badgeStyles = 'bg-slate-100 text-slate-700 border-slate-200'
    progressColor = '[&>div]:bg-slate-400'
  } else if (rawPercentage >= 80) {
    statusText = '🟡 Near Limit'
    badgeStyles = 'bg-amber-50 text-amber-700 border-amber-100'
    cardStyles = 'border-amber-200/70 hover:border-amber-300'
    progressColor = '[&>div]:bg-amber-500'
  }

  // Localized string transformations for date indicators
  const formattedDate = new Date(
    errand.updatedAt || errand.createdAt,
  ).toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 flex flex-col justify-between ${cardStyles}`}
    >
      <div>
        {/* Title and Top Status Row */}
        <div className='flex items-start justify-between gap-2'>
          <h3 className='font-bold text-slate-900 text-base capitalize tracking-tight truncate max-w-[70%]'>
            {errand.title.trim()}
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${badgeStyles}`}
          >
            {statusText}
          </span>
        </div>

        {/* Optional Subtitle Meta Parameters */}
        {errand.description && (
          <p className='text-xs text-slate-400 mt-1 line-clamp-1 min-h-[16px]'>
            {errand.description}
          </p>
        )}

        {/* Metrics Grid Matrix */}
        <div className='grid grid-cols-3 gap-2 mt-5 border-b border-slate-100 pb-3.5'>
          <div>
            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-wider block'>
              Allocated
            </span>
            <span className='text-xs font-bold text-slate-800 block mt-0.5'>
              ₦{allocated.toLocaleString()}
            </span>
          </div>
          <div>
            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-wider block'>
              Spent
            </span>
            <span
              className={`text-xs font-bold block mt-0.5 ${remaining < 0 ? 'text-rose-600 font-black' : 'text-slate-700'}`}
            >
              ₦{spent.toLocaleString()}
            </span>
          </div>
          <div>
            <span className='text-[9px] font-bold text-slate-400 uppercase tracking-wider block'>
              Remaining
            </span>
            <span
              className={`text-xs font-black block mt-0.5 ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
            >
              ₦{remaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dynamic Multi-Bar Progress Tracker Stack */}
        <div className='mt-4 space-y-1.5'>
          <div className='flex justify-between items-center text-[11px] font-semibold text-slate-500'>
            <span className='flex items-center gap-1 text-[10px]'>
              <Layers className='h-3 w-3 text-slate-400' /> {expenseCount}{' '}
              {expenseCount === 1 ? 'Expense Item' : 'Expense Items'}
            </span>
            <span className={remaining < 0 ? 'text-rose-600 font-bold' : ''}>
              {rawPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress
            value={displayPercent}
            className={`h-2 rounded-full bg-slate-100 ${progressColor}`}
          />
        </div>
      </div>

      {/* Card Action Anchor Footer Layout */}
      <div className='flex items-center justify-between mt-5 pt-3 border-t border-slate-50 text-[11px] text-slate-400'>
        <span className='flex items-center gap-1 font-medium'>
          <Calendar className='h-3 w-3' /> Modified {formattedDate}
        </span>
        <Link
          href={`/errands/${errand.id}`}
          className='inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 transition-colors group'
        >
          View Log{' '}
          <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-0.5' />
        </Link>
      </div>
    </div>
  )
}
