'use client'

import { useRef, useState } from 'react'
import { Expense } from '@/types/types'
import { Calendar, ArrowUpRight, Loader2 } from 'lucide-react'
import Link from 'next/link'
import ExpenseDetailsDrawer from './ExpenseDetailsDrawer'

interface StreamTableProps {
  expenses: Expense[]
  isLoading: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
  onRowClick: (expense: Expense) => void
}

export default function StreamTable({
  expenses,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onRowClick,
}: StreamTableProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  // const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // const handleRowClick = (expense: Expense) => {
  //   setSelectedExpense(expense)
  //   setIsDrawerOpen(true)
  // }

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    if (
      scrollHeight - scrollTop <= clientHeight + 60 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center p-20 bg-white border border-slate-200 rounded-2xl space-y-2'>
        <Loader2 className='h-6 w-6 animate-spin text-slate-800' />
        <p className='text-xs font-semibold text-slate-400'>
          Streaming active log parameters...
        </p>
      </div>
    )
  }

  return (
    // 1. Single scrollable view-wrapper framework shell
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className='max-h-[520px] overflow-y-auto w-full rounded-2xl border border-slate-200 bg-white shadow-sm scrollbar-thin'
    >
      {expenses.length === 0 ? (
        <div className='p-16 text-center text-xs md:text-sm font-medium text-slate-400'>
          No matching itemized cash deductions mapped inside this lookup stream
          query.
        </div>
      ) : (
        // 2. ONE single table handles both columns and cells together
        <table className='w-full text-left border-collapse table-fixed'>
          {/* 3. Sticky header locks to the top of the parent div viewport */}
          <thead className='sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_rgba(226,232,240,1)]'>
            <tr className='text-[10px] sm:text-xs font-bold uppercase text-slate-400 tracking-wider'>
              <th className='px-4 py-3.5 sm:px-6 w-[50%] sm:w-[35%]'>
                Expense Item
              </th>
              <th className='hidden sm:table-cell px-6 py-3.5 sm:w-[25%]'>
                Merchant/Vendor
              </th>
              <th className='hidden md:table-cell px-6 py-3.5 md:w-[25%]'>
                Origin Errand Source
              </th>
              <th className='px-4 py-3.5 sm:px-6 text-right w-[120px] sm:w-[15%]'>
                Amount
              </th>
            </tr>
          </thead>

          <tbody className='divide-y divide-slate-100 text-xs sm:text-sm text-slate-600 bg-white'>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                onClick={() => onRowClick(expense)}
                className='hover:bg-slate-50/40 transition-colors group cursor-pointer'
              >
                {/* Item Details */}
                <td className='px-4 py-4 sm:px-6 truncate'>
                  <div className='font-bold text-slate-900 truncate max-w-[170px] sm:max-w-none capitalize text-xs sm:text-sm'>
                    {expense.description}
                  </div>

                  {/* Mobile Meta Details Bundle */}
                  <div className='flex flex-col gap-1 mt-1 sm:hidden text-[11px] text-slate-400 font-medium'>
                    <span className='flex items-center gap-1'>
                      <Calendar className='h-3 w-3' />
                      {new Date(expense.expenseDate).toLocaleDateString(
                        undefined,
                        { month: 'short', day: 'numeric' },
                      )}
                    </span>
                    {expense.vendor && (
                      <span className='truncate max-w-[155px]'>
                        Vendor: {expense.vendor}
                      </span>
                    )}
                    {expense.errand?.title && (
                      <div className='mt-0.5'>
                        <Link
                          href={`/errands/${expense.errandId}`}
                          className='inline-flex items-center gap-0.5 font-bold text-emerald-600 urn-link'
                        >
                          <span className='truncate max-w-[140px]'>
                            {expense.errand.title}
                          </span>
                          <ArrowUpRight className='h-2.5 w-2.5' />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Desktop Date layout */}
                  <div className='hidden sm:flex text-[11px] font-semibold text-slate-400 mt-0.5 items-center gap-1'>
                    <Calendar className='h-3 w-3' />
                    {new Date(expense.expenseDate).toLocaleDateString(
                      undefined,
                      { month: 'short', day: 'numeric', year: 'numeric' },
                    )}
                  </div>
                </td>

                {/* Vendor Column */}
                <td className='hidden sm:table-cell px-6 py-4 text-slate-500 font-medium truncate'>
                  {expense.vendor || '—'}
                </td>

                {/* Origin Errand Source Column */}
                <td className='hidden md:table-cell px-6 py-4 truncate'>
                  {expense.errand?.title ? (
                    <Link
                      href={`/errands/${expense.errandId}`}
                      className='inline-flex items-center gap-1 font-bold text-emerald-600 hover:text-emerald-700 underline underline-offset-2'
                    >
                      <span className='truncate max-w-[150px] lg:max-w-none'>
                        {expense.errand.title}
                      </span>
                      <ArrowUpRight className='h-3 w-3 transition-transform group-hover:translate-x-0.5' />
                    </Link>
                  ) : (
                    <span className='text-slate-400'>—</span>
                  )}
                </td>

                {/* Numeric Amount */}
                <td className='px-4 py-4 sm:px-6 text-right font-black text-slate-900 whitespace-nowrap'>
                  -₦
                  {expense.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* <ExpenseDetailsDrawer
        expense={selectedExpense}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      /> */}

      {/* Infinite Loader element row feedback */}
      {isFetchingNextPage && (
        <div className='flex justify-center items-center p-4 bg-slate-50/50 border-t border-slate-100 shrink-0'>
          <Loader2 className='h-4 w-4 animate-spin text-slate-500 mr-1.5' />
          <span className='text-xs font-bold text-slate-400'>
            Loading next batch sequence...
          </span>
        </div>
      )}
    </div>
  )
}
