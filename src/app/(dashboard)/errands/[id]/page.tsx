'use client'

import { notFound, useParams } from 'next/navigation'
import { useErrand } from '@/hooks/useErrands'
import ErrandDetailSkeleton from '@/components/skeletons/ErrandDetailSkeleton'
import CreateExpense from '@/components/dashboard/CreateExpense'

// Import Project-focused Sub-modules
import ErrandDetailHeader from '@/components/errand-detail/ErrandDetailHeader'
import ErrandBudgetProgress from '@/components/errand-detail/ErrandBudgetProgress'
import ErrandVarianceCard from '@/components/errand-detail/ErrandVarianceCard'
import ErrandQuickStats from '@/components/errand-detail/ErrandQuickStats'
import ErrandProjectTabs from '@/components/errand-detail/ErrandProjectTabs'
import ErrandStickySummary from '@/components/errand-detail/ErrandStickySummary'
import ErrandVendorBreakdown from '@/components/errand-detail/ErrandVendorBreakDown'
import FinalizedErrandBanner from '@/components/errand-detail/FinalizedErrandBanner'

export default function ErrandDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: errand, isLoading, isError } = useErrand(id)

  if (isLoading) return <ErrandDetailSkeleton />
  if (isError || !errand) notFound()

  // Central Mathematical Analytical Matrices
  const initialFunding = Number(errand.amountReceived)
  const totalSpent = errand.expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  )
  const remainingCash = initialFunding - totalSpent
  const isCompleted = (errand as any).status === 'COMPLETED'

  return (
    <div className='space-y-6 animate-in fade-in duration-300 pb-20 max-w-[1400px] mx-auto px-4'>
      {/* 13. Dynamic Completion Receipt Overwrite Card / Header */}
      {isCompleted ? (
        <FinalizedErrandBanner
          errand={errand as any}
          initialFunding={errand.amountReceived}
        />
      ) : (
        <ErrandDetailHeader errand={errand} remainingCash={remainingCash} />
      )}

      {/* Core Project Metric Row Split */}
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          {/* Huge Progress Focal Point */}
          <ErrandBudgetProgress
            initialFunding={initialFunding}
            totalSpent={totalSpent}
            remainingCash={remainingCash}
          />
        </div>
        <div className='md:col-span-1'>
          {/* Signature Feature: Expected vs Actual Target Variance */}
          <ErrandVarianceCard
            initialFunding={initialFunding}
            totalSpent={totalSpent}
            remainingCash={remainingCash}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      {/* One-Liner Quick Stats Grid */}
      <ErrandQuickStats expenses={errand.expenses} />

      {/* 4-Column Canvas Grid Layout split */}
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-4 items-start'>
        {/* 1. Mobile Sticky Controls & Summaries (Renders FIRST on mobile, but stays on the Right Sidebar on desktop) */}
        <div className='order-1 lg:order-2 lg:col-span-1 space-y-6'>
          <ErrandStickySummary
            id={id}
            initialFunding={initialFunding}
            totalSpent={totalSpent}
            remainingCash={remainingCash}
            isCompleted={isCompleted}
          />

          {/* Vendor Breakdown - tucked neatly under the summary */}
          <div className='hidden md:block lg:block'>
            <ErrandVendorBreakdown
              expenses={errand.expenses}
              totalSpent={totalSpent}
            />
          </div>
        </div>

        {/* 2. Main Tabbed Report Panel (Renders SECOND on mobile, but stays on the Left on desktop) */}
        <div className='order-2 lg:order-1 lg:col-span-3 space-y-6'>
          <ErrandProjectTabs
            id={id}
            expenses={errand.expenses}
            initialFunding={initialFunding}
            remainingCash={remainingCash}
            isCompleted={isCompleted}
          />

          {/* Show vendor breakdown at the very bottom on small mobile viewports only */}
          <div className='block md:hidden'>
            <ErrandVendorBreakdown
              expenses={errand.expenses}
              totalSpent={totalSpent}
            />
          </div>
        </div>
      </div>

      {/* Mobile Actions Button */}
      {!isCompleted && (
        <div className='fixed bottom-6 right-6 z-40 lg:hidden filter drop-shadow-lg transition-transform hover:scale-[1.02]'>
          <CreateExpense errandId={id} />
        </div>
      )}
    </div>
  )
}
