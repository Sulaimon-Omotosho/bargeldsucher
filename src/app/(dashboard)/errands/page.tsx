'use client'

import Link from 'next/link'
import { Wallet, ClipboardList } from 'lucide-react'
import CreateErrand from '@/components/dashboard/CreateErrand'
import { useQuery } from '@tanstack/react-query'
import { getErrandsAction } from '@/app/actions/errands'
import { Errand, SerializedErrand } from '@/types/types'

export default function ErrandsPage() {
  const { data: errands = [], isLoading } = useQuery<SerializedErrand[]>({
    queryKey: ['errands'],
    queryFn: getErrandsAction,
  })

  // Metric Math Calcs
  const totalAllocated = errands.reduce(
    (acc, curr) => acc + Number(curr.amountReceived),
    0,
  )
  const totalErrandsCount = errands.length

  return (
    <div className='space-y-8 animate-in fade-in duration-300'>
      {/* Header Segment */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-slate-900 md:text-3xl'>
            Tracked Errands
          </h1>
          <p className='text-sm text-slate-500'>
            Manage advance funding records and balance usage logs.
          </p>
        </div>
        <div className='flex items-center justify-between'>
          <CreateErrand />
        </div>
      </div>

      {/* SummaryCards Component Layer */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between text-slate-400'>
            <span className='text-xs font-semibold uppercase tracking-wider'>
              Total Cash Disbursed
            </span>
            <Wallet className='h-5 w-5 text-emerald-600' />
          </div>
          <h3 className='mt-2 text-2xl font-bold text-slate-900'>
            ₦{totalAllocated.toLocaleString()}
          </h3>
        </div>

        <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
          <div className='flex items-center justify-between text-slate-400'>
            <span className='text-xs font-semibold uppercase tracking-wider'>
              Active Errand Loops
            </span>
            <ClipboardList className='h-5 w-5 text-blue-600' />
          </div>
          <h3 className='mt-2 text-2xl font-bold text-slate-900'>
            {totalErrandsCount} Logs
          </h3>
        </div>
      </div>

      {/* ErrandTable Component Layer */}
      <div className='rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden'>
        {errands.length === 0 ? (
          <div className='p-12 text-center'>
            <p className='text-slate-500 text-sm'>
              No errands recorded yet. Click 'New Errand' to log your first cash
              advance.
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-400'>
                  <th className='px-6 py-4'>Title / Purpose</th>
                  <th className='px-6 py-4'>Initial Funding</th>
                  <th className='px-6 py-4'>Logged Items</th>
                  <th className='px-6 py-4 text-right'>Action</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 text-sm text-slate-600'>
                {errands.map((errand) => (
                  <tr
                    key={errand.id}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='font-semibold text-slate-900 capitalize'>
                        {errand.title.trim()}
                      </div>
                      {errand.description && (
                        <div className='text-xs text-slate-400 mt-0.5 line-clamp-1'>
                          {errand.description}
                        </div>
                      )}
                    </td>
                    <td className='px-6 py-4 font-medium text-slate-900'>
                      ₦{Number(errand.amountReceived).toLocaleString()}
                    </td>
                    <td className='px-6 py-4'>
                      <span className='inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5'>
                        {errand.expenses.length}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-right'>
                      <Link
                        href={`/errands/${errand.id}`}
                        className='text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-4'
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
