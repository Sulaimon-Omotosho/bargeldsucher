'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

export default function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    'loading',
  )
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Verification token is missing.')
      return
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
          {
            method: 'GET',
          },
        )

        if (res.redirected) {
          window.location.href = res.url
          return
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.message || 'Failed to verify email')
        }

        setStatus('success')
        setTimeout(() => {
          router.push('/settings?tab=security&verified=true')
        }, 2000)
      } catch (err: any) {
        setStatus('error')
        setErrorMessage(err.message || 'Verification failed')
      }
    }

    verify()
  }, [token, router])

  return (
    <div className='min-h-screen flex items-center justify-center bg-slate-50 p-4'>
      <div className='bg-white p-8 rounded-xl shadow-sm border max-w-md w-full text-center'>
        {status === 'loading' && (
          <div className='flex flex-col items-center gap-3'>
            <Loader2 className='w-8 h-8 animate-spin text-slate-900' />
            <p className='text-sm text-slate-600'>
              Verifying your email address...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className='flex flex-col items-center gap-3'>
            <CheckCircle2 className='w-10 h-10 text-emerald-600' />
            <h2 className='text-xl font-bold text-slate-900'>
              Email Verified!
            </h2>
            <p className='text-sm text-slate-600'>
              Redirecting you to settings...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className='flex flex-col items-center gap-3'>
            <XCircle className='w-10 h-10 text-rose-600' />
            <h2 className='text-xl font-bold text-slate-900'>
              Verification Failed
            </h2>
            <p className='text-sm text-slate-600'>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
}
