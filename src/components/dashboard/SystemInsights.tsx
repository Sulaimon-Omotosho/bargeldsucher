import { TrendingDown, Clock } from 'lucide-react'

interface ErrandTotal {
  id: string
  title: string
  percentageSpent: number
  spent: number
  allocated: number
}

interface SystemInsightsProps {
  insights?: {
    largestExpense?: {
      amount: number
      description?: string
    }
    pendingErrands: number
  }
  errandTotals?: ErrandTotal[]
}

export default function SystemInsights({
  insights,
  errandTotals,
}: SystemInsightsProps) {
  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between gap-6'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-bold text-slate-900 mb-1'>
            System Insights
          </h3>
          <p className='text-xs text-slate-400'>
            Automated summaries based on balance run rates
          </p>
        </div>

        <div className='space-y-3'>
          {insights?.largestExpense && (
            <div className='rounded-xl bg-rose-50/50 p-3 border border-rose-100/60'>
              <p className='text-xs font-semibold text-rose-800 flex items-center gap-1.5'>
                <TrendingDown className='h-3.5 w-3.5 text-rose-600' />
                Largest Expense Outflow
              </p>
              <p className='text-lg font-bold text-slate-900 mt-1'>
                ₦{insights.largestExpense.amount.toLocaleString()}
              </p>
              <p className='text-xs text-slate-500 mt-0.5 italic'>
                "
                {insights.largestExpense.description ||
                  'No description provided'}
                "
              </p>
            </div>
          )}

          <div className='rounded-xl bg-slate-50 p-3 border border-slate-100'>
            <p className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
              <Clock className='h-3.5 w-3.5 text-amber-500' />
              Pending Review Needed
            </p>
            <p className='text-xs text-slate-500 mt-1'>
              You have {insights?.pendingErrands ?? 0} errands without any
              logged expenses.
            </p>
          </div>
        </div>

        {errandTotals && errandTotals.length > 0 && (
          <div className='space-y-4 pt-2'>
            <div>
              <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                Errand Budget Tracks
              </h4>
              <p className='text-[11px] text-slate-400'>
                Allocated cash consumption rates
              </p>
            </div>

            <div className='space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar'>
              {errandTotals.map((errand) => (
                <div key={errand.id} className='space-y-1.5'>
                  <div className='flex justify-between items-center text-xs'>
                    <span className='font-semibold text-slate-700 truncate max-w-[70%]'>
                      {errand.title}
                    </span>
                    <span
                      className={`font-bold ${errand.percentageSpent > 90 ? 'text-rose-600' : 'text-slate-600'}`}
                    >
                      {errand.percentageSpent.toFixed(0)}%
                    </span>
                  </div>

                  <div className='h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/20'>
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        errand.percentageSpent > 90
                          ? 'bg-rose-500'
                          : errand.percentageSpent > 70
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(errand.percentageSpent, 100)}%`,
                      }}
                    />
                  </div>

                  <div className='flex justify-between text-[10px] text-slate-400'>
                    <span>Spent: ₦{errand.spent.toLocaleString()}</span>
                    <span>Cap: ₦{errand.allocated.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className='mt-2 pt-4 border-t border-slate-100 text-center'>
        <span className='text-[11px] font-medium text-slate-400 uppercase tracking-wider block'>
          Bargeldsucher Engine v1.0
        </span>
      </div>
    </div>
  )
}
