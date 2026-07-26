'use client'

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AccountArchivedClient() {
  const { update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUnarchive = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/account/unarchive', {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to unarchive account.')
      }

      await update({ isArchived: false })
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 p-4'>
      <div className='bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center'>
        <div className='w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl'>
          !
        </div>

        <h1 className='text-2xl font-bold text-slate-900 mb-2'>
          Account Archived
        </h1>
        <p className='text-sm text-slate-600 mb-6'>
          Your Bargeldsucher account is currently archived. While archived,
          access to your workspace and settings is paused.
        </p>

        {error && (
          <div className='mb-4 text-xs text-rose-600 bg-rose-50 p-2 rounded border border-rose-200'>
            {error}
          </div>
        )}

        <div className='space-y-3'>
          <button
            onClick={handleUnarchive}
            disabled={loading}
            className='w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition text-sm disabled:opacity-50'
          >
            {loading ? 'Restoring account...' : 'Unarchive My Account'}
          </button>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className='w-full bg-transparent hover:bg-slate-100 text-slate-600 font-medium py-2.5 px-4 rounded-lg transition text-sm'
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
