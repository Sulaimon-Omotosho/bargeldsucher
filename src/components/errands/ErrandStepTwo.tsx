'use client'

import React from 'react'
import { UserPlus, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { MemberInputRow } from './MemberInputRow'
import { Control, UseFormSetValue, useWatch } from 'react-hook-form'

interface ErrandStepTwoProps {
  fields: Record<string, any>[]
  register: any
  errors: any
  userStatuses: Record<number, any>
  control: Control<any>
  setValue: UseFormSetValue<any>
  onBlurVerify: (index: number, val: string) => void
  onRemoveMember: (index: number) => void
  onAddMember: () => void
  onBack: () => void
  isPending: boolean
}

export function ErrandStepTwo({
  fields,
  register,
  errors,
  userStatuses,
  control,
  setValue,
  onBlurVerify,
  onRemoveMember,
  onAddMember,
  onBack,
  isPending,
}: ErrandStepTwoProps) {
  // Subscribe to live changes in form fields
  const amountReceivedRaw = useWatch({ control, name: 'amountReceived' })
  const members = useWatch({ control, name: 'members' }) || []

  const amountReceived = parseFloat(amountReceivedRaw) || 0

  // Calculate allocated budget in real-time
  const totalAllocated = members.reduce((sum: number, member: any) => {
    if (member?.role === 'VIEWER') return sum
    const numValue = parseFloat(member?.allocatedBudget)
    return sum + (isNaN(numValue) ? 0 : numValue)
  }, 0)

  const remaining = amountReceived - totalAllocated
  const isOverBudget = totalAllocated > amountReceived

  return (
    <div className='flex flex-col flex-1 justify-between overflow-hidden space-y-3'>
      {/* Real-time Budget Counter Bar */}
      <div
        className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
          isOverBudget
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        <div>
          <p className='font-bold'>
            Errand Budget: ₦{amountReceived.toLocaleString()}
          </p>
          <p className='text-[11px] opacity-80'>
            Allocated: ₦{totalAllocated.toLocaleString()}
          </p>
        </div>
        <div className='text-right'>
          <p
            className={`font-extrabold ${
              isOverBudget ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {isOverBudget
              ? `Over by ₦${Math.abs(remaining).toLocaleString()}`
              : `₦${remaining.toLocaleString()} left`}
          </p>
        </div>
      </div>

      {errors.members?.root?.message && (
        <div className='flex items-center gap-1.5 text-xs text-red-600 font-medium px-1'>
          <AlertCircle className='h-4 w-4 shrink-0' />
          <span>{errors.members.root.message}</span>
        </div>
      )}

      {/* Member List */}
      <div className='max-h-[220px] sm:max-h-[260px] overflow-y-auto space-y-3 pr-1.5 scrollbar-thin scrollbar-thumb-slate-200'>
        {fields.map((field, index) => (
          <MemberInputRow
            key={field.id}
            index={index}
            fieldId={field.id}
            canDelete={fields.length > 1}
            register={register}
            errors={errors}
            control={control}
            setValue={setValue}
            userStatusState={userStatuses[index]}
            onBlurVerify={onBlurVerify}
            onRemove={onRemoveMember}
          />
        ))}
      </div>

      {/* Footer Controls */}
      <div className='pt-3 mt-2 border-t border-slate-100 shrink-0 space-y-3'>
        <button
          type='button'
          onClick={onAddMember}
          className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700'
        >
          <UserPlus className='h-3.5 w-3.5' />
          Add another member
        </button>

        <div className='flex items-center justify-between'>
          <Button
            type='button'
            variant='ghost'
            onClick={onBack}
            className='flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50'
          >
            <ArrowLeft className='h-3.5 w-3.5' />
            Back
          </Button>

          <button
            type='submit'
            disabled={isPending || isOverBudget}
            className='flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] disabled:opacity-50 min-w-[120px]'
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
        </div>
      </div>
    </div>
  )
}
