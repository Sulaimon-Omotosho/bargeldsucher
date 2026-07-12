import { Skeleton } from '@/components/ui/skeleton'

export default function ExpensesSkeleton() {
  return (
    <div className='space-y-8 p-4 md:p-0'>
      {/* Header Segment Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-56 md:w-64 rounded-lg' />
        <Skeleton className='h-4 w-80 max-w-full rounded-md' />
      </div>

      {/* Global Outflow Summary Card Skeleton */}
      <div className='max-w-xs rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm space-y-3'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-3.5 w-36 rounded' />
          <Skeleton className='h-5 w-5 rounded-md' />
        </div>
        <Skeleton className='h-7 w-40 rounded-md' />
      </div>

      {/* Main Expense Table Container Skeleton */}
      <div className='rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden'>
        <div className='w-full overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='border-b border-slate-100 bg-slate-50/70 text-xs uppercase'>
                <th className='px-4 py-4 sm:px-6'>
                  <Skeleton className='h-3.5 w-24' />
                </th>
                <th className='hidden sm:table-cell px-6 py-4'>
                  <Skeleton className='h-3.5 w-28' />
                </th>
                <th className='hidden md:table-cell px-6 py-4'>
                  <Skeleton className='h-3.5 w-32' />
                </th>
                <th className='px-4 py-4 sm:px-6 text-right w-[120px] sm:w-auto'>
                  <Skeleton className='h-3.5 w-16 ml-auto' />
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {[1, 2, 3, 4, 5].map((row) => (
                <tr key={row}>
                  {/* Primary cell: Handles both responsive layout structures */}
                  <td className='px-4 py-4 sm:px-6 vertical-align-top space-y-2'>
                    {/* Item Description */}
                    <Skeleton className='h-4 w-40 sm:w-48 rounded' />

                    {/* Mobile Only Metadata Bundle Details */}
                    <div className='flex flex-col gap-1.5 sm:hidden pt-0.5'>
                      <Skeleton className='h-3 w-20 rounded' />
                      <Skeleton className='h-3 w-32 rounded' />
                      <Skeleton className='h-3.5 w-24 rounded' />
                    </div>

                    {/* Desktop Only Date Placement */}
                    <Skeleton className='hidden sm:flex h-3 w-24 rounded mt-1' />
                  </td>

                  {/* Vendor Column - Hidden on mobile */}
                  <td className='hidden sm:table-cell px-6 py-4'>
                    <Skeleton className='h-4 w-28 rounded' />
                  </td>

                  {/* Origin Errand Source Column - Hidden on mobile/tablet */}
                  <td className='hidden md:table-cell px-6 py-4'>
                    <Skeleton className='h-4 w-36 rounded' />
                  </td>

                  {/* Numeric Value Output Cell */}
                  <td className='px-4 py-4 sm:px-6 text-right align-top sm:align-middle'>
                    <Skeleton className='h-4 w-20 rounded ml-auto' />
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
