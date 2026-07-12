import React from 'react'
import { Skeleton } from '../ui/skeleton'

const DashboardSkeleton = () => {
  return (
    <div className='space-y-8 p-4 md:p-0'>
      {/* Welcome Top Row Headers Skeleton */}
      <div className='flex justify-between items-center'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-48 md:w-56 rounded-lg' />
          <Skeleton className='h-4 w-64 rounded-md' />
        </div>
        <Skeleton className='h-10 w-32 rounded-xl' />
      </div>

      {/* KPI Financial Summary Grid Skeleton */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm shadow-slate-100/50 space-y-4'
          >
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-9 w-9 rounded-xl' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-8 w-28' />
              <Skeleton className='h-3 w-36' />
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Core Workspace Area Skeleton */}
      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Left Column: Recent Running Errands */}
        <div className='lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm space-y-6'>
          <div className='flex items-center justify-between border-b border-slate-100 pb-4'>
            <div className='space-y-1.5'>
              <Skeleton className='h-5 w-44' />
              <Skeleton className='h-3 w-56' />
            </div>
            <Skeleton className='h-4 w-12' />
          </div>

          <div className='space-y-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='flex items-center justify-between py-2'>
                <div className='flex items-center gap-3'>
                  <Skeleton className='h-9 w-9 rounded-xl' />
                  <div className='space-y-1.5'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                </div>
                <div className='space-y-1.5 flex flex-col items-end'>
                  <Skeleton className='h-4 w-20' />
                  <Skeleton className='h-4 w-16 rounded-full' />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: System Insights & Budgets */}
        <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col justify-between gap-6'>
          <div className='space-y-6'>
            <div className='space-y-1.5'>
              <Skeleton className='h-5 w-36' />
              <Skeleton className='h-3 w-52' />
            </div>

            {/* Insight Cards Skeleton */}
            <div className='space-y-3'>
              <div className='rounded-xl border border-slate-100 p-3 space-y-2'>
                <Skeleton className='h-3.5 w-28' />
                <Skeleton className='h-6 w-24' />
                <Skeleton className='h-3 w-40' />
              </div>
              <div className='rounded-xl border border-slate-100 p-3 space-y-2'>
                <Skeleton className='h-3.5 w-32' />
                <Skeleton className='h-3 w-full' />
              </div>
            </div>

            {/* Budgets Progress Metrics Skeleton */}
            <div className='space-y-4 pt-2'>
              <div className='space-y-1.5'>
                <Skeleton className='h-3 w-32' />
                <Skeleton className='h-2.5 w-40' />
              </div>
              <div className='space-y-4'>
                {[1, 2].map((i) => (
                  <div key={i} className='space-y-2'>
                    <div className='flex justify-between'>
                      <Skeleton className='h-3.5 w-24' />
                      <Skeleton className='h-3.5 w-8' />
                    </div>
                    <Skeleton className='h-2 w-full rounded-full' />
                    <div className='flex justify-between'>
                      <Skeleton className='h-2.5 w-16' />
                      <Skeleton className='h-2.5 w-16' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='pt-4 border-t border-slate-100 flex justify-center'>
            <Skeleton className='h-3 w-36' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSkeleton
