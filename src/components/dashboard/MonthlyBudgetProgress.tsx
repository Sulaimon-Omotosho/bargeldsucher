import { Progress } from '@/components/ui/progress'
import { Wallet } from 'lucide-react'

interface BudgetProgressProps {
  allocated?: number
  spent?: number
  remaining?: number
  percentageSpent?: number
  isLoading: boolean
}

export default function MonthlyBudgetProgress({
  allocated = 0,
  spent = 0,
  remaining = 0,
  percentageSpent = 0,
  isLoading,
}: BudgetProgressProps) {
  if (isLoading) {
    return (
      <div className='h-[140px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-4 h-full flex flex-col justify-between'>
      <div>
        <div className='flex items-center justify-between'>
          <span className='text-xs font-bold uppercase tracking-wider text-slate-400'>
            Budget Progress
          </span>
          <Wallet className='h-3.5 w-3.5 text-slate-400' />
        </div>

        <div className='grid grid-cols-3 gap-2 mt-3 border-b border-slate-50 pb-3'>
          <div>
            <span className='text-[10px] font-medium text-slate-400 block uppercase'>
              Budget
            </span>
            <span className='text-xs font-bold text-slate-700'>
              ₦{allocated.toLocaleString()}
            </span>
          </div>
          <div>
            <span className='text-[10px] font-medium text-slate-400 block uppercase'>
              Spent
            </span>
            <span className='text-xs font-bold text-rose-600'>
              ₦{spent.toLocaleString()}
            </span>
          </div>
          <div>
            <span className='text-[10px] font-medium text-slate-400 block uppercase'>
              Remaining
            </span>
            <span className='text-xs font-bold text-emerald-600'>
              ₦{remaining.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className='space-y-1.5'>
        <div className='flex justify-between text-[11px] font-semibold text-slate-500'>
          <span>Total Usage</span>
          <span>{percentageSpent.toFixed(0)}%</span>
        </div>
        <Progress
          value={percentageSpent}
          className={`h-2.5 ${percentageSpent > 85 ? '[&>div]:bg-rose-500' : '[&>div]:bg-emerald-500'}`}
        />
      </div>
    </div>
  )
}
