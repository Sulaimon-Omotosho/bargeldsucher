'use client'

import Link from 'next/link'
import { Errand, Expense, ActivityLog } from '../../../generated/prisma/client'
import { ArrowLeft } from 'lucide-react'

interface FinalizedErrandBannerProps {
  errand: Errand & { expenses?: Expense[]; activities?: ActivityLog[] }
  initialFunding: number
}

export default function FinalizedErrandBanner({
  errand,
  initialFunding,
}: FinalizedErrandBannerProps) {
  // Find if there is an automated "Returned Cash" expense
  const returnedExpense = errand.expenses?.find(
    (exp) => exp.description === 'Returned Cash',
  )
  const returnedAmount = returnedExpense ? Number(returnedExpense.amount) : 0

  // Calculate actual purchases (excluding the returned cash transaction itself)
  const actualPurchases =
    errand.expenses
      ?.filter((exp) => exp.description !== 'Returned Cash')
      .reduce((sum, exp) => sum + Number(exp.amount), 0) || 0

  // Calculate remaining variance (pre-returned allocation calculations)
  const preCloseoutVariance = initialFunding - actualPurchases

  // Determine State Variant for display configuration
  let stateVariant: 'ADDED' | 'RETURNED' | 'SAVED' | 'BALANCED' = 'BALANCED'

  if (preCloseoutVariance < 0) {
    stateVariant = 'ADDED'
  } else if (preCloseoutVariance > 0) {
    if (returnedAmount > 0) {
      stateVariant = 'RETURNED'
    } else {
      stateVariant = 'SAVED'
    }
  }

  // Configuration map matching exact UI specs and colors
  const config = {
    ADDED: {
      label: 'Deficit Settled',
      badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      description: `This ledger is locked. Overspent by ₦${Math.abs(preCloseoutVariance).toLocaleString()} — additional out-of-pocket cash was injected to balance costs.`,
      statusText: 'Money Added',
      statusColor: 'text-rose-500', // RED
      statusValue: Math.abs(preCloseoutVariance),
      glowColor: 'bg-rose-500/10',
    },
    RETURNED: {
      label: 'Surplus Returned',
      badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      description: `This ledger is locked. Surplus of ₦${returnedAmount.toLocaleString()} has been safely returned to your core cash reserves.`,
      statusText: 'Cash Returned',
      statusColor: 'text-amber-500', // ORANGE
      statusValue: returnedAmount,
      glowColor: 'bg-amber-500/10',
    },
    SAVED: {
      label: 'Surplus Retained',
      badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: `This ledger is locked. Surplus of ₦${preCloseoutVariance.toLocaleString()} has been saved and retained within your running floats.`,
      statusText: 'Money Saved',
      statusColor: 'text-emerald-400', // EMERALD
      statusValue: preCloseoutVariance,
      glowColor: 'bg-emerald-500/10',
    },
    BALANCED: {
      label: 'Perfect Settle',
      badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      description:
        'This ledger is locked. Every single Naira provided was accounted for perfectly with zero variance.',
      statusText: 'Balanced',
      statusColor: 'text-slate-400',
      statusValue: 0,
      glowColor: 'bg-slate-500/5',
    },
  }[stateVariant]

  return (
    <>
      <div className='flex items-center justify-between'>
        <Link
          href='/errands'
          className='inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          <span>Back to All Errands</span>
        </Link>
      </div>
      <div className='bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden w-full'>
        {/* Dynamic Background Glow Effect */}
        <div
          className={`absolute -right-10 -bottom-10 h-32 w-32 rounded-full ${config.glowColor} blur-xl`}
        />

        <div className='space-y-1.5 z-10 text-center md:text-left'>
          <span
            className={`text-[10px] border font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-block ${config.badgeClass}`}
          >
            ✓ {config.label}
          </span>
          <h2 className='text-xl font-black tracking-tight mt-1 capitalize'>
            {errand.title}
          </h2>
          <p className='text-xs text-slate-400 max-w-md leading-relaxed'>
            {config.description}
          </p>
        </div>

        <div className='flex gap-6 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0 w-full md:w-auto justify-around z-10'>
          <div className='text-center'>
            <span className='text-[9px] text-slate-400 font-bold uppercase tracking-wider block'>
              Budget
            </span>
            <span className='text-sm font-black text-slate-300'>
              ₦{initialFunding.toLocaleString()}
            </span>
          </div>

          <div className='text-center border-x border-slate-800 px-6'>
            <span className='text-[9px] text-slate-400 font-bold uppercase tracking-wider block'>
              Spent
            </span>
            <span className='text-sm font-black text-slate-300'>
              ₦{actualPurchases.toLocaleString()}
            </span>
          </div>

          <div className='text-center'>
            <span
              className={`text-[9px] font-bold uppercase tracking-wider block ${config.statusColor}`}
            >
              {config.statusText}
            </span>
            <span className={`text-sm font-black ${config.statusColor}`}>
              ₦{config.statusValue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
