import { Lightbulb, ArrowRight } from 'lucide-react'

interface SavingsOpportunityProps {
  insightText?: string
  potentialSavings?: number
  isLoading: boolean
}

export default function SavingsOpportunityCard({
  insightText,
  potentialSavings,
  isLoading,
}: SavingsOpportunityProps) {
  if (isLoading || !insightText) {
    return (
      <div className='h-[140px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  return (
    <div className='rounded-2xl border border-amber-200/60 bg-amber-50/40 p-5 shadow-sm flex flex-col justify-between h-full'>
      <div className='flex items-center gap-1.5 text-amber-800 font-bold text-xs uppercase tracking-wider'>
        <Lightbulb className='h-4 w-4 text-amber-500 fill-amber-100' />
        <span>Savings Opportunity</span>
      </div>

      <p className='text-xs font-medium text-slate-700 leading-relaxed mt-2.5'>
        {insightText}
      </p>

      <div className='mt-3 pt-3 border-t border-amber-100 flex items-center justify-between'>
        <span className='text-[11px] text-slate-500 font-medium'>
          Potential Recovery target
        </span>
        <span className='text-xs font-black text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md flex items-center gap-0.5'>
          + ₦{(potentialSavings ?? 0).toLocaleString()}{' '}
          <ArrowRight className='h-3 w-3' />
        </span>
      </div>
    </div>
  )
}
