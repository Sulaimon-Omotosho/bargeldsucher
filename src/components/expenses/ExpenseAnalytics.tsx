'use client'

import { useMemo } from 'react'
import { Expense } from '@/types/types'
import SpendingByCategory from './SpendingByCategory'
import TopVendorsList from './TopVendorsList'
import MonthlySpendingChart from './MonthlySpendingChart'

interface AnalyticsProps {
  expenses: Expense[]
}

export default function ExpenseAnalytics({ expenses }: AnalyticsProps) {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-5 animate-in fade-in duration-200'>
      {/* 1. Monthly Performance Line graph - Takes up 2 columns on desktop */}
      <div className='lg:col-span-2 bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm'>
        <MonthlySpendingChart expenses={expenses} />
      </div>

      {/* 2. Breakdown Donut Component Box */}
      <div className='bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm'>
        <SpendingByCategory expenses={expenses} />
      </div>

      {/* 3. Top Vendor High-Outflow Rankings Box */}
      <div className='lg:col-span-3 bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm'>
        <TopVendorsList expenses={expenses} />
      </div>
    </div>
  )
}
