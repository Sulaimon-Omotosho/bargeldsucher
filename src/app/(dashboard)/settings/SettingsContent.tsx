'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDashboardDataAction } from '@/app/actions/dashboard'
import {
  Loader2,
  CheckCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
  AlertTriangle,
} from 'lucide-react'

// export default function SettingsPage() {
export default function SettingsContent() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('tab') || 'profile'

  const [showPassword, setShowPassword] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // 1. Fetch existing profile configuration via unified cache hook
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardDataAction,
  })

  // Form Local States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
  })

  const [preferences, setPreferences] = useState({
    currency: 'NGN',
    theme: 'light',
    symbolPosition: 'before',
    startingDay: 'monday',
  })

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Sync state when data is successfully fetched
  useEffect(() => {
    if (data?.userProfile) {
      setProfileForm({
        name: data.userProfile.name || 'Omotosho Sulaimon Abiodun',
        email: data.userProfile.email || 'user@bargeldsucher.com',
      })
    }
  }, [data])

  // 2. Mutations for save operations
  const saveMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      return new Promise((resolve) => setTimeout(resolve, 800))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      triggerToast('Settings updated successfully!')
    },
  })

  const triggerToast = (msg: string) => {
    setSuccessMessage(msg)
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({ profile: profileForm })
  }

  const handlePreferencesSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({ preferences })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
      </div>
    )
  }

  return (
    <div className='max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 p-2 md:p-6'>
      {successMessage && (
        <div className='fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg text-sm animate-in slide-in-from-bottom-4'>
          <CheckCircle className='h-4 w-4 text-emerald-400' />
          <span>{successMessage}</span>
        </div>
      )}

      <div>
        <h1 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
          Configuration Settings
        </h1>
        <p className='text-sm text-slate-500 mt-1'>
          Manage your account credentials, base operational currencies, and UX
          parameters.
        </p>
      </div>

      <div className='w-full bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm shadow-slate-100/50 min-h-[380px]'>
        {/* ✅ TAB 1: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className='space-y-6'>
            <div>
              <h3 className='text-base font-bold text-slate-900'>
                Profile Settings
              </h3>
              <p className='text-xs text-slate-400 mt-0.5'>
                Update your workspace identification details parameters.
              </p>
            </div>

            <div className='flex items-center gap-4 border-b border-slate-100 pb-5'>
              <div className='h-14 w-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/40 flex items-center justify-center font-black text-slate-700 text-lg uppercase shadow-inner'>
                {profileForm.name ? profileForm.name.charAt(0) : 'O'}
              </div>
              <div>
                <p className='text-xs font-bold text-slate-700'>
                  Profile Avatar Badge
                </p>
                <p className='text-[11px] text-slate-400 mt-0.5'>
                  Generated automatically from your account handle
                  initialization key.
                </p>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Full Name
                </label>
                <input
                  type='text'
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900'
                  required
                />
              </div>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Email Address
                </label>
                <input
                  type='email'
                  value={profileForm.email}
                  disabled
                  className='w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 font-medium cursor-not-allowed outline-none'
                />
                <p className='text-[10px] text-slate-400'>
                  Email alterations require active domain re-verification steps.
                </p>
              </div>
            </div>

            <div className='pt-4 border-t border-slate-100 flex justify-end'>
              <button
                type='submit'
                disabled={saveMutation.isPending}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[100px]'
              >
                {saveMutation.isPending ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        )}

        {/* ✅ TAB 2: APP PREFERENCES */}
        {activeTab === 'preferences' && (
          <form onSubmit={handlePreferencesSubmit} className='space-y-6'>
            <div>
              <h3 className='text-base font-bold text-slate-900'>
                App Preferences
              </h3>
              <p className='text-xs text-slate-400 mt-0.5'>
                Set currencies, theme parameters, and formatting styles.
              </p>
            </div>

            <div className='grid gap-5 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  System Core Currency
                </label>
                <select
                  value={preferences.currency}
                  onChange={(e) =>
                    setPreferences({ ...preferences, currency: e.target.value })
                  }
                  className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500'
                >
                  <option value='NGN'>₦ Nigerian Naira (NGN)</option>
                  <option value='USD'>$ US Dollar (USD)</option>
                  <option value='EUR'>€ Euro (EUR)</option>
                  <option value='GBP'>£ British Pound (GBP)</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Symbol Placement
                </label>
                <select
                  value={preferences.symbolPosition}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      symbolPosition: e.target.value,
                    })
                  }
                  className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500'
                >
                  <option value='before'>
                    Prefix Notation (e.g., ₦10,000)
                  </option>
                  <option value='after'>
                    Suffix Notation (e.g., 10,000 NGN)
                  </option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Visual Interface Theme
                </label>
                <div className='grid grid-cols-3 gap-2'>
                  {['light', 'dark', 'system'].map((t) => (
                    <button
                      key={t}
                      type='button'
                      onClick={() =>
                        setPreferences({ ...preferences, theme: t })
                      }
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border capitalize text-xs font-bold transition-all gap-1.5 ${
                        preferences.theme === t
                          ? 'border-emerald-600 bg-emerald-50/40 text-emerald-700 ring-1 ring-emerald-500'
                          : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {t === 'light' && <Sun className='h-3.5 w-3.5' />}
                      {t === 'dark' && <Moon className='h-3.5 w-3.5' />}
                      {t === 'system' && <Monitor className='h-3.5 w-3.5' />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Calendar Start Day
                </label>
                <select
                  value={preferences.startingDay}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      startingDay: e.target.value,
                    })
                  }
                  className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500'
                >
                  <option value='monday'>Monday</option>
                  <option value='sunday'>Sunday</option>
                </select>
              </div>
            </div>

            <div className='pt-4 border-t border-slate-100 flex justify-end'>
              <button
                type='submit'
                disabled={saveMutation.isPending}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[100px]'
              >
                {saveMutation.isPending ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  'Save Preferences'
                )}
              </button>
            </div>
          </form>
        )}

        {/* ✅ TAB 3: SECURITY ACCESS CONTROL */}
        {activeTab === 'security' && (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              saveMutation.mutate({ security: securityForm })
            }}
            className='space-y-6'
          >
            <div>
              <h3 className='text-base font-bold text-slate-900'>
                Security Access Control
              </h3>
              <p className='text-xs text-slate-400 mt-0.5'>
                Modify account execution access parameters and passwords.
              </p>
            </div>

            <div className='space-y-4 max-w-md'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Current Password
                </label>
                <div className='relative'>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={securityForm.currentPassword}
                    onChange={(e) =>
                      setSecurityForm({
                        ...securityForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-2.5 text-slate-400 hover:text-slate-600'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  New Password
                </label>
                <input
                  type='password'
                  value={securityForm.newPassword}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      newPassword: e.target.value,
                    })
                  }
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  value={securityForm.confirmPassword}
                  onChange={(e) =>
                    setSecurityForm({
                      ...securityForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500'
                  required
                />
              </div>
            </div>

            <div className='pt-4 border-t border-slate-100 flex justify-end'>
              <button
                type='submit'
                disabled={saveMutation.isPending}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[100px]'
              >
                {saveMutation.isPending ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  'Update Password'
                )}
              </button>
            </div>
          </form>
        )}

        {/* ✅ TAB 4: SYSTEM DANGER ZONE */}
        {activeTab === 'danger' && (
          <div className='space-y-6'>
            <div>
              <h3 className='text-base font-bold text-rose-600'>
                System Danger Zone
              </h3>
              <p className='text-xs text-slate-400 mt-0.5'>
                Destructive actions that permanently wipe database parameters.
              </p>
            </div>

            <div className='rounded-xl border border-rose-200/60 bg-rose-50/30 p-4 space-y-3'>
              <p className='text-xs font-semibold text-rose-800 flex items-center gap-2'>
                <AlertTriangle className='h-4 w-4 shrink-0 text-rose-600' />
                Warning: Irreversible Action Path
              </p>
              <p className='text-xs text-slate-600 leading-relaxed font-medium'>
                Deleting your profile will immediately destroy your user record
                along with all corresponding errand containers, cash balance
                sheets, and expense trails from the relational datastore
                cluster.
              </p>
            </div>

            <div className='space-y-4 pt-2 border-t border-slate-100'>
              <div className='space-y-1.5 max-w-sm'>
                <label className='text-xs font-bold text-slate-700'>
                  Confirm by typing your password
                </label>
                <input
                  type='password'
                  placeholder='••••••••'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-500'
                />
              </div>

              <button
                type='button'
                onClick={() => alert('Account teardown initialized.')}
                className='inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition-colors shadow-sm'
              >
                Permanently Delete My Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
