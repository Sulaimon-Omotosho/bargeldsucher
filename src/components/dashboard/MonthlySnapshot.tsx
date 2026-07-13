import { Wallet, TrendingUp, TrendingDown } from 'lucide-react'

interface MonthlySnapshotProps {
  stats?: {
    currentBalance: number
    totalFunding: number
    totalExpenses: number
    spendingRate: number
    safeBufferPercentage: number
  }
}

export default function MonthlySnapshot({ stats }: MonthlySnapshotProps) {
  const bufferVal = stats?.safeBufferPercentage ?? 0
  const isBufferLow = bufferVal < 20

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {/* Card 1: Handheld Cash Balance */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-slate-500'>
            Current Cash on Hand
          </span>
          <div className='rounded-xl bg-emerald-50 p-2 text-emerald-600'>
            <Wallet className='h-5 w-5' />
          </div>
        </div>
        <div className='mt-4'>
          <h3 className='text-3xl font-bold tracking-tight text-slate-900'>
            ₦{(stats?.currentBalance ?? 0).toLocaleString()}
          </h3>
          <p className='mt-1 text-xs text-slate-400 flex items-center gap-1'>
            {isBufferLow ? (
              <>
                <TrendingDown className='h-3 w-3 text-amber-500 inline' />
                <span className='text-amber-600 font-bold'>{bufferVal}%</span>
                <span className='text-slate-400'>
                  low balance runway threshold
                </span>
              </>
            ) : (
              <>
                <TrendingUp className='h-3 w-3 text-emerald-500 inline' />
                <span className='text-emerald-600 font-bold'>{bufferVal}%</span>
                <span className='text-slate-400'>safe limit buffer intact</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Card 2: Income Allocations */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-slate-500'>
            Total Month Funding
          </span>
          <div className='rounded-xl bg-blue-50 p-2 text-blue-600'>
            <TrendingUp className='h-5 w-5' />
          </div>
        </div>
        <div className='mt-4'>
          <h3 className='text-3xl font-bold tracking-tight text-slate-900'>
            ₦{(stats?.totalFunding ?? 0).toLocaleString()}
          </h3>
          <p className='mt-1 text-xs text-slate-400'>
            Received from coordinated allocations
          </p>
        </div>
      </div>

      {/* Card 3: Outbound Expenses */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 sm:col-span-2 lg:col-span-1'>
        <div className='flex items-center justify-between'>
          <span className='text-sm font-medium text-slate-500'>
            Month Cash Outflow
          </span>
          <div className='rounded-xl bg-rose-50 p-2 text-rose-600'>
            <TrendingDown className='h-5 w-5' />
          </div>
        </div>
        <div className='mt-4'>
          <h3 className='text-3xl font-bold tracking-tight text-slate-900'>
            ₦{(stats?.totalExpenses ?? 0).toLocaleString()}
          </h3>
          <p className='mt-1 text-xs text-slate-400 flex items-center gap-1'>
            <span className='text-rose-600 font-medium'>
              {stats?.spendingRate?.toFixed(1) ?? '0.0'}%
            </span>{' '}
            of total intake spent
          </p>
        </div>
      </div>
    </div>
  )
}
