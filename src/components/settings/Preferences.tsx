'use client'

import { useState } from 'react'
import { Sun, Moon, Monitor, Loader2 } from 'lucide-react'

interface AppearanceFormProps {
  onSave: (data: any) => void
  isPending: boolean
}

export function Preferences({ onSave, isPending }: AppearanceFormProps) {
  const [formState, setFormState] = useState({
    theme: 'light',
    currency: 'NGN',
    symbolPosition: 'before',
    startingDay: 'monday',
    dateFormat: 'DD/MM/YYYY',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formState)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-8 animate-in fade-in-50 duration-200'
    >
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
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type='button'
              onClick={() => setFormState({ ...formState, theme: id })}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-bold transition-all gap-1.5 ${
                formState.theme === id
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
          Currency
        </h4>
        <div className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              Primary Currency
            </label>
            <select
              value={formState.currency}
              onChange={(e) =>
                setFormState({ ...formState, currency: e.target.value })
              }
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition'
            >
              <option value='NGN'>₦ Nigerian Naira</option>
              <option value='USD'>$ US Dollar</option>
              <option value='EUR'>€ Euro</option>
              <option value='GBP'>£ British Pound</option>
            </select>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              Symbol Position
            </label>
            <select
              value={formState.symbolPosition}
              onChange={(e) =>
                setFormState({ ...formState, symbolPosition: e.target.value })
              }
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition'
            >
              <option value='before'>Before amount (e.g., ₦10,000)</option>
              <option value='after'>After amount (e.g., 10,000 NGN)</option>
            </select>
          </div>
        </div>
      </div>

      <hr className='border-slate-100' />

      {/* 3. Regional Formatting */}
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
              value={formState.startingDay}
              onChange={(e) =>
                setFormState({ ...formState, startingDay: e.target.value })
              }
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition'
            >
              <option value='monday'>Monday</option>
              <option value='sunday'>Sunday</option>
            </select>
          </div>

          <div className='space-y-1.5'>
            <label className='text-xs font-bold text-slate-700'>
              Date Format
            </label>
            <select
              value={formState.dateFormat}
              onChange={(e) =>
                setFormState({ ...formState, dateFormat: e.target.value })
              }
              className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition'
            >
              <option value='DD/MM/YYYY'>DD/MM/YYYY (e.g., 15/07/2026)</option>
              <option value='MM/DD/YYYY'>MM/DD/YYYY (e.g., 07/15/2026)</option>
              <option value='YYYY-MM-DD'>YYYY-MM-DD (e.g., 2026-07-15)</option>
            </select>
          </div>
        </div>
      </div>

      <div className='pt-4 border-t border-slate-100 flex justify-end'>
        <button
          type='submit'
          disabled={isPending}
          className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[100px]'
        >
          {isPending ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            'Save Preferences'
          )}
        </button>
      </div>
    </form>
  )
}
