'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2, AlertTriangle, Loader2, MailCheck } from 'lucide-react'
import { useDeleteAccount } from '@/hooks/settings/useDeleteAccount'
import z from 'zod'
import { DeleteAccountSchema } from '@/lib/ValidationSchema'

export type DeleteAccountInput = z.input<typeof DeleteAccountSchema>

export function DeleteAccountForm() {
  const {
    tokenSent,
    isSendingToken,
    isDeleting,
    serverError,
    requestToken,
    deleteAccount,
  } = useDeleteAccount()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DeleteAccountInput>({
    resolver: zodResolver(DeleteAccountSchema),
    defaultValues: {
      confirmWord: '',
      token: '',
    },
  })

  const confirmWord = watch('confirmWord')
  const token = watch('token')

  const onSubmit = (data: DeleteAccountInput) => {
    if (data.token) {
      deleteAccount(data.token)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 max-w-md'>
      <h4 className='text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center gap-1.5'>
        <Trash2 className='h-3.5 w-3.5' /> Delete Account
      </h4>

      <div className='p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2'>
        <p className='text-xs font-bold text-rose-800 flex items-center gap-1.5'>
          <AlertTriangle className='h-4 w-4 shrink-0 text-rose-600' />
          Irreversible Action Path
        </p>
        <p className='text-[11px] text-slate-600 leading-normal font-medium'>
          This will permanently purge your user profile, active errands, ledger
          records, and files. There is no way to recover your account once
          initiated.
        </p>
      </div>

      {serverError && (
        <div className='p-3 rounded-xl border border-rose-200 bg-rose-50 text-xs text-rose-700 font-medium'>
          {serverError}
        </div>
      )}

      {/* Confirmation String */}
      <div className='space-y-1.5'>
        <label className='text-xs font-bold text-slate-700'>
          Type{' '}
          <span className='font-black select-none text-rose-600 px-1 py-0.5 bg-rose-50 rounded border border-rose-100'>
            DELETE
          </span>{' '}
          to confirm
        </label>
        <input
          {...register('confirmWord')}
          type='text'
          // placeholder='DELETE'
          disabled={tokenSent}
          className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 transition font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal disabled:bg-slate-100'
        />
        {errors.confirmWord && (
          <p className='text-[11px] text-rose-600 font-medium'>
            {errors.confirmWord.message}
          </p>
        )}
      </div>

      {!tokenSent ? (
        <button
          type='button'
          onClick={requestToken}
          disabled={confirmWord !== 'DELETE' || isSendingToken}
          className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
        >
          {isSendingToken ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            'Send Security Token to Email'
          )}
        </button>
      ) : (
        <div className='space-y-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200'>
          <div className='p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium'>
            <MailCheck className='h-4 w-4 shrink-0 text-emerald-600' />A 6-digit
            deletion token has been sent to your email.
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              Security Token
            </label>
            <input
              {...register('token')}
              type='text'
              maxLength={6}
              placeholder='123456'
              className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 transition font-mono tracking-widest placeholder:tracking-normal'
            />
            {errors.token && (
              <p className='text-[11px] text-rose-600 font-medium'>
                {errors.token.message}
              </p>
            )}
          </div>

          <button
            type='submit'
            disabled={!token || token.length < 6 || isDeleting}
            className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {isDeleting ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              'Permanently Delete Account'
            )}
          </button>
        </div>
      )}
    </form>
  )
}
