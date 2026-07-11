'use client'

import { getDashboardDataAction } from '@/app/actions/dashboard'
import CreateErrand from '@/components/dashboard/CreateErrand'
import CreateExpense from '@/components/dashboard/CreateExpense'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Clock,
  ArrowUpRight,
  Receipt,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardDataAction,
  })

  // Loading Skeleton State
  if (isLoading) {
    return (
      <div className='space-y-8 animate-pulse p-4'>
        <div className='flex justify-between items-center'>
          <div className='h-8 w-48 bg-slate-200 rounded-lg' />
          <div className='h-10 w-32 bg-slate-200 rounded-lg' />
        </div>
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-32 bg-slate-100 rounded-2xl border border-slate-200/60'
            />
          ))}
        </div>
        <div className='grid gap-6 lg:grid-cols-3'>
          <div className='lg:col-span-2 h-64 bg-slate-100 rounded-2xl' />
          <div className='h-64 bg-slate-100 rounded-2xl' />
        </div>
      </div>
    )
  }

  // Graceful Error fallback
  if (isError) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-slate-50 rounded-2xl border border-slate-200/60 m-4'>
        <AlertCircle className='h-10 w-10 text-rose-500 mb-3' />
        <h3 className='text-base font-semibold text-slate-900'>
          Failed to load dashboard data
        </h3>
        <p className='text-sm text-slate-500 max-w-xs mt-1'>
          Please verify your connection or database synchronization parameters
          and try again.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-8 animate-in fade-in duration-300'>
      {/* Welcome Top Row Headers */}
      <div className='flex flex-row gap-2 items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl'>
            Willkommen zurück!
          </h1>
          <p className='text-sm text-slate-500'>
            Here is what's happening with your tracked cash today.
          </p>
        </div>

        {/* Quick Interaction Primary Call to Action */}
        <div className='flex items-center justify-between'>
          <CreateErrand />
        </div>
      </div>

      {/* --- KPI Financial Summary Grid --- */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {/* Card 1: Handheld Cash Balance */}
        <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-slate-500'>
              Current Cash on Hand
            </span>
            <div className='rounded-xl bg-emerald-50 p-2 text-emerald-600'>
              <Wallet className='h-5 w-5' />
            </div>
          </div>
          <div className='mt-4'>
            <h3 className='text-3xl font-bold tracking-tight text-slate-900'>
              ₦{(data?.stats?.currentBalance ?? 0).toLocaleString()}
            </h3>
            <p className='mt-1 text-xs text-slate-400 flex items-center gap-1'>
              <TrendingUp className='h-3 w-3 text-emerald-500 inline' />
              <span className='text-emerald-600 font-medium'>+4.3%</span> safe
              limit buffer
            </p>
          </div>
        </div>

        {/* Card 2: Income Allocations */}
        <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-slate-500'>
              Total Month Funding
            </span>
            <div className='rounded-xl bg-blue-50 p-2 text-blue-600'>
              <TrendingUp className='h-5 w-5' />
            </div>
          </div>
          <div className='mt-4'>
            <h3 className='text-3xl font-bold tracking-tight text-slate-900'>
              ₦{(data?.stats?.totalFunding ?? 0).toLocaleString()}
            </h3>
            <p className='mt-1 text-xs text-slate-400'>
              Received from coordinated allocations
            </p>
          </div>
        </div>

        {/* Card 3: Outbound Expenses */}
        <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 sm:col-span-2 lg:col-span-1'>
          <div className='flex items-center justify-between'>
            <span className='text-sm font-medium text-slate-500'>
              Month Cash Outflow
            </span>
            <div className='rounded-xl bg-rose-50 p-2 text-rose-600'>
              <TrendingDown className='h-5 w-5' />
            </div>
          </div>
          <div className='mt-4'>
            <h3 className='text-3xl font-bold tracking-tight text-slate-900'>
              ₦{(data?.stats?.totalExpenses ?? 0).toLocaleString()}
            </h3>
            <p className='mt-1 text-xs text-slate-400 flex items-center gap-1'>
              <span className='text-rose-600 font-medium'>
                {data?.stats?.spendingRate?.toFixed(1) ?? '0.0'}%
              </span>{' '}
              of total intake spent
            </p>
          </div>
        </div>
      </div>

      {/* --- Two-Column Core Workspace Area --- */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left 2 Columns: Activity Stream Feed */}
        <div className='lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm'>
          <div className='flex items-center justify-between border-b border-slate-100 pb-4 mb-4'>
            <div>
              <h3 className='text-lg font-bold text-slate-900'>
                Recent Running Errands
              </h3>
              <p className='text-xs text-slate-400'>
                Your latest logged entries and tracking cycles
              </p>
            </div>
            <Link
              href='/errands'
              className='group text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors'
            >
              <span>View all</span>
              <ArrowUpRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
            </Link>
          </div>

          {/* List Component Layout */}
          <div className='divide-y divide-slate-100'>
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              data.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className='flex items-center justify-between py-3.5 first:pt-0 last:pb-0'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-xl bg-slate-100 p-2.5 text-slate-600'>
                      <Receipt className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-slate-900'>
                        {activity.title}
                      </p>
                      <p className='text-xs text-slate-400'>
                        {new Date(activity.date).toLocaleString('en-NG', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className='text-right'>
                    <p className='text-sm font-bold text-slate-900'>
                      ₦{activity.amount.toLocaleString()}
                    </p>
                    <span className='inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>
                      {activity.errandTitle}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className='text-sm text-slate-400 text-center py-6'>
                No recent transactions logged.
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Column: System Insights, Dynamic Highlights, and Budgets */}
        <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between gap-6'>
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-bold text-slate-900 mb-1'>
                System Insights
              </h3>
              <p className='text-xs text-slate-400'>
                Automated summaries based on balance run rates
              </p>
            </div>

            {/* Notification/Metric cards */}
            <div className='space-y-3'>
              {/* Dynamic Largest Expense Card */}
              {data?.insights?.largestExpense && (
                <div className='rounded-xl bg-rose-50/50 p-3 border border-rose-100/60'>
                  <p className='text-xs font-semibold text-rose-800 flex items-center gap-1.5'>
                    <TrendingDown className='h-3.5 w-3.5 text-rose-600' />
                    Largest Expense Outflow
                  </p>
                  <p className='text-lg font-bold text-slate-900 mt-1'>
                    ₦{data.insights.largestExpense.amount.toLocaleString()}
                  </p>
                  <p className='text-xs text-slate-500 mt-0.5 italic'>
                    "
                    {data.insights.largestExpense.description ||
                      'No description provided'}
                    "
                  </p>
                </div>
              )}

              <div className='rounded-xl bg-slate-50 p-3 border border-slate-100'>
                <p className='text-xs font-semibold text-slate-700 flex items-center gap-1.5'>
                  <Clock className='h-3.5 w-3.5 text-amber-500' />
                  Pending Review Needed
                </p>
                <p className='text-xs text-slate-500 mt-1'>
                  You have {data?.insights?.pendingErrands ?? 0} errands without
                  any logged expenses.
                </p>
              </div>
            </div>

            {/* --- Budgets Progress Metrics Section --- */}
            {data?.errandTotals && data.errandTotals.length > 0 && (
              <div className='space-y-4 pt-2'>
                <div>
                  <h4 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                    Errand Budget Tracks
                  </h4>
                  <p className='text-[11px] text-slate-400'>
                    Allocated cash consumption rates
                  </p>
                </div>

                <div className='space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar'>
                  {data.errandTotals.map((errand) => (
                    <div key={errand.id} className='space-y-1.5'>
                      <div className='flex justify-between items-center text-xs'>
                        <span className='font-semibold text-slate-700 truncate max-w-[70%]'>
                          {errand.title}
                        </span>
                        <span
                          className={`font-bold ${errand.percentageSpent > 90 ? 'text-rose-600' : 'text-slate-600'}`}
                        >
                          {errand.percentageSpent.toFixed(0)}%
                        </span>
                      </div>

                      <div className='h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/20'>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            errand.percentageSpent > 90
                              ? 'bg-rose-500'
                              : errand.percentageSpent > 70
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(errand.percentageSpent, 100)}%`,
                          }}
                        />
                      </div>

                      <div className='flex justify-between text-[10px] text-slate-400'>
                        <span>Spent: ₦{errand.spent.toLocaleString()}</span>
                        <span>Cap: ₦{errand.allocated.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='mt-2 pt-4 border-t border-slate-100 text-center'>
            <span className='text-[11px] font-medium text-slate-400 uppercase tracking-wider block'>
              Bargeldsucher Engine v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Floating Action Trigger */}
      <div className='fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8 filter drop-shadow-xl transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]'>
        <CreateExpense />
      </div>
    </div>
  )
}
