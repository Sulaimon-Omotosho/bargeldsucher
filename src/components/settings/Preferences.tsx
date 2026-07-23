'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sun, Moon, Monitor, Loader2, Globe, Clock } from 'lucide-react'
import { PreferencesSchema } from '@/lib/ValidationSchema'
import { Theme, WeekStart } from '../../../generated/prisma/enums'
import { usePreferences } from '@/hooks/useSettings'

export type PreferencesFormValues = z.input<typeof PreferencesSchema>

interface PreferencesProps {
  initialData?: Partial<PreferencesFormValues> | null
}

export function Preferences() {
  const {
    updatePreferences,
    isPending: isUpdating,
    data: initialData,
    isLoading,
    isError,
  } = usePreferences()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PreferencesFormValues>({
    resolver: zodResolver(PreferencesSchema),
    defaultValues: {
      theme: initialData?.theme || Theme.SYSTEM,
      currency: initialData?.currency || 'NGN',
      symbolPosition: initialData?.symbolPosition || 'before',
      weekStartsOn: initialData?.weekStartsOn || WeekStart.MONDAY,
      timezone: initialData?.timezone || 'Africa/Lagos',
      language: initialData?.language || 'en',
    },
  })

  // Sync state if initialData arrives asynchronously
  useEffect(() => {
    if (initialData) {
      reset({
        theme: initialData.theme || Theme.SYSTEM,
        currency: initialData.currency || 'NGN',
        symbolPosition: initialData.symbolPosition || 'before',
        weekStartsOn: initialData.weekStartsOn || WeekStart.MONDAY,
        timezone: initialData.timezone || 'Africa/Lagos',
        language: initialData.language || 'en',
      })
    }
  }, [initialData, reset])

  const currentTheme = watch('theme')

  const onSubmit = (values: PreferencesFormValues) => {
    updatePreferences(values)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-8 animate-in fade-in-50 duration-200'
    >
      {/* Header Block */}
      <div>
        <h3 className='text-base font-bold text-slate-900'>App Preferences</h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Personalize how the application looks and formats values.
        </p>
      </div>

      {/* 1. Theme Selection */}
      <div className='space-y-3'>
        <label className='text-xs font-bold text-slate-700'>Theme</label>
        <div className='grid grid-cols-3 gap-3 max-w-md'>
          {[
            { id: Theme.LIGHT, label: 'Light', icon: Sun },
            { id: Theme.DARK, label: 'Dark', icon: Moon },
            { id: Theme.SYSTEM, label: 'System', icon: Monitor },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type='button'
              onClick={() =>
                setValue('theme', id, {
                  shouldDirty: true,
                })
              }
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all gap-1.5 ${
                currentTheme === id
                  ? 'border-emerald-600 bg-emerald-50/40 text-emerald-700 ring-1 ring-emerald-500'
                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Icon className='h-4 w-4' />
              {label}
            </button>
          ))}
        </div>
      </div>

      <hr className='border-slate-100' />

      {/* 2. Currency Setup */}
      <div className='space-y-4'>
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
          Currency Formatting
        </h4>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              Primary Currency
            </label>
            <select
              {...register('currency')}
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition'
            >
              <option value='NGN'>₦ Nigerian Naira (NGN)</option>
              <option value='USD'>$ US Dollar (USD)</option>
              <option value='EUR'>€ Euro (EUR)</option>
              <option value='GBP'>£ British Pound (GBP)</option>
            </select>
            {errors.currency && (
              <p className='text-xs text-rose-500'>{errors.currency.message}</p>
            )}
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              Symbol Position
            </label>
            <select
              {...register('symbolPosition')}
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition'
            >
              <option value='before'>Before amount (e.g., ₦10,000)</option>
              <option value='after'>After amount (e.g., 10,000 NGN)</option>
            </select>
          </div>
        </div>
      </div>

      <hr className='border-slate-100' />

      {/* 3. Regional Settings */}
      <div className='space-y-4'>
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
          Regional Settings
        </h4>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              First Day of Week
            </label>
            <select
              {...register('weekStartsOn')}
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition'
            >
              <option value={WeekStart.MONDAY}>Monday</option>
              <option value={WeekStart.SUNDAY}>Sunday</option>
            </select>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>Language</label>
            <div className='relative'>
              <select
                {...register('language')}
                className='w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition'
              >
                <option value='en'>English</option>
                <option value='fr'>French</option>
                <option value='de'>German</option>
                <option value='es'>Spanish</option>
              </select>
              <Globe className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none' />
            </div>
          </div>

          <div className='space-y-1.5 sm:col-span-2'>
            <label className='text-xs font-bold text-slate-700'>Timezone</label>
            <div className='relative'>
              <select
                {...register('timezone')}
                className='w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition'
              >
                <option value='Africa/Lagos'>Africa/Lagos (GMT+1 / WAT)</option>
                <option value='Europe/Berlin'>
                  Europe/Berlin (GMT+1 / CET)
                </option>
                <option value='Europe/London'>
                  Europe/London (GMT+0 / UTC)
                </option>
                <option value='America/New_York'>
                  America/New_York (GMT-5 / EST)
                </option>
                <option value='UTC'>Coordinated Universal Time (UTC)</option>
              </select>
              <Clock className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none' />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Action */}
      <div className='pt-4 border-t border-slate-100 flex justify-end'>
        <button
          type='submit'
          disabled={isUpdating}
          className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[130px]'
        >
          {isUpdating ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </form>
  )
}
