import { Skeleton } from '@/components/ui/skeleton'

export default function ErrandDetailSkeleton() {
  return (
    <div className='space-y-8 p-4 md:p-0'>
      {/* Back to Safety Navigation Bar Skeleton */}
      <div>
        <div className='inline-flex items-center gap-2'>
          <Skeleton className='h-4 w-4 rounded-full' />
          <Skeleton className='h-4 w-28 rounded' />
        </div>
      </div>

      {/* Main Core Meta Header Title Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-64 md:w-80 rounded-lg' />
        <Skeleton className='h-4 w-96 max-w-full rounded-md' />
      </div>

      {/* Granular Calculations Overview Row Skeleton */}
      <div className='grid gap-4 sm:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-3'
          >
            <Skeleton className='h-3 w-28 rounded' />
            <div className='flex items-center justify-between pt-1'>
              <Skeleton className='h-6 w-24 rounded-md' />
              <Skeleton className='h-5 w-5 rounded-md' />
            </div>
          </div>
        ))}
      </div>

      {/* Expense Ledger Segment Skeleton */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6'>
        <div className='space-y-2 border-b border-slate-100 pb-4'>
          <Skeleton className='h-5 w-44 rounded-md' />
          <Skeleton className='h-3.5 w-64 rounded' />
        </div>

        {/* Stacked Ledger Rows Skeleton */}
        <div className='space-y-4'>
          {[1, 2, 3].map((row) => (
            <div
              key={row}
              className='flex items-center justify-between py-3.5 first:pt-0 last:pb-0'
            >
              <div className='space-y-2'>
                <Skeleton className='h-4 w-48 rounded' />
                <Skeleton className='h-3 w-24 rounded' />
              </div>
              <Skeleton className='h-4 w-20 rounded-md' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
