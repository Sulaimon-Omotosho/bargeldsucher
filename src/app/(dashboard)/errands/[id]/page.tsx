'use client'

import { prisma } from '@/lib/prisma'
import { notFound, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Wallet, Receipt, Scale } from 'lucide-react'
import { Errand } from '@/types/types'
import { useQuery } from '@tanstack/react-query'
import { getErrandAction } from '@/app/actions/errands'
import CreateExpense from '@/components/dashboard/CreateExpense'

export default function ErrandDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    data: errand,
    isLoading,
    isError,
  } = useQuery<Errand | null>({
    queryKey: ['errand', id],
    queryFn: () => getErrandAction(id),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className='py-20 text-center text-slate-500'>Loading errand...</div>
    )
  }

  if (isError || !errand) {
    notFound()
  }

  // High Fidelity Financial Reductions
  const initialFunding = Number(errand.amountReceived)
  const totalSpent = errand.expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  )
  const remainingCash = initialFunding - totalSpent

  return (
    <div className='space-y-8 animate-in fade-in duration-300'>
      {/* Back to Safety Navigation Bar */}
      <div>
        <Link
          href='/errands'
          className='inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 transition'
        >
          <ArrowLeft className='h-4 w-4' />
          <span>Back to All Errands</span>
        </Link>
      </div>

      {/* Main Core Meta Header Title */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl capitalize'>
          {errand.title}
        </h1>
        {errand.description && (
          <p className='text-sm text-slate-500 mt-1'>{errand.description}</p>
        )}
      </div>

      {/* Granular Calculations Overview Row */}
      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
          <span className='text-xs font-bold text-slate-400 uppercase tracking-wider block'>
            Initial Budget
          </span>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-xl font-bold text-slate-900'>
              ₦{initialFunding.toLocaleString()}
            </span>
            <Wallet className='h-5 w-5 text-blue-500' />
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
          <span className='text-xs font-bold text-slate-400 uppercase tracking-wider block'>
            Total Logged Spent
          </span>
          <div className='mt-2 flex items-center justify-between'>
            <span className='text-xl font-bold text-slate-900'>
              ₦{totalSpent.toLocaleString()}
            </span>
            <Receipt className='h-5 w-5 text-rose-500' />
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
          <span className='text-xs font-bold text-slate-400 uppercase tracking-wider block'>
            Remaining Handheld Cash
          </span>
          <div className='mt-2 flex items-center justify-between'>
            <span
              className={`text-xl font-bold ${remainingCash < 0 ? 'text-rose-600' : 'text-emerald-600'}`}
            >
              ₦{remainingCash.toLocaleString()}
            </span>
            <Scale
              className={`h-5 w-5 ${remainingCash < 0 ? 'text-rose-500' : 'text-emerald-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Expense Ledger Segment */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-4'>
        <div>
          <h3 className='text-lg font-bold text-slate-900'>
            Allocated Expense Ledger
          </h3>
          <p className='text-xs text-slate-400 mt-0.5'>
            Individual line item tracking deductions for this errand run.
          </p>

          {/* <CreateExpense errandId={id} /> */}
        </div>

        {errand.expenses.length === 0 ? (
          <div className='p-8 text-center border-2 border-dashed border-slate-100 rounded-xl'>
            <p className='text-slate-400 text-sm'>
              No line-item expenses mapped to this errand yet.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {errand.expenses.map((expense) => (
              <div
                key={expense.id}
                className='flex items-center justify-between py-3.5 first:pt-0 last:pb-0'
              >
                <div>
                  <p className='text-sm font-semibold text-slate-900'>
                    {expense.description}
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>
                    {expense.vendor || 'Direct Vendor'}
                  </p>
                </div>
                <p className='text-sm font-bold text-slate-950'>
                  - ₦{Number(expense.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className='fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8 filter drop-shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]'>
        <CreateExpense errandId={id} />
      </div>
    </div>
  )
}
