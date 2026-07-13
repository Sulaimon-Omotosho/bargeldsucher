'use client'

import { Progress } from '@/components/ui/progress'
import { Calendar, Wallet, Sparkles } from 'lucide-react'
import CreateErrand from '@/components/dashboard/CreateErrand'

interface DailyBudgetMetrics {
  dailyLimit: number
  todaySpent: number
  remaining: number
  percentageSpent: number
}

interface DashboardHeaderProps {
  userName?: string | null
  dailyMetrics?: DailyBudgetMetrics
  isLoading: boolean
}

export default function DashboardHeader({
  userName,
  dailyMetrics,
  isLoading,
}: DashboardHeaderProps) {
  // Get structural date metrics localized safely
  const today = new Date()
  const dayName = today.toLocaleDateString('en-NG', { weekday: 'long' })
  const monthDay = today.toLocaleDateString('en-NG', {
    month: 'long',
    day: 'numeric',
  })

  // Programmatic time-of-day greeting generator
  const getPeriodGreeting = () => {
    const hour = today.getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const baseGreeting = getPeriodGreeting()
  const displayLimit = dailyMetrics?.dailyLimit ?? 5000
  const displaySpent = dailyMetrics?.todaySpent ?? 0
  const displayRemaining = dailyMetrics?.remaining ?? displayLimit
  const displayPercent = dailyMetrics?.percentageSpent ?? 0

  const isBudgetBreached = displayRemaining < 0 || displaySpent > displayLimit

  const remainingColorClass = isBudgetBreached
    ? 'text-rose-600 font-black animate-pulse'
    : 'text-emerald-600 font-black'

  return (
    <div className='grid gap-6 lg:grid-cols-3 items-center border-b border-slate-100 pb-6'>
      {/* Column 1: Time-Aware Master Greetings */}
      <div className='lg:col-span-1 flex flex-col justify-center space-y-1.5'>
        <div className='flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider'>
          <Calendar className='h-3.5 w-3.5 text-slate-400' />
          <span>
            {dayName}, {monthDay}
          </span>
        </div>
        <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
          {baseGreeting}, <br />
          <span className='text-emerald-600 flex items-center gap-1.5'>
            {userName || 'Chief'} 👋
          </span>
        </h1>
      </div>

      {/* Column 2: The Proactive Daily Spending Limit Card */}
      <div
        className={`lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm flex flex-col justify-between md:flex-row items-stretch md:items-center gap-5 transition-colors duration-300 ${isBudgetBreached ? 'border-rose-200 shadow-rose-50/40 bg-rose-50/10' : 'border-slate-200/60 shadow-slate-100/40'}`}
      >
        {/* Metric Balances Panel */}
        <div className='flex-1 grid grid-cols-3 gap-3'>
          <div className='space-y-0.5'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
              Daily Budget
            </span>
            <span className='text-sm font-bold text-slate-800'>
              ₦{displayLimit.toLocaleString()}
            </span>
          </div>
          <div className='space-y-0.5'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
              Spent Today
            </span>
            <span
              className={`text-sm font-bold ${isBudgetBreached ? 'text-rose-700 font-black' : 'text-rose-600'}`}
            >
              ₦{displaySpent.toLocaleString()}
            </span>
          </div>
          <div className='space-y-0.5'>
            <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
              Remaining
            </span>
            <span className={`text-sm ${remainingColorClass}`}>
              ₦{displayRemaining.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Dynamic Micro Progress Stack */}
        <div className='w-full md:w-[220px] flex flex-col justify-center space-y-1.5'>
          <div className='flex justify-between items-center text-xs font-semibold text-slate-500'>
            <span className='flex items-center gap-1'>
              <Sparkles
                className={`h-3 w-3 ${isBudgetBreached ? 'text-rose-500 animate-spin' : 'text-amber-500'}`}
              />{' '}
              Burn Rate
            </span>
            <span className={isBudgetBreached ? 'text-rose-600 font-bold' : ''}>
              {displayPercent.toFixed(0)}%
            </span>
          </div>
          {isLoading ? (
            <div className='h-2.5 rounded-full bg-slate-100 animate-pulse w-full' />
          ) : (
            <Progress
              value={Math.min(displayPercent, 100)} // Caps bar width execution cleanly at 100%
              className={`h-2.5 ${isBudgetBreached ? '[&>div]:bg-rose-600' : displayPercent > 70 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`}
            />
          )}
        </div>

        {/* Action Panel Anchor */}
        <div className='border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 flex items-center justify-end shrink-0'>
          <CreateErrand />
        </div>
      </div>
    </div>
  )
}
