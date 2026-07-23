'use client'

import { useState } from 'react'
import { Archive, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { useAccountControl } from '@/hooks/useSettings'

export function DangerZone() {
  const [confirmWord, setConfirmWord] = useState('')
  const [password, setPassword] = useState('')

  const { isArchiving, isDeleting, archiveAccount, deleteAccount } =
    useAccountControl()

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isArchiving) return
    await archiveAccount()
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmWord !== 'DELETE' || !password || isDeleting) return
    await deleteAccount(password)
  }

  return (
    <div className='space-y-8 animate-in fade-in-50 duration-200'>
      <div>
        <h3 className='text-base font-bold text-slate-900'>Account Controls</h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Temporarily hibernate your data profile or completely destroy your
          credentials.
        </p>
      </div>

      {/* Choice A: Archive Account (Reversible) */}
      <div className='space-y-4 max-w-2xl'>
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
          <Archive className='h-3.5 w-3.5 text-slate-400' /> Archive Account
        </h4>
        <div className='p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
          <div className='space-y-1 max-w-lg'>
            <p className='text-xs font-bold text-slate-800'>
              Archive your profile activity
            </p>
            <p className='text-[11px] text-slate-500 leading-relaxed font-medium'>
              This immediately logs you out and pauses background workers. None
              of your data is deleted, and you can log back in at any time to
              instantly restore your workspace.
            </p>
          </div>
          <button
            type='button'
            onClick={handleArchive}
            disabled={isArchiving}
            className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-800 bg-white border border-slate-200 shadow-sm transition hover:bg-slate-100 disabled:opacity-50 shrink-0 min-w-[120px]'
          >
            {isArchiving ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : (
              'Archive Account'
            )}
          </button>
        </div>
      </div>

      <hr className='border-slate-100' />

      {/* Choice B: Permanently Delete Account */}
      <form onSubmit={handleDelete} className='space-y-4 max-w-md'>
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 text-rose-600'>
          <Trash2 className='h-3.5 w-3.5' /> Delete Account
        </h4>

        <div className='p-4 rounded-xl border border-rose-200 bg-rose-50/30 space-y-2'>
          <p className='text-xs font-bold text-rose-800 flex items-center gap-1.5'>
            <AlertTriangle className='h-4 w-4 shrink-0 text-rose-600' />
            Irreversible Action Path
          </p>
          <p className='text-[11px] text-slate-600 leading-normal font-medium'>
            This will permanently purge your user profile, active errands,
            ledger records, and files. There is no way to recover your account
            once initiated.
          </p>
        </div>

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
            type='text'
            value={confirmWord}
            onChange={(e) => setConfirmWord(e.target.value)}
            placeholder='DELETE'
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 transition font-mono uppercase tracking-wider placeholder:font-sans placeholder:tracking-normal'
            required
          />
        </div>

        {/* Password Check */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-slate-700'>
            Your Password
          </label>
          <input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder='••••••••'
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500 transition'
            required
          />
        </div>

        <button
          type='submit'
          disabled={confirmWord !== 'DELETE' || !password || isDeleting}
          className='w-full inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed'
        >
          {isDeleting ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            'Permanently Delete Account'
          )}
        </button>
      </form>
    </div>
  )
}
