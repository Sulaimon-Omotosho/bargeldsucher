'use client'

import { Expense } from '@/types/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Calendar,
  Store,
  ArrowUpRight,
  Receipt,
  FileText,
  Landmark,
} from 'lucide-react'
import Link from 'next/link'

interface DrawerProps {
  expense: Expense | null
  isOpen: boolean
  onClose: () => void
}

export default function ExpenseDetailsDrawer({
  expense,
  isOpen,
  onClose,
}: DrawerProps) {
  if (!expense) return null

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-md bg-white p-6 overflow-y-auto border-l border-slate-200'>
        {/* Top Header Information Section */}
        <SheetHeader className='text-left space-y-1 pb-5 border-b border-slate-100'>
          <span className='text-[10px] font-black tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2.5 py-1 rounded-md w-fit'>
            Deduction Ledger Context
          </span>
          <SheetTitle className='text-xl font-black tracking-tight text-slate-900 capitalize pt-1'>
            {expense.description}
          </SheetTitle>
          {/* <SheetDescription className='text-xs font-medium text-slate-400'>
            System identification reference ID: #{expense.id.slice(0, 8)}
          </SheetDescription> */}
        </SheetHeader>

        {/* Financial Flow Highlight */}
        <div className='my-6 p-4 rounded-2xl bg-rose-50/60 border border-rose-100/40 text-center'>
          <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5'>
            Money Spent
          </span>
          <h2 className='text-3xl font-black text-slate-900 tracking-tight'>
            -₦
            {expense.amount.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
        </div>

        {/* Structured Grid Parameters */}
        <div className='space-y-4.5'>
          <h4 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            Breakdown
          </h4>

          <div className='grid grid-cols-1 gap-3.5'>
            {/* Merchant Column Info Row */}
            <div className='flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30'>
              <span className='text-xs font-bold text-slate-400 flex items-center gap-2'>
                <Store className='h-3.5 w-3.5 text-slate-400' /> Merchant/Vendor
              </span>
              <span className='text-xs font-black text-slate-800 capitalize truncate max-w-[200px]'>
                {expense.vendor || 'Direct / Out-of-pocket'}
              </span>
            </div>

            {/* Calendar Event Tracking Date Row */}
            <div className='flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30'>
              <span className='text-xs font-bold text-slate-400 flex items-center gap-2'>
                <Calendar className='h-3.5 w-3.5 text-slate-400' /> Allocation
                Date
              </span>
              <span className='text-xs font-black text-slate-800'>
                {new Date(expense.expenseDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Target Cross-Origin Errand Navigation Connection Row */}
            <div className='flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/30'>
              <span className='text-xs font-bold text-slate-400 flex items-center gap-2'>
                <Landmark className='h-3.5 w-3.5 text-slate-400' /> Associated
                Errand
              </span>
              {expense.errand?.title ? (
                <Link
                  href={`/errands/${expense.errandId}`}
                  className='text-xs font-black text-emerald-600 underline underline-offset-2 flex items-center gap-0.5 hover:text-emerald-700'
                >
                  <span className='truncate max-w-[160px]'>
                    {expense.errand.title}
                  </span>
                  <ArrowUpRight className='h-3 w-3' />
                </Link>
              ) : (
                <span className='text-xs font-medium text-slate-400'>—</span>
              )}
            </div>
          </div>

          {/* User Input Notes Panel Section Block */}
          <div className='space-y-1.5 pt-2'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5'>
              <FileText className='h-3 w-3' /> Notes
            </span>
            <div className='p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 text-xs text-slate-600 font-medium leading-relaxed min-h-[70px]'>
              {expense.notes ||
                'No custom notes appended to this expense line item.'}
            </div>
          </div>

          {/* Receipt Digital Image Verification Box Placeholder */}
          <div className='space-y-1.5 pt-2'>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5'>
              <Receipt className='h-3 w-3' /> Attachment
            </span>
            {expense.receiptUrl ? (
              <div className='relative group overflow-hidden border border-slate-200 rounded-xl max-h-40 bg-slate-100 flex items-center justify-center cursor-zoom-in'>
                <img
                  src={expense.receiptUrl}
                  alt='Receipt Reference Document'
                  className='object-cover w-full h-full transition duration-200 group-hover:scale-102'
                />
              </div>
            ) : (
              <div className='border border-dashed border-slate-200 bg-slate-50/30 rounded-xl p-6 text-center text-xs font-medium text-slate-400'>
                No copy image uploaded for this voucher.
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
