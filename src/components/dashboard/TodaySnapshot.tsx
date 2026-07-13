'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { TodaySnapshotData } from '@/types/dashboard'
import {
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Coins,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface TodaySnapshotProps {
  snapshot?: TodaySnapshotData
  isLoading: boolean
}

export default function TodaySnapshot({
  snapshot,
  isLoading,
}: TodaySnapshotProps) {
  // 1. Gather clear numerical properties safely
  const income = snapshot?.todayIncome ?? 0
  const spent = snapshot?.todaySpent ?? 0
  const txCount = snapshot?.todayTransactionsCount ?? 0
  const remainingCash = snapshot?.remainingCash ?? 0

  // 2. Evaluate operational health boundaries
  const isWalletDeficit = remainingCash < 0
  const hasHighActivity = txCount > 5

  return (
    <div className='space-y-3'>
      {/* Dynamic Header State Bar */}
      <div className='flex items-center justify-between'>
        <h2 className='text-xs font-bold uppercase tracking-widest text-slate-400'>
          Today's Ledger Snapshot
        </h2>
        <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400 tracking-wider'>
          <span>System Status</span>
          <span
            className={`h-1.5 w-1.5 rounded-full animate-pulse ${isWalletDeficit ? 'bg-rose-500' : 'bg-emerald-500'}`}
          />
        </div>
      </div>

      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        {/* Today's Income */}
        <div className='rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm flex items-center gap-3.5'>
          <div className='p-2 rounded-lg bg-emerald-50 text-emerald-600 hidden sm:block'>
            <TrendingUp className='h-4 w-4' />
          </div>
          <div className='space-y-0.5 min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 block uppercase tracking-wider'>
              Today's Inflow
            </span>
            {isLoading ? (
              <Skeleton className='h-5 w-20' />
            ) : (
              <>
                <h4 className='text-base font-black text-slate-900 truncate'>
                  ₦{income.toLocaleString()}
                </h4>
                <p className='text-[9px] text-slate-400 font-medium truncate'>
                  {income > 0
                    ? 'Fresh liquidity received'
                    : 'No dynamic inflows logged'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Today's Spent */}
        <div className='rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm flex items-center gap-3.5'>
          <div className='p-2 rounded-lg bg-rose-50 text-rose-600 hidden sm:block'>
            <TrendingDown className='h-4 w-4' />
          </div>
          <div className='space-y-0.5 min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 block uppercase tracking-wider'>
              Today's Outflow
            </span>
            {isLoading ? (
              <Skeleton className='h-5 w-20' />
            ) : (
              <>
                <h4 className='text-base font-black text-slate-900 truncate'>
                  ₦{spent.toLocaleString()}
                </h4>
                <p className='text-[9px] text-slate-400 font-medium truncate'>
                  Accumulated errand costs
                </p>
              </>
            )}
          </div>
        </div>

        {/* Today's Transactions Count */}
        <div className='rounded-xl border border-slate-200/50 bg-white p-4 shadow-sm flex items-center gap-3.5'>
          <div
            className={`p-2 rounded-lg hidden sm:block ${hasHighActivity ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}
          >
            <ArrowLeftRight className='h-4 w-4' />
          </div>
          <div className='space-y-0.5 min-w-0'>
            <span className='text-[10px] font-bold text-slate-400 block uppercase tracking-wider'>
              Activity Volume
            </span>
            {isLoading ? (
              <Skeleton className='h-5 w-12' />
            ) : (
              <>
                <h4 className='text-base font-black text-slate-900 truncate'>
                  {txCount} {txCount === 1 ? 'Log' : 'Logs'}
                </h4>
                <p
                  className={`text-[9px] font-medium truncate ${hasHighActivity ? 'text-amber-600 font-bold' : 'text-slate-400'}`}
                >
                  {hasHighActivity
                    ? 'High transaction frequency'
                    : 'Normal structural load'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Handheld Remaining Cash (Total Ledger Liquidity Buffer) */}
        <div
          className={`rounded-xl border p-4 shadow-sm flex items-center gap-3.5 col-span-2 sm:col-span-1 transition-all duration-300 ${isWalletDeficit ? 'bg-rose-50/20 border-rose-200 shadow-rose-50/10' : 'bg-white border-slate-200/50'}`}
        >
          <div
            className={`p-2 rounded-lg hidden sm:block ${isWalletDeficit ? 'bg-rose-100 text-rose-700' : 'bg-emerald-50 text-emerald-600'}`}
          >
            <Coins className='h-4 w-4' />
          </div>
          <div className='space-y-0.5 min-w-0 w-full'>
            <span className='text-[10px] font-bold text-slate-400 block uppercase tracking-wider'>
              Remaining Cash
            </span>
            {isLoading ? (
              <Skeleton className='h-5 w-24' />
            ) : (
              <>
                <h4
                  className={`text-base font-black ${isWalletDeficit ? 'text-rose-600' : 'text-emerald-600'}`}
                >
                  ₦{remainingCash.toLocaleString()}
                </h4>
                <span className='flex items-center gap-1 text-[9px] font-semibold mt-0.5'>
                  {isWalletDeficit ? (
                    <>
                      <AlertCircle className='h-2.5 w-2.5 text-rose-500 shrink-0' />
                      <span className='text-rose-600 font-bold'>
                        Overdrawn Deficit
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className='h-2.5 w-2.5 text-emerald-500 shrink-0' />
                      <span className='text-emerald-600'>
                        Liquidity Reserve Safe
                      </span>
                    </>
                  )}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
