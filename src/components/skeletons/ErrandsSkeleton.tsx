import { Skeleton } from '@/components/ui/skeleton'

export default function ErrandsSkeleton() {
  return (
    <div className='space-y-8 p-4 md:p-0'>
      {/* Header Segment Skeleton */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-44 md:w-52 rounded-lg' />
          <Skeleton className='h-4 w-72 rounded-md' />
        </div>
        <Skeleton className='h-10 w-32 rounded-xl' />
      </div>

      {/* SummaryCards Component Layer Skeleton */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {[1, 2].map((i) => (
          <div
            key={i}
            className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-3'
          >
            <div className='flex items-center justify-between'>
              <Skeleton className='h-3.5 w-28' />
              <Skeleton className='h-5 w-5 rounded-md' />
            </div>
            <Skeleton className='h-7 w-36 rounded-md' />
          </div>
        ))}
      </div>

      {/* ErrandTable Component Layer Skeleton */}
      <div className='rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-slate-100 bg-slate-50/70'>
                <th className='px-6 py-4'>
                  <Skeleton className='h-3.5 w-24' />
                </th>
                <th className='px-6 py-4'>
                  <Skeleton className='h-3.5 w-20' />
                </th>
                <th className='px-6 py-4'>
                  <Skeleton className='h-3.5 w-20' />
                </th>
                <th className='px-6 py-4 text-right'>
                  <Skeleton className='h-3.5 w-12 ml-auto' />
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {/* Title / Purpose */}
                  <td className='px-6 py-4 space-y-2'>
                    <Skeleton className='h-4 w-40 rounded' />
                    <Skeleton className='h-3 w-64 rounded' />
                  </td>
                  {/* Initial Funding */}
                  <td className='px-6 py-4'>
                    <Skeleton className='h-4 w-24 rounded' />
                  </td>
                  {/* Logged Items Count Badge */}
                  <td className='px-6 py-4'>
                    <Skeleton className='h-5 w-8 rounded-full' />
                  </td>
                  {/* Action Link */}
                  <td className='px-6 py-4 text-right'>
                    <Skeleton className='h-4 w-12 rounded ml-auto' />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
