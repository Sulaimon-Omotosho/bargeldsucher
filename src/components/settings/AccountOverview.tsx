'use client'

import { SettingsData } from '@/types/types'
import {
  Calendar,
  ShieldCheck,
  Clock,
  User,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react'

interface AccountOverviewProps {
  data: SettingsData
}

export function AccountOverview({ data }: AccountOverviewProps) {
  const userData = data?.user
  const profile = data?.profile
  const preferences = data?.preferences
  const stats = data?.stats

  const currencyCode = preferences?.currency || 'NGN'
  const locale = preferences?.language === 'en' ? 'en-US' : 'en-NG'

  const security = data?.securityChecks || {
    emailVerified: false,
    hasPassword: false,
    recoveryEmail: false,
    activeSessionProtected: false,
  }

  const checks = Object.values(security)
  const passedChecksCount = checks.filter(Boolean).length
  const healthPercentage =
    checks.length > 0
      ? Math.round((passedChecksCount / checks.length) * 100)
      : 0

  const formatMoney = (amount: number) => {
    return amount.toLocaleString(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const displayName =
    profile?.firstName && profile?.lastName
      ? `${profile.firstName} ${profile.lastName}`
      : profile?.firstName ||
        profile?.username ||
        userData?.name ||
        'User Profile'

  return (
    <div className='w-full animate-in fade-in-50 duration-200'>
      <div className='bg-white rounded-xl border border-slate-200/60 p-3.5 shadow-sm space-y-4'>
        {/* Top Header Section */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-3'>
            {/* Square profile avatar */}
            <div className='h-12 w-12 shrink-0 rounded-lg bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-lg uppercase shadow-inner overflow-hidden'>
              {profile?.image ? (
                <img
                  src={profile.image}
                  alt={profile.firstName || 'Profile Image'}
                  className='h-full w-full object-cover'
                />
              ) : profile?.firstName ? (
                profile.firstName.charAt(0)
              ) : (
                <User className='h-5 w-5 text-slate-400' />
              )}
            </div>

            <div className='space-y-0.5'>
              <div className='flex items-center gap-1.5 flex-wrap'>
                <h2 className='text-base font-bold text-slate-900 leading-tight'>
                  {displayName}
                </h2>
                {userData?.isEmailVerified && (
                  <span className='inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold px-1.5 py-0.2 rounded-md'>
                    <ShieldCheck className='h-3 w-3' /> Verified
                  </span>
                )}
              </div>
              <p className='text-xs font-medium text-slate-400 leading-none'>
                {userData?.email}
              </p>
            </div>
          </div>

          {/* Combined Metadata Timestamps */}
          <div className='flex flex-row sm:flex-col items-center sm:items-end text-[11px] font-medium text-slate-400 gap-x-3 gap-y-0.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-50'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-3 w-3 text-slate-300' />
              <span>
                Joined{' '}
                <strong className='text-slate-600'>
                  {userData?.memberSince || 'Recent'}
                </strong>
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='h-3 w-3 text-slate-300' />
              <span>
                Active{' '}
                <strong className='text-slate-600'>
                  {userData?.lastLogin || 'Just now'}
                </strong>
              </span>
            </div>
          </div>
        </div>

        <hr className='border-slate-100/80 m-0' />

        {/* Aggregated Quick-Stats Dashboard Area */}
        <div className='space-y-2.5'>
          <h4 className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
            Your Active Data
          </h4>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
            {[
              {
                label: 'Errands',
                value: (stats?.errands || 0).toLocaleString(locale),
              },
              {
                label: 'Expenses',
                value: formatMoney(stats?.expenses || 0),
              },
              {
                label: 'Total Funding',
                value: formatMoney(stats?.funding || 0),
              },
              {
                label: 'Account Age',
                value: `${stats?.accountAgeDays || 0}d`,
              },
            ].map((stat, i) => (
              <div
                key={i}
                className='bg-slate-50/60 border border-slate-100 rounded-lg p-2 text-center'
              >
                <p className='text-[9px] font-bold text-slate-400 uppercase tracking-tight'>
                  {stat.label}
                </p>
                <p className='text-sm font-extrabold text-slate-800 tracking-tight mt-0.5'>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Simplified Account Health Indicator Bar */}
        <div className='bg-slate-50/40 border border-slate-100/80 rounded-lg p-2.5 space-y-2'>
          <div className='flex items-center justify-between text-[11px]'>
            <span className='font-bold text-slate-400 uppercase tracking-wider text-[10px]'>
              Account Security
            </span>
            <span className='text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] border border-emerald-100'>
              {healthPercentage}% Protected
            </span>
          </div>

          <div className='w-full bg-slate-200/60 rounded-full h-1.5 overflow-hidden'>
            <div
              className='bg-emerald-500 h-full rounded-full transition-all duration-500'
              style={{ width: `${healthPercentage}%` }}
            />
          </div>

          <div className='grid grid-cols-2 gap-x-4 gap-y-1 pt-1'>
            {[
              { label: 'Email Verified', passed: security.emailVerified },
              { label: 'Secure Password', passed: security.hasPassword },
              {
                label: 'Recovery Configuration',
                passed: security.recoveryEmail,
              },
              {
                label: 'Active Session Lock',
                passed: security.activeSessionProtected,
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className='flex items-center gap-1.5 text-[11px] font-medium text-slate-500'
              >
                {item.passed ? (
                  <CheckCircle2 className='h-3 w-3 text-emerald-500 shrink-0' />
                ) : (
                  <ShieldAlert className='h-3 w-3 text-amber-500 shrink-0' />
                )}
                <span className='truncate'>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
