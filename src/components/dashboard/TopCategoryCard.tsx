import { CATEGORY_MAP } from '@/lib/categories'
import { Sparkles } from 'lucide-react'

interface TopCategoryProps {
  categoryName?: string
  amount?: number
  percentage?: number
  isLoading: boolean
}

export default function TopCategoryCard({
  categoryName,
  amount,
  percentage,
  isLoading,
}: TopCategoryProps) {
  if (isLoading || !categoryName) {
    return (
      <div className='h-[140px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  const config = CATEGORY_MAP[categoryName] || CATEGORY_MAP.OTHER
  const Icon = config.icon

  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm flex flex-col justify-between h-full'>
      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold uppercase tracking-wider text-slate-400'>
          Top Category
        </span>
        <Sparkles className='h-3.5 w-3.5 text-amber-500' />
      </div>

      <div className='mt-3 flex items-center gap-3'>
        <div
          className={`p-2.5 rounded-xl bg-slate-50 border border-slate-100 ${config.color}`}
        >
          <Icon className='h-5 w-5' />
        </div>
        <div>
          <h4 className='text-base font-bold text-slate-900'>{config.label}</h4>
          <p className='text-xl font-black text-slate-900 mt-0.5'>
            ₦{(amount ?? 0).toLocaleString()}
          </p>
        </div>
      </div>

      <p className='text-xs font-medium text-slate-500 mt-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 w-fit'>
        {percentage ?? 0}% of all cash outflows
      </p>
    </div>
  )
}
