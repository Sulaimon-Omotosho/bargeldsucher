'use client'

import { Expense, SerializedExpense } from '@/types/types'
import { Lock } from 'lucide-react'

interface ErrandExpenseLedgerProps {
  expenses: SerializedExpense[]
  isCompleted: boolean
}

export default function ErrandExpenseLedger({
  expenses,
  isCompleted,
}: ErrandExpenseLedgerProps) {
  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-base font-bold text-slate-900'>
            Allocated Expense Ledger
          </h3>
          <p className='text-xs text-slate-400 mt-0.5'>
            Individual line item tracking deductions for this errand run.
          </p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className='p-8 text-center border-2 border-dashed border-slate-100 rounded-xl'>
          <p className='text-slate-400 text-sm'>
            No line-item expenses mapped to this errand yet.
          </p>
        </div>
      ) : (
        <div className='max-h-[400px] overflow-y-auto pr-1 custom-scrollbar'>
          <div className='divide-y divide-slate-100'>
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className='flex items-center justify-between py-3.5 first:pt-0 last:pb-0'
              >
                <div>
                  <p className='text-sm font-semibold text-slate-900 capitalize'>
                    {expense.description}
                  </p>
                  <p className='text-xs text-slate-400 mt-0.5'>
                    {(expense as any).vendor || 'Direct Cash Transaction'}
                  </p>
                </div>
                <p className='text-sm font-bold text-slate-950'>
                  - ₦{Number(expense.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className='bg-slate-50 border border-slate-200/60 p-3 rounded-xl text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-2'>
          <Lock className='h-3.5 w-3.5 text-slate-400' /> Expense creation has
          been deactivated for this archived record file.
        </div>
      )}
    </div>
  )
}
