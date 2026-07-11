'use client'

import { useQuery } from '@tanstack/react-query'
import { getAllExpensesAction } from '@/app/actions/expenses'
import { Receipt, Calendar, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { Expense } from '@/types/types'

export default function ExpensesPage() {
  const { data: expenses = [], isLoading } = useQuery<Expense[]>({
    queryKey: ['expenses'],
    queryFn: getAllExpensesAction,
  })

  const totalOutflow = expenses.reduce((acc, curr) => acc + curr.amount, 0)

  return (
    <div className='space-y-8 animate-in fade-in duration-300'>
      <div>
        <h1 className='text-2xl font-bold text-slate-900 md:text-3xl'>
          Expense Stream Ledger
        </h1>
        <p className='text-sm text-slate-500'>
          Comprehensive chronological line item layout of all cash deductions.
        </p>
      </div>

      {/* Global Outflow Summary Card */}
      <div className='max-w-xs rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between text-slate-400'>
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Accumulated Expenses
          </span>
          <Receipt className='h-5 w-5 text-rose-500' />
        </div>
        <h3 className='mt-2 text-2xl font-bold text-slate-900'>
          {isLoading
            ? '...'
            : `₦${totalOutflow.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
        </h3>
      </div>

      {/* Main Expense Table Container */}
      <div className='rounded-2xl border border-slate-200/60 bg-white shadow-sm overflow-hidden'>
        {isLoading ? (
          <div className='p-12 text-center text-sm text-slate-400 animate-pulse'>
            Streaming expense ledgers...
          </div>
        ) : expenses.length === 0 ? (
          <div className='p-12 text-center text-slate-500 text-sm'>
            No expenses logged yet across your errands.
          </div>
        ) : (
          <div className='w-full overflow-x-auto'>
            <table className='w-full text-left border-collapse table-fixed sm:table-auto'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/70 text-xs font-semibold uppercase text-slate-400'>
                  <th className='px-4 py-4 sm:px-6'>Expense Item</th>
                  <th className='hidden sm:table-cell px-6 py-4'>
                    Merchant/Vendor
                  </th>
                  <th className='hidden md:table-cell px-6 py-4'>
                    Origin Errand Source
                  </th>
                  <th className='px-4 py-4 sm:px-6 text-right w-[120px] sm:w-auto'>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 text-sm text-slate-600'>
                {expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className='hover:bg-slate-50/50 transition-colors'
                  >
                    {/* Primary cell: Expands dynamically on mobile layout */}
                    <td className='px-4 py-4 sm:px-6 vertical-align-top'>
                      <div className='font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-none capitalize'>
                        {expense.description}
                      </div>

                      {/* Sub-context bundle layout displayed explicitly on mobile screens */}
                      <div className='flex flex-col gap-0.5 mt-1 sm:hidden text-xs text-slate-400'>
                        <span className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          {new Date(expense.expenseDate).toLocaleDateString(
                            undefined,
                            { month: 'short', day: 'numeric' },
                          )}
                        </span>
                        {expense.vendor && (
                          <span className='truncate max-w-[160px]'>
                            Vendor: {expense.vendor}
                          </span>
                        )}
                        <div className='mt-0.5'>
                          <Link
                            href={`/errands/${expense.errandId}`}
                            className='inline-flex items-center gap-0.5 font-medium text-emerald-600 underline underline-offset-2'
                          >
                            <span>{expense.errand?.title}</span>
                            <ArrowUpRight className='h-2.5 w-2.5' />
                          </Link>
                        </div>
                      </div>

                      {/* Desktop-only date metadata tag */}
                      <div className='hidden sm:flex text-xs text-slate-400 mt-0.5 items-center gap-1'>
                        <Calendar className='h-3 w-3' />
                        {new Date(expense.expenseDate).toLocaleDateString(
                          undefined,
                          { month: 'short', day: 'numeric' },
                        )}
                      </div>
                    </td>

                    {/* Vendor Column - Hidden on mobile screen views */}
                    <td className='hidden sm:table-cell px-6 py-4 text-slate-500 truncate max-w-[140px] lg:max-w-none'>
                      {expense.vendor || '—'}
                    </td>

                    {/* Origin Errand Source Column - Hidden on mobile/tablet views */}
                    <td className='hidden md:table-cell px-6 py-4'>
                      <Link
                        href={`/errands/${expense.errandId}`}
                        className='group inline-flex items-center gap-1 font-medium text-emerald-600 hover:text-emerald-700 underline underline-offset-2'
                      >
                        <span className='truncate max-w-[150px] lg:max-w-none'>
                          {expense.errand?.title}
                        </span>
                        <ArrowUpRight className='h-3 w-3 transition-transform group-hover:translate-x-0.5' />
                      </Link>
                    </td>

                    {/* Numeric Value Output Cell */}
                    <td className='px-4 py-4 sm:px-6 text-right font-bold text-slate-900 whitespace-nowrap align-top sm:align-middle'>
                      -₦
                      {expense.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
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
