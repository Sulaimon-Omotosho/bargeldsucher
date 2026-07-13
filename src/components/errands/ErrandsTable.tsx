'use client'

import Link from 'next/link'
import { Errand } from '@/types/types'

interface ErrandsTableProps {
  errands: Errand[]
}

export default function ErrandsTable({ errands }: ErrandsTableProps) {
  if (errands.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/60 bg-white shadow-sm p-12 text-center'>
        <p className='text-slate-500 text-sm'>
          No errands recorded yet. Click 'New Errand' to log your first cash
          advance.
        </p>
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden'>
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
            {errands.map((errand) => {
              const expenseCount = errand.expenses?.length ?? 0

              return (
                <tr
                  key={errand.id}
                  className='hover:bg-slate-50/50 transition-colors'
                >
                  <td className='px-6 py-4 max-w-[280px]'>
                    <div className='font-semibold text-slate-900 capitalize truncate'>
                      {errand.title.trim()}
                    </div>
                    {errand.description && (
                      <div className='text-xs text-slate-400 mt-0.5 truncate'>
                        {errand.description}
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 font-bold text-slate-900'>
                    ₦{Number(errand.amountReceived).toLocaleString()}
                  </td>
                  <td className='px-6 py-4'>
                    <span className='inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5 font-medium'>
                      {expenseCount}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <Link
                      href={`/errands/${errand.id}`}
                      className='text-xs font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-4'
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
