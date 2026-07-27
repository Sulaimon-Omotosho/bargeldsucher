'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw, Archive } from 'lucide-react'
import { useErrand } from '@/hooks/useErrands'
import { Errand } from '@/types/types'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Props {
  errand: Errand
  canManageErrand?: boolean
  canLogExpense?: boolean
}

export default function ErrandHeaderActions({
  errand,
  canManageErrand = true,
}: Props) {
  // Use the consolidated useErrand hook bound to the errand ID
  const { completeErrand, isCompleting } = useErrand(errand.id)
  const [isOpen, setIsOpen] = useState(false)

  const isCompleted = errand.status === 'COMPLETED'

  // Calculate variances
  const allocated = Number(errand.amountReceived ?? 0)
  const totalSpent =
    errand.expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const remainingCash = allocated - totalSpent
  const hasSurplus = remainingCash > 0

  const handleSettleExecute = async (method?: 'RETURNED' | 'SAVED') => {
    const res = await completeErrand(method)
    if (res.success) {
      setIsOpen(false)
    }
  }

  if (!canManageErrand) {
    return null
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger
        disabled={isCompleted}
        className='inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm outline-none cursor-pointer'
      >
        <CheckCircle2
          className={`h-3.5 w-3.5 ${
            isCompleted ? 'text-slate-400' : 'text-emerald-400'
          }`}
        />
        <span>{isCompleted ? 'Errand Completed' : 'Finish Errand'}</span>
      </AlertDialogTrigger>

      <AlertDialogContent className='bg-white rounded-2xl p-6 border border-slate-100 max-w-md outline-none'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-base font-black text-slate-900'>
            Finalize Errand Lifecycle
          </AlertDialogTitle>
          <AlertDialogDescription className='text-xs text-slate-500 leading-relaxed'>
            {hasSurplus
              ? `You have a leftover surplus of ₦${remainingCash.toLocaleString()}. Please indicate how this remaining cash was accounted for below:`
              : 'Confirming this action locks the ledger records. Deficits or balances will be indexed into historical audits.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Dynamic Context Action Grid */}
        {hasSurplus && !isCompleting && (
          <div className='grid grid-cols-2 gap-3 my-4'>
            <button
              type='button'
              onClick={() => handleSettleExecute('RETURNED')}
              className='flex flex-col items-center gap-2 p-4 text-center rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 transition group outline-none cursor-pointer'
            >
              <RefreshCw className='h-5 w-5 text-amber-500 group-hover:scale-110 transition' />
              <span className='text-xs font-bold text-slate-800 block'>
                Returned Money
              </span>
              <span className='text-[10px] text-slate-400 block leading-tight'>
                Deducts money from budget to match spent totals.
              </span>
            </button>

            <button
              type='button'
              onClick={() => handleSettleExecute('SAVED')}
              className='flex flex-col items-center gap-2 p-4 text-center rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 transition group outline-none cursor-pointer'
            >
              <Archive className='h-5 w-5 text-emerald-500 group-hover:scale-110 transition' />
              <span className='text-xs font-bold text-slate-800 block'>
                Saving Money
              </span>
              <span className='text-[10px] text-slate-400 block leading-tight'>
                Keeps budget allocations intact for records.
              </span>
            </button>
          </div>
        )}

        <AlertDialogFooter className='mt-2'>
          <AlertDialogCancel
            disabled={isCompleting}
            className='bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition mt-0 outline-none cursor-pointer'
          >
            Cancel
          </AlertDialogCancel>

          {(!hasSurplus || isCompleting) && (
            <AlertDialogAction
              onClick={() => handleSettleExecute()}
              className='inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition min-w-[100px] cursor-pointer'
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className='h-3 w-3 animate-spin text-slate-400' />
                  <span>Settling...</span>
                </>
              ) : (
                <span>Confirm Settlement</span>
              )}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
