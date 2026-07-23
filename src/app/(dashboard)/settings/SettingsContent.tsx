'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { AccountOverview } from '@/components/settings/AccountOverview'
import { Profile } from '@/components/settings/Profile'
import { Preferences } from '@/components/settings/Preferences'
import { Security } from '@/components/settings/Security'
import { DangerZone } from '@/components/settings/DangerZone'
import { useSettings } from '@/hooks/useSettings'
import { SettingsData } from '@/types/types'

export default function SettingsContent() {
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('tab') || 'profile'

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { data: userData, isLoading, isError } = useSettings()

  // console.log('Fetched Settings Data:', userData)

  const triggerToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => setTimeout(resolve, 1200))
    },
    onSuccess: () => {
      triggerToast('Verification link dispatched to your inbox!')
    },
    onError: () => {
      triggerToast('Error sending verification email.', 'error')
    },
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    )
  }

  if (isError || !userData) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-6'>
        <AlertCircle className='h-10 w-10 text-rose-500 mb-2' />
        <h3 className='font-bold text-slate-800'>
          Failed to load configurations
        </h3>
        <p className='text-xs text-slate-400 mt-1'>
          Please reload the workspace or check network connectivity.
        </p>
      </div>
    )
  }

  const typedData = userData as SettingsData

  return (
    <div className='max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 md:p-3 lg:p-6 pb-8'>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 text-white px-4 py-3 rounded-xl shadow-lg text-sm animate-in slide-in-from-bottom-4 ${
            toast.type === 'success' ? 'bg-slate-900' : 'bg-rose-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className='h-4 w-4 text-emerald-400' />
          ) : (
            <AlertCircle className='h-4 w-4 text-rose-200' />
          )}
          <span className='font-semibold'>{toast.message}</span>
        </div>
      )}

      <AccountOverview data={typedData} />

      <div className='w-full bg-white rounded-2xl border border-slate-200/60 p-5 md:p-6 shadow-sm shadow-slate-100/50 min-h-[380px]'>
        {activeTab === 'profile' && (
          <Profile
            initialData={typedData}
            onTriggerEmailVerification={() => verifyEmailMutation.mutate()}
            isVerifyingEmail={verifyEmailMutation.isPending}
          />
        )}

        {activeTab === 'preferences' && <Preferences />}

        {activeTab === 'security' && <Security />}

        {activeTab === 'danger' && <DangerZone />}
      </div>

      <div className='pt-8 flex flex-col items-center justify-center gap-1 text-center animate-in fade-in-50 duration-300'>
        <p className='text-xs font-black text-slate-400 tracking-wider uppercase'>
          Bargeldsucher
        </p>
        <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400/80'>
          <span>Version 1.0.2</span>
          <span className='h-1 w-1 rounded-full bg-slate-300' />
          <span>Build 2026.07.15</span>
        </div>
      </div>
    </div>
  )
}
