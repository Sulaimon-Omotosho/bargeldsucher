'use client'

import { useState, useEffect, useMemo } from 'react'
// import { useExpenseStream } from '@/hooks/useExpenseStream'
// import ExpenseKpiCards from './components/ExpenseKpiCards'
// import FilterControls from './components/FilterControls'
// import StreamTable from './components/StreamTable'
// import ExpenseDetailsDrawer from './components/ExpenseDetailsDrawer'

// // Visual Analytics Elements
// import MonthlySpendingChart from './components/MonthlySpendingChart'
// import SpendingByCategory from './components/SpendingByCategory'
// import TopVendorsList from './components/TopVendorsList'
// import SpendingHeatmap from './components/SpendingHeatmap' // <-- Import Heatmap here

import { Expense } from '@/types/types'
import { useExpenseStream } from '@/hooks/useExpenses'
import ExpenseKpiCards from '@/components/expenses/ExpenseKpiCard'
import MonthlySpendingChart from '@/components/expenses/MonthlySpendingChart'
import SpendingByCategory from '@/components/expenses/SpendingByCategory'
import TopVendorsList from '@/components/expenses/TopVendorsList'
import SpendingHeatmap from '@/components/expenses/SpendingHeatmap'
import FilterControls from '@/components/expenses/FilterControls'
import StreamTable from '@/components/expenses/StreamTablea'
import ExpenseDetailsDrawer from '@/components/expenses/ExpenseDetailsDrawer'

export default function ExpensesPage() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [timeline, setTimeline] = useState('All Time')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')

  // Drawer Control States
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const filters = useMemo(
    () => ({
      search: debouncedSearch,
      timeline,
      fromAmount,
      toAmount,
    }),
    [debouncedSearch, timeline, fromAmount, toAmount],
  )

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useExpenseStream(filters)

  const iteratedExpenses = data?.pages.flatMap((page) => page.items) || []

  return (
    <div className='space-y-6 max-w-6xl mx-auto px-1 animate-in fade-in duration-200'>
      <div>
        <h1 className='text-2xl font-black text-slate-900 md:text-3xl tracking-tight'>
          Expense Stream Ledger
        </h1>
        <p className='text-xs md:text-sm font-medium text-slate-400'>
          Real-time tracking workspace of cash allocations and deductions.
        </p>
      </div>

      {/* 1. KPIs */}
      <ExpenseKpiCards
        expenses={iteratedExpenses}
        rawExpenses={iteratedExpenses}
      />

      {/* 2. Visual Analytics Hub Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <div className='lg:col-span-2 bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm'>
          <MonthlySpendingChart expenses={iteratedExpenses} />
        </div>

        <div className='bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm'>
          <SpendingByCategory expenses={iteratedExpenses} />
        </div>

        <div className='lg:col-span-3 bg-white p-4 sm:p-5 border border-slate-200/70 rounded-2xl shadow-sm'>
          <TopVendorsList expenses={iteratedExpenses} />
        </div>

        {/* ⭐ SPENDING HEATMAP GOES HERE: Full width span at base of analytics block */}
        <div className='lg:col-span-3'>
          <SpendingHeatmap expenses={iteratedExpenses} />
        </div>
      </div>

      {/* 3. Filter Panels */}
      <FilterControls
        search={search}
        setSearch={setSearch}
        timeline={timeline}
        setTimeline={setTimeline}
        fromAmount={fromAmount}
        setFromAmount={setFromAmount}
        toAmount={toAmount}
        setToAmount={setToAmount}
      />

      {/* 4. Stream Viewport Grid */}
      <StreamTable
        expenses={iteratedExpenses}
        isLoading={isLoading}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        onRowClick={(expense) => {
          setSelectedExpense(expense)
          setIsDrawerOpen(true)
        }}
      />

      {/* 5. Sheet Modal context portal overlay */}
      <ExpenseDetailsDrawer
        expense={selectedExpense}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  )
}
