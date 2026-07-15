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

// Define the exact Prop shape the component expects
interface AccountOverviewProps {
  user: SettingsData
}

export function AccountOverview({ user }: AccountOverviewProps) {
  // Calculate health percentage based on security checklist keys
  const checks = Object.values(user.securityChecks)
  const passedChecksCount = checks.filter(Boolean).length
  const healthPercentage = Math.round((passedChecksCount / checks.length) * 100)

  return (
    <div className='w-full space-y-6 animate-in fade-in-50 duration-200'>
      {/* Primary Card */}
      <div className='bg-white rounded-2xl border border-slate-200/60 p-4 md:p-6 shadow-sm shadow-slate-100/50 space-y-6'>
        {/* Top Section: User Info */}
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-center gap-4'>
            {/* Initials Avatar */}
            <div className='h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300/40 flex items-center justify-center font-black text-slate-700 text-xl uppercase shadow-inner'>
              {user.name ? (
                user.name.charAt(0)
              ) : (
                <User className='h-6 w-6 text-slate-500' />
              )}
            </div>

            <div className='space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h2 className='text-lg font-bold text-slate-900 leading-none'>
                  {user.name}
                </h2>
                {user.isEmailVerified && (
                  <span className='inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm'>
                    <ShieldCheck className='h-3 w-3' /> Verified
                  </span>
                )}
              </div>
              <p className='text-xs font-medium text-slate-500'>{user.email}</p>
            </div>
          </div>

          <div className='flex flex-col sm:items-end text-xs text-slate-500 gap-1'>
            <div className='flex items-center gap-1.5'>
              <Calendar className='h-3.5 w-3.5 text-slate-400' />
              <span>
                Joined <strong>{user.memberSince}</strong>
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Clock className='h-3.5 w-3.5 text-slate-400' />
              <span>
                Last active <strong>{user.lastLogin}</strong>
              </span>
            </div>
          </div>
        </div>

        <hr className='border-slate-100' />

        {/* Dynamic Grid: Statistics & Account Health Checklist */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {/* Your Data Panel */}
          <div className='space-y-3 col-span-3'>
            <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Your Data
            </h4>
            <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-3'>
              {[
                {
                  label: 'Errands',
                  value: user.stats.errands.toLocaleString('en-US'),
                },
                {
                  label: 'Expenses',
                  value: `$${user.stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                  label: 'Funding',
                  value: `$${user.stats.funding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                },
                {
                  label: 'Age',
                  value: `${user.stats.accountAgeDays}d`,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className='bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center'
                >
                  <p className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
                    {stat.label}
                  </p>
                  <p className='text-lg font-black text-slate-800 mt-0.5'>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Account Health Checklist Panel */}
          <div className='space-y-3 col-span-2'>
            <div className='flex items-center justify-between'>
              <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                Account Health
              </h4>
              <span className='text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded text-[11px] font-bold'>
                {healthPercentage}% Secured
              </span>
            </div>

            {/* Visual Health Rating Bar */}
            <div className='w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/40'>
              <div
                className='bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out'
                style={{ width: `${healthPercentage}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1'>
              {[
                {
                  label: 'Email Verified',
                  passed: user.securityChecks.emailVerified,
                },
                {
                  label: 'Strong Password',
                  passed: user.securityChecks.strongPassword,
                },
                {
                  label: 'Recovery Email Set',
                  passed: user.securityChecks.recoveryEmail,
                },
                {
                  label: 'Active Session Lock',
                  passed: user.securityChecks.activeSessionProtected,
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className='flex items-center gap-2 text-[11px] font-semibold text-slate-600'
                >
                  {item.passed ? (
                    <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
                  ) : (
                    <ShieldAlert className='h-3.5 w-3.5 text-amber-500 shrink-0' />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
