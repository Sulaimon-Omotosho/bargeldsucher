import { Star, ShieldCheck, AlertTriangle } from 'lucide-react'

interface CashHealthProps {
  score: number
  status: string
  reasons: string[]
  isLoading: boolean
}

export default function CashHealthScore({
  score,
  status,
  reasons,
  isLoading,
}: CashHealthProps) {
  const getStarRating = (val: number) => {
    if (val >= 90) return 5
    if (val >= 75) return 4
    if (val >= 50) return 3
    return 2
  }

  const starsCount = getStarRating(score)

  if (isLoading) {
    return (
      <div className='h-[200px] animate-pulse rounded-2xl bg-slate-100 border' />
    )
  }

  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 flex flex-col justify-between h-full'>
      <div>
        <div className='flex items-center justify-between'>
          <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
            Cash Health
          </h3>
          {score >= 75 ? (
            <ShieldCheck className='h-4 w-4 text-emerald-500' />
          ) : (
            <AlertTriangle className='h-4 w-4 text-amber-500' />
          )}
        </div>

        <div className='flex items-baseline gap-2 mt-4'>
          <h2 className='text-4xl font-black text-slate-900'>{score}%</h2>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              status === 'Excellent' || status === 'Good'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            }`}
          >
            {status}
          </span>
        </div>

        <div className='flex gap-0.5 mt-2'>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`h-3.5 w-3.5 ${idx < starsCount ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`}
            />
          ))}
        </div>
      </div>

      <ul className='mt-6 space-y-1.5 border-t border-slate-100 pt-4'>
        {reasons.map((reason, i) => (
          <li
            key={i}
            className='text-xs text-slate-500 flex items-start gap-1.5 leading-relaxed'
          >
            <span
              className={`h-1.5 w-1.5 rounded-full mt-1.5 shrink-0 ${score >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            />
            <span className='truncate max-w-[90%]'>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
