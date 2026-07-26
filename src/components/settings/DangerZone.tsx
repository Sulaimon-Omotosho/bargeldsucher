'use client'

import { useState } from 'react'
import { Archive, Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { useAccountControl } from '@/hooks/useSettings'
import { DeleteAccountForm } from './DeleteAccountForm'

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
      <DeleteAccountForm />
    </div>
  )
}
