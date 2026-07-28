'use client'

import { notFound, useParams } from 'next/navigation'
import { useErrand } from '@/hooks/useErrands'
import ErrandDetailSkeleton from '@/components/skeletons/ErrandDetailSkeleton'
import { ShieldCheck, UserCheck, Eye, Users, Wallet } from 'lucide-react'

// Sub-modules
import ErrandDetailHeader from '@/components/errand-detail/ErrandDetailHeader'
import ErrandBudgetProgress from '@/components/errand-detail/ErrandBudgetProgress'
import ErrandVarianceCard from '@/components/errand-detail/ErrandVarianceCard'
import ErrandQuickStats from '@/components/errand-detail/ErrandQuickStats'
import ErrandProjectTabs from '@/components/errand-detail/ErrandProjectTabs'
import ErrandStickySummary from '@/components/errand-detail/ErrandStickySummary'
import ErrandVendorBreakdown from '@/components/errand-detail/ErrandVendorBreakDown'
import FinalizedErrandBanner from '@/components/errand-detail/FinalizedErrandBanner'
import CreateExpense from '@/components/expenses/CreateExpenses'

export default function ErrandDetailPage() {
  const { id } = useParams<{ id: string }>()

  const {
    errand,
    userRole,
    members,
    isOwner,
    isCollaborator,
    isViewer,
    isLoading,
    isError,
  } = useErrand(id)

  if (isLoading) return <ErrandDetailSkeleton />
  if (isError || !errand) notFound()

  // Access rights derived directly from hook's role calculation
  const canManageErrand = isOwner
  const canLogExpense = (isOwner || isCollaborator) && !isViewer

  // Mathematical Analytical Matrices
  const initialFunding = Number(errand.amountReceived || 0)
  const totalSpent = (errand.expenses || []).reduce(
    (acc: number, curr: any) => acc + Number(curr.amount || 0),
    0,
  )
  const remainingCash = initialFunding - totalSpent
  const isCompleted = (errand as any).status === 'COMPLETED'
  const memberCount = (errand as any).members?.length || 0

  return (
    <div className='space-y-6 animate-in fade-in duration-300 pb-20 max-w-[1400px] mx-auto px-4'>
      {/* Workspace Context & Role Indicator Banner */}
      <div className='flex flex-wrap items-center justify-between gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-sm'>
        <div className='flex items-center gap-2 text-xs font-semibold'>
          <Users className='h-4 w-4 text-emerald-400' />
          <span>
            {memberCount > 0
              ? `Collaborated Errand (${memberCount} member${memberCount > 1 ? 's' : ''})`
              : 'Personal Errand Workspace'}
          </span>
        </div>

        <div className='flex items-center gap-3'>
          {/* Remaining Budget Quick Pill */}
          <div className='flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 px-3 py-1 rounded-xl text-xs'>
            <Wallet className='h-3.5 w-3.5 text-emerald-400' />
            <span className='text-slate-400 font-medium'>Budget Left:</span>
            <span
              className={`font-bold ${
                remainingCash < 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              ₦{remainingCash.toLocaleString()}
            </span>
          </div>

          {/* User Access Level Badge */}
          {isOwner && (
            <span className='inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-lg'>
              <ShieldCheck className='h-3.5 w-3.5 text-emerald-400' /> Owner
              Access
            </span>
          )}
          {isCollaborator && (
            <span className='inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-lg'>
              <UserCheck className='h-3.5 w-3.5 text-indigo-400' /> Collaborator
            </span>
          )}
          {isViewer && (
            <span className='inline-flex items-center gap-1 text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-lg'>
              <Eye className='h-3.5 w-3.5 text-amber-400' /> Read Only (Viewer)
            </span>
          )}
        </div>
      </div>

      {/* Completion Banner or Active Header */}
      {isCompleted ? (
        <FinalizedErrandBanner
          errand={errand as any}
          initialFunding={errand.amountReceived}
        />
      ) : (
        <ErrandDetailHeader
          errand={errand}
          remainingCash={remainingCash}
          canManageErrand={canManageErrand}
          canLogExpense={canLogExpense}
        />
      )}

      {/* Core Project Metric Row Split */}
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <ErrandBudgetProgress
            initialFunding={initialFunding}
            totalSpent={totalSpent}
            remainingCash={remainingCash}
          />
        </div>
        <div className='md:col-span-1'>
          <ErrandVarianceCard
            initialFunding={initialFunding}
            totalSpent={totalSpent}
            remainingCash={remainingCash}
            isCompleted={isCompleted}
          />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <ErrandQuickStats expenses={errand.expenses} />

      {/* Main Canvas Grid Layout */}
      <div className='grid gap-6 grid-cols-1 lg:grid-cols-4 items-start'>
        {/* Sticky Controls & Summaries Sidebar */}
        <div className='order-1 lg:order-2 lg:col-span-1 space-y-6'>
          <ErrandStickySummary
            id={id}
            initialFunding={initialFunding}
            totalSpent={totalSpent}
            remainingCash={remainingCash}
            isCompleted={isCompleted}
            canManageErrand={canManageErrand}
            canLogExpense={canLogExpense}
          />

          <div className='hidden md:block lg:block'>
            <ErrandVendorBreakdown
              expenses={errand.expenses}
              totalSpent={totalSpent}
            />
          </div>
        </div>

        {/* Tabbed Expenses & Reports Panel */}
        <div className='order-2 lg:order-1 lg:col-span-3 space-y-6'>
          <ErrandProjectTabs
            id={id}
            expenses={errand.expenses}
            initialFunding={initialFunding}
            remainingCash={remainingCash}
            isCompleted={isCompleted}
            canLogExpense={canLogExpense}
            members={members as any}
          />

          <div className='block md:hidden'>
            <ErrandVendorBreakdown
              expenses={errand.expenses}
              totalSpent={totalSpent}
            />
          </div>
        </div>
      </div>

      {/* Mobile Action Button (Rendered only if allowed to log expense) */}
      {!isCompleted && canLogExpense && (
        <div className='fixed bottom-6 right-6 z-40 lg:hidden filter drop-shadow-lg transition-transform hover:scale-[1.02]'>
          <CreateExpense errandId={id} />
        </div>
      )}
    </div>
  )
}
