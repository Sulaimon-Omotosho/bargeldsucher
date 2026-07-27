'use client'

import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'

interface ErrandStepOneProps {
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  hasCollaborators: boolean
  setHasCollaborators: (val: boolean) => void
  onNextStep: () => void
  onClose: () => void
  isPending: boolean
}

export function ErrandStepOne({
  register,
  errors,
  hasCollaborators,
  setHasCollaborators,
  onNextStep,
  onClose,
  isPending,
}: ErrandStepOneProps) {
  return (
    <div className='space-y-4 sm:space-y-5 overflow-y-auto pr-1 flex-1'>
      <div>
        <label className='block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
          Errand Title / Purpose
        </label>
        <input
          type='text'
          {...register('title')}
          placeholder='e.g., Office Supplies Run, Fuel Allocation'
          className='w-full rounded-xl border border-slate-200 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50 focus:bg-white'
        />
        {errors.title && (
          <p className='mt-1 text-xs text-red-500 font-medium'>
            {errors.title.message as string}
          </p>
        )}
      </div>

      <div>
        <label className='block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
          Amount Received (₦)
        </label>
        <input
          type='number'
          {...register('amountReceived')}
          min='0.01'
          step='0.01'
          placeholder='100,000.00'
          className='w-full rounded-xl border border-slate-200 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50 focus:bg-white'
        />
        {errors.amountReceived && (
          <p className='mt-1 text-xs text-red-500 font-medium'>
            {errors.amountReceived.message as string}
          </p>
        )}
      </div>

      <div>
        <label className='block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
          Notes / Description (Optional)
        </label>
        <textarea
          {...register('description')}
          rows={2}
          placeholder='Provide brief context details...'
          className='w-full rounded-xl border border-slate-200 px-3.5 py-2 sm:py-2.5 text-xs sm:text-sm focus:border-emerald-500 focus:outline-none transition resize-none bg-slate-50/50 focus:bg-white'
        />
      </div>

      <div className='flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5'>
        <input
          type='checkbox'
          id='hasCollaborators'
          checked={hasCollaborators}
          onChange={(e) => setHasCollaborators(e.target.checked)}
          className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer'
        />
        <label
          htmlFor='hasCollaborators'
          className='cursor-pointer select-none'
        >
          <p className='text-xs font-bold text-slate-800'>
            Add team members / collaborators
          </p>
          <p className='text-[11px] text-slate-500'>
            Invite collaborators or viewers to split responsibilities and track
            expenses.
          </p>
        </label>
      </div>

      <div className='flex items-center justify-end gap-2.5 pt-2'>
        <Button
          type='button'
          variant='ghost'
          onClick={onClose}
          className='rounded-xl px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-500 hover:bg-slate-50'
        >
          Cancel
        </Button>

        {hasCollaborators ? (
          <button
            type='button'
            onClick={onNextStep}
            className='flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98]'
          >
            <span>Next: Add Members</span>
            <ArrowRight className='h-3.5 w-3.5' />
          </button>
        ) : (
          <button
            type='submit'
            disabled={isPending}
            className='flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] disabled:opacity-50 min-w-[100px]'
          >
            {isPending ? (
              <>
                <Loader2 className='h-3 w-3 animate-spin' />
                Creating...
              </>
            ) : (
              'Create Errand'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
