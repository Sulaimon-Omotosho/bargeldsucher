'use client'

import { useState } from 'react'
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'

interface SecurityFormProps {
  isEmailVerified: boolean
  onSavePassword: (data: any) => void
  onTriggerEmailVerification: () => void
  isPending: boolean
  isVerifyingEmail: boolean
}

export function Security({
  isEmailVerified,
  onSavePassword,
  onTriggerEmailVerification,
  isPending,
  isVerifyingEmail,
}: SecurityFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    onSavePassword(securityForm)
  }

  return (
    <div className='space-y-8 animate-in fade-in-50 duration-200'>
      <div>
        <h3 className='text-base font-bold text-slate-900'>
          Security Access Control
        </h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Manage login credentials, structural authorization passwords, and
          validation routes.
        </p>
      </div>

      {/* 1. Password Segment */}
      <form onSubmit={handlePasswordSubmit} className='space-y-4 max-w-md'>
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
          <KeyRound className='h-3.5 w-3.5 text-slate-400' /> Update Password
        </h4>

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
              className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 transition'
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
              setSecurityForm({ ...securityForm, newPassword: e.target.value })
            }
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 transition'
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
            className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 transition'
            required
          />
        </div>

        <button
          type='submit'
          disabled={isPending}
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm disabled:opacity-50 min-w-[120px]'
        >
          {isPending ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            'Update Password'
          )}
        </button>
      </form>

      <hr className='border-slate-100' />

      {/* 2. Email Verification Control Panel */}
      <div className='space-y-4 max-w-md'>
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
          <ShieldAlert className='h-3.5 w-3.5 text-slate-400' /> Identity
          Verification
        </h4>

        {isEmailVerified ? (
          <div className='flex items-start gap-3 p-4 rounded-xl border border-emerald-100 bg-emerald-50/20'>
            <ShieldCheck className='h-5 w-5 text-emerald-600 shrink-0 mt-0.5' />
            <div className='space-y-1'>
              <p className='text-xs font-bold text-slate-800'>
                Identity Verified
              </p>
              <p className='text-[11px] text-slate-500 leading-normal'>
                Your email is verified. Your account maintains comprehensive
                clearance levels for all standard and administrative financial
                actions.
              </p>
            </div>
          </div>
        ) : (
          <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl border border-amber-200 bg-amber-50/20'>
            <div className='space-y-1'>
              <p className='text-xs font-bold text-slate-800'>
                Unverified Email Identity
              </p>
              <p className='text-[11px] text-slate-500 leading-normal'>
                Please complete your verification routine to ensure access to
                all system resources.
              </p>
            </div>
            <button
              type='button'
              onClick={onTriggerEmailVerification}
              disabled={isVerifyingEmail}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold text-amber-700 hover:text-white bg-amber-100/50 hover:bg-amber-600 border border-amber-200/60 hover:border-amber-600 transition shadow-sm disabled:opacity-50 shrink-0'
            >
              {isVerifyingEmail ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                'Send Verification Link'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
