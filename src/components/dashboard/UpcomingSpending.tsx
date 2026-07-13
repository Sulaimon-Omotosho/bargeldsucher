import { CalendarClock, ArrowUpRight } from 'lucide-react'

interface PlannedItem {
  id: string
  title: string
  totalAllocated: number
  amountRemaining: number
  expenseCount: number
  createdAt: string
}

interface UpcomingSpendingProps {
  items: PlannedItem[]
  isLoading: boolean
}

export default function UpcomingSpending({
  items,
  isLoading,
}: UpcomingSpendingProps) {
  if (isLoading) {
    return (
      <div className='h-[200px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full'>
      <div>
        <div className='flex items-center justify-between border-b border-slate-100 pb-3 mb-4'>
          <div>
            <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
              Upcoming Commitment Pools
            </h3>
            <p className='text-[10px] text-slate-400'>
              Allocated running structures awaiting execution
            </p>
          </div>
          <CalendarClock className='h-4 w-4 text-slate-400' />
        </div>

        <div className='space-y-3.5'>
          {items && items.length > 0 ? (
            items.map((item) => {
              const hasSpentMoney = item.expenseCount > 0
              const statusLabel = hasSpentMoney ? 'In Progress' : 'Not Started'
              const statusBadgeStyles = hasSpentMoney
                ? 'bg-amber-50 text-amber-700 border-amber-100/60'
                : 'bg-slate-100 text-slate-600 border-slate-200/40'

              return (
                <div
                  key={item.id}
                  className='flex items-center justify-between text-xs'
                >
                  <div className='space-y-0.5 max-w-[65%]'>
                    <p className='font-semibold text-slate-800 truncate'>
                      {item.title}
                    </p>
                    <p className='text-[10px] text-slate-400 font-medium'>
                      ₦{item.amountRemaining.toLocaleString()} left of ₦
                      {item.totalAllocated.toLocaleString()}
                    </p>
                  </div>
                  <div className='text-right'>
                    <p className='font-bold text-slate-900'>
                      ₦{item.amountRemaining.toLocaleString()}
                    </p>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border inline-block mt-0.5 ${statusBadgeStyles}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <p className='text-xs text-slate-400 text-center py-6'>
              No upcoming pending balance cycles.
            </p>
          )}
        </div>
      </div>

      <div className='mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium'>
        <span>Active Liquidity Reserves</span>
        <ArrowUpRight className='h-3.5 w-3.5' />
      </div>
    </div>
  )
}
