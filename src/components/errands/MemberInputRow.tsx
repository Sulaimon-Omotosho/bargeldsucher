'use client'

import React, { useEffect } from 'react'
import { Trash2, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  useWatch,
} from 'react-hook-form'

interface MemberInputRowProps {
  index: number
  fieldId: string
  canDelete: boolean
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  control: Control<any>
  setValue: UseFormSetValue<any>
  userStatusState?: { status: string; error?: string }
  onBlurVerify: (index: number, value: string) => void
  onRemove: (index: number) => void
}

export function MemberInputRow({
  index,
  fieldId,
  canDelete,
  register,
  errors,
  control,
  setValue,
  userStatusState,
  onBlurVerify,
  onRemove,
}: MemberInputRowProps) {
  const status = userStatusState?.status || 'idle'
  const queryRegistration = register(`members.${index}.query` as const)

  // Explicitly subscribe to this row's role changes
  const selectedRole = useWatch({
    control,
    name: `members.${index}.role`,
    defaultValue: 'COLLABORATOR',
  })

  // Clear budget value whenever VIEWER is selected
  useEffect(() => {
    if (selectedRole === 'VIEWER') {
      setValue(`members.${index}.allocatedBudget`, '')
    }
  }, [selectedRole, setValue, index])

  const memberError = (errors.members as Record<number, any>)?.[index]

  return (
    <div className='p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 relative group'>
      <input type='hidden' {...register(`members.${index}.userId` as const)} />

      <div className='flex items-center justify-between'>
        <span className='text-xs font-bold text-slate-700'>
          Member #{index + 1}
        </span>
        {canDelete && (
          <button
            type='button'
            onClick={() => onRemove(index)}
            className='text-slate-400 hover:text-red-500 transition'
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5'>
        {/* Username / Email */}
        <div>
          <div className='relative flex items-center'>
            <input
              type='text'
              {...queryRegistration}
              onBlur={(e) => {
                queryRegistration.onBlur(e)
                onBlurVerify(index, e.target.value)
              }}
              placeholder='Username or email'
              className='w-full rounded-lg border border-slate-200 pl-3 pr-8 py-2 text-xs focus:border-emerald-500 focus:outline-none bg-white'
            />
            <div className='absolute right-2.5 flex items-center pointer-events-none'>
              {status === 'checking' && (
                <Loader2 className='h-3.5 w-3.5 text-slate-400 animate-spin' />
              )}
              {status === 'valid' && (
                <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
              )}
              {(status === 'invalid' || status === 'self') && (
                <XCircle className='h-3.5 w-3.5 text-red-500' />
              )}
            </div>
          </div>

          {status === 'invalid' && (
            <p className='mt-1 text-[10px] text-red-500 font-medium'>
              {userStatusState?.error || 'User not found'}
            </p>
          )}
          {status === 'self' && (
            <p className='mt-1 text-[10px] text-red-500 font-medium'>
              You cannot add yourself
            </p>
          )}
          {memberError?.query && (
            <p className='mt-1 text-[10px] text-red-500 font-medium'>
              {memberError.query.message}
            </p>
          )}
        </div>

        {/* Role Selection */}
        <select
          {...register(`members.${index}.role` as const)}
          className='w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none bg-white'
        >
          <option value='COLLABORATOR'>Collaborator (Can spend)</option>
          <option value='VIEWER'>Viewer (Read only)</option>
        </select>
      </div>

      {/* Allocated Budget — Hides when VIEWER */}
      {selectedRole !== 'VIEWER' && (
        <div>
          <input
            type='number'
            step='any'
            {...register(`members.${index}.allocatedBudget` as const)}
            placeholder='Allocated Budget (Optional ₦)'
            className='w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none bg-white'
          />
        </div>
      )}
    </div>
  )
}
