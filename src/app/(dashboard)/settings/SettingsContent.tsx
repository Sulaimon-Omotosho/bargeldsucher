'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDashboardDataAction } from '@/app/actions/dashboard'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { AccountOverview } from '@/components/settings/AccountOverview'
import { Profile } from '@/components/settings/Profile'
import { Preferences } from '@/components/settings/Preferences'
import { Security } from '@/components/settings/Security'
import { DangerZone } from '@/components/settings/DangerZone'
import { useSettings } from '@/hooks/useSettings'
import { SettingsData } from '@/types/types'

export default function SettingsContent() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Default to the 'profile' tab if none is present in the URL
  const activeTab = searchParams.get('tab') || 'profile'

  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  // 1. Fetch unified user/dashboard data
  const {
    data: userData,
    isLoading,
    isError,
    saveSettings,
    isSaving,
  } = useSettings()

  // Helper function to update the URL tab context programmatically
  const handleTabChange = (tabKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabKey)
    router.push(`?${params.toString()}`)
  }

  // 2. Setup Mutations with UI feedback triggers
  const triggerToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Save Settings Mutation (Profile & Preferences)
  const saveSettingsMutation = useMutation({
    mutationFn: async (payload: any) => {
      return new Promise((resolve) => setTimeout(resolve, 800))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      triggerToast('Settings updated successfully!')
    },
    onError: () => {
      triggerToast('Failed to save changes. Please try again.', 'error')
    },
  })

  const archiveAccountMutation = useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      triggerToast('Account successfully archived. Logging out...', 'success')
    },
    onError: () => {
      triggerToast('Failed to archive account.', 'error')
    },
  })

  // Email Verification Mutation
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

  // Account Wiping Mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (password: string) => {
      return new Promise((resolve) => setTimeout(resolve, 1500))
    },
    onSuccess: () => {
      triggerToast('Account processing complete. Redirecting...', 'success')
    },
    onError: () => {
      triggerToast('Incorrect authorization password.', 'error')
    },
  })

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    )
  }

  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-6'>
        <AlertCircle className='h-10 w-10 text-rose-500 mb-2' />
        <h3 className='font-bold text-slate-800'>
          Failed to load configurations
        </h3>
        <p className='text-xs text-slate-400 mt-1'>
          Please reload the workspace or check network latency parameters.
        </p>
      </div>
    )
  }

  // Unified Data Object with statistics and security check states
  // const userData = {
  //   name: data?.userProfile?.name || 'Daniel James',
  //   email: data?.userProfile?.email || 'daniel@gmail.com',
  //   isEmailVerified: data?.userProfile?.isEmailVerified ?? true,
  //   memberSince: data?.userProfile?.memberSince || 'March 2026',
  //   lastLogin: data?.userProfile?.lastLogin || 'Today',
  //   completionPercentage: data?.userProfile?.completionPercentage || 100,

  //   stats: {
  //     errands: data?.userStats?.errandsCount || 42,
  //     expenses: data?.userStats?.expensesCount || 391,
  //     funding: data?.userStats?.fundingCount || 18,
  //     accountAgeDays: data?.userStats?.accountAge || 213,
  //   },

  //   securityChecks: {
  //     emailVerified: data?.userProfile?.isEmailVerified ?? true,
  //     strongPassword: data?.securityStats?.isStrongPassword ?? true,
  //     recoveryEmail: data?.securityStats?.hasRecoveryEmail ?? true,
  //     activeSessionProtected: data?.securityStats?.sessionProtected ?? true,
  //   },
  // }

  return (
    <div className='max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 md:p-3 lg:p-6 pb-8'>
      {/* Dynamic Action Toast */}
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

      {/* 1. Dynamic Account Overview Card (Standalone) */}
      <AccountOverview user={userData as SettingsData} />

      {/* 2. Structured Settings Content Form Blocks (Standalone Sibling) */}
      <div className='w-full bg-white rounded-2xl border border-slate-200/60 p-5 md:p-6 shadow-sm shadow-slate-100/50 min-h-[380px]'>
        {activeTab === 'profile' && (
          <Profile
            initialData={{
              name: userData?.name,
              email: userData?.email,
              isEmailVerified: userData?.isEmailVerified,
            }}
            onSave={(profile: { name: string; email?: string }) =>
              saveSettings({
                name: profile.name,
                email: profile.email ?? userData?.email,
              })
            }
            isPending={isSaving}
            onTriggerEmailVerification={() => verifyEmailMutation.mutate()}
            // isPending={saveSettingsMutation.isPending}
            isVerifyingEmail={verifyEmailMutation.isPending}
          />
        )}

        {activeTab === 'preferences' && (
          <Preferences
            onSave={(preferences) =>
              saveSettingsMutation.mutate({ preferences })
            }
            isPending={saveSettingsMutation.isPending}
          />
        )}

        {activeTab === 'security' && (
          <Security
            isEmailVerified={userData!.isEmailVerified}
            onSavePassword={(passwords) =>
              saveSettingsMutation.mutate({ passwords })
            }
            onTriggerEmailVerification={() => verifyEmailMutation.mutate()}
            isPending={saveSettingsMutation.isPending}
            isVerifyingEmail={verifyEmailMutation.isPending}
          />
        )}

        {activeTab === 'danger' && (
          <DangerZone
            onArchiveAccount={() => archiveAccountMutation.mutate()}
            onDeleteAccount={(password) =>
              deleteAccountMutation.mutate(password)
            }
            isPending={
              deleteAccountMutation.isPending ||
              archiveAccountMutation.isPending
            }
          />
        )}
      </div>

      {/* 3. System Version Footer */}
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
