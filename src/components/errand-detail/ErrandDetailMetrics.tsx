'use client'

import { Wallet, Receipt, Scale, AlertTriangle } from 'lucide-react'

interface ErrandDetailMetricsProps {
  initialFunding: number
  totalSpent: number
  remainingCash: number
}

export default function ErrandDetailMetrics({
  initialFunding,
  totalSpent,
  remainingCash,
}: ErrandDetailMetricsProps) {
  const isOverdrawn = remainingCash < 0

  return (
    <div className='grid gap-4 grid-cols-2 lg:grid-cols-3'>
      {/* Target Focus Panel Card: Remaining Handheld Cash */}
      <div
        className={`rounded-2xl border p-5 shadow-sm col-span-2 lg:col-span-1 transition-all ${isOverdrawn ? 'bg-rose-50/20 border-rose-200' : 'bg-emerald-50/10 border-emerald-200/60'}`}
      >
        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
          Remaining Cash
        </span>
        <div className='mt-1 flex items-center justify-between'>
          <span
            className={`text-xl font-black ${isOverdrawn ? 'text-rose-600' : 'text-emerald-600'}`}
          >
            ₦{remainingCash.toLocaleString()}
          </span>
          <Scale
            className={`h-5 w-5 ${isOverdrawn ? 'text-rose-500' : 'text-emerald-500'}`}
          />
        </div>
        {isOverdrawn && (
          <span className='text-[9px] text-rose-600 font-bold flex items-center gap-1 mt-1'>
            <AlertTriangle className='h-2.5 w-2.5' /> Deficit Violation
          </span>
        )}
      </div>

      {/* Initial Budget */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
          Initial Budget
        </span>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xl font-bold text-slate-900'>
            ₦{initialFunding.toLocaleString()}
          </span>
          <Wallet className='h-5 w-5 text-blue-500' />
        </div>
      </div>

      {/* Total Logged Spent */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
        <span className='text-[10px] font-bold text-slate-400 uppercase tracking-wider block'>
          Total Logged Spent
        </span>
        <div className='mt-1 flex items-center justify-between'>
          <span className='text-xl font-bold text-slate-900'>
            ₦{totalSpent.toLocaleString()}
          </span>
          <Receipt className='h-5 w-5 text-rose-500' />
        </div>
      </div>
    </div>
  )
}
