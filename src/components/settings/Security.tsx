'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  KeyRound,
  ShieldCheck,
} from 'lucide-react'
import { ChangePasswordSchema } from '@/lib/ValidationSchema'
import { useSecurity } from '@/hooks/useSettings'

export type ChangePasswordFormValues = z.input<typeof ChangePasswordSchema>

export function Security() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  // Direct integration of the security hook
  const {
    isEmailVerified,
    isLoading,
    isChangingPassword,
    isVerifyingEmail,
    updatePassword,
    triggerEmailVerification,
  } = useSecurity()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const handlePasswordSubmit = async (data: ChangePasswordFormValues) => {
    const res = await updatePassword(data)
    if (res.success) {
      reset()
    }
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <Loader2 className='h-6 w-6 animate-spin text-slate-400' />
      </div>
    )
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
      <form
        onSubmit={handleSubmit(handlePasswordSubmit)}
        className='space-y-4 max-w-md'
      >
        <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5'>
          <KeyRound className='h-3.5 w-3.5 text-slate-400' /> Update Password
        </h4>

        {/* Current Password */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-slate-700'>
            Current Password
          </label>
          <div className='relative'>
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              {...register('currentPassword')}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 transition ${
                errors.currentPassword
                  ? 'border-red-500 focus:ring-red-500/10'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
              }`}
            />
            <button
              type='button'
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className='absolute right-3 top-2.5 text-slate-400 hover:text-slate-600'
            >
              {showCurrentPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className='text-[11px] font-medium text-red-500'>
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        {/* New Password */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-slate-700'>
            New Password
          </label>
          <div className='relative'>
            <input
              type={showNewPassword ? 'text' : 'password'}
              {...register('newPassword')}
              className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 transition ${
                errors.newPassword
                  ? 'border-red-500 focus:ring-red-500/10'
                  : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
              }`}
            />
            <button
              type='button'
              onClick={() => setShowNewPassword(!showNewPassword)}
              className='absolute right-3 top-2.5 text-slate-400 hover:text-slate-600'
            >
              {showNewPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className='text-[11px] font-medium text-red-500'>
              {errors.newPassword.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className='space-y-1.5'>
          <label className='text-xs font-bold text-slate-700'>
            Confirm New Password
          </label>
          <input
            type='password'
            {...register('confirmPassword')}
            className={`w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 transition ${
              errors.confirmPassword
                ? 'border-red-500 focus:ring-red-500/10'
                : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
            }`}
          />
          {errors.confirmPassword && (
            <p className='text-[11px] font-medium text-red-500'>
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type='submit'
          disabled={isChangingPassword}
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition shadow-sm disabled:opacity-50 min-w-[120px]'
        >
          {isChangingPassword ? (
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
              onClick={triggerEmailVerification}
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
