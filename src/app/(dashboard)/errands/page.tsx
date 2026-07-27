'use client'

import { useState } from 'react'
import { useErrandsList } from '@/hooks/useErrands'
import ErrandsSkeleton from '@/components/skeletons/ErrandsSkeleton'
import { AlertCircle, RefreshCw } from 'lucide-react'

import ErrandsHeader from '@/components/errands/ErrandsHeader'
import ErrandsSummary from '@/components/errands/ErrandsSummary'
import ErrandsFilters, {
  ErrandStatusFilter,
} from '@/components/errands/ErrandsFilter'
import ErrandCard from '@/components/errands/ErrandCard'

export type ExtendedErrandFilter = ErrandStatusFilter

export default function ErrandsPage() {
  // 1. Rename 'errands' from hook to 'payload' to avoid confusion with the array
  const {
    errands: payload,
    isLoading,
    isError,
    error,
    refetch,
  } = useErrandsList()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<ExtendedErrandFilter>('ALL')

  if (isError) {
    return (
      <div className='space-y-6 animate-in fade-in duration-300 pb-12'>
        <ErrandsHeader />
        <div className='rounded-2xl border border-rose-200 bg-rose-50/20 p-8 text-center shadow-sm max-w-2xl mx-auto mt-8'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4'>
            <AlertCircle className='h-6 w-6' />
          </div>
          <h3 className='text-base font-bold text-slate-900'>
            Failed to Synchronize Errands
          </h3>
          <p className='text-sm text-slate-500 mt-1 max-w-md mx-auto'>
            {error ?? 'An unexpected network error occurred.'}
          </p>
          <div className='mt-6 flex justify-center'>
            <button
              onClick={() => refetch()}
              className='inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm hover:bg-slate-800 transition'
            >
              <RefreshCw className='h-3.5 w-3.5' /> Try Reconnecting
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading || !payload) return <ErrandsSkeleton />

  // 2. Extract the actual array and summary from payload
  // (Adjust 'payload.errands' if your object key is payload.items or payload.data)
  const list = payload.errands ?? []
  const summary = payload.summary

  // 3. Explicit type on 'errand' derived from the array elements
  type SingleErrand = NonNullable<typeof list>[number]

  const filteredErrands = list.filter((errand: SingleErrand) => {
    const matchesSearch =
      errand.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (errand.description &&
        errand.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (!matchesSearch) return false

    const spent =
      errand.totalSpent ??
      errand.expenses?.reduce((sum, e) => sum + Number(e.amount), 0) ??
      0

    const allocated = Number(errand.amountReceived)
    const remaining = allocated - spent
    const memberCount = errand.members?.length ?? errand._count?.members ?? 0

    switch (activeFilter) {
      case 'ACTIVE':
        return remaining > 0 && errand.status !== 'COMPLETED'
      case 'COMPLETED':
        return errand.status === 'COMPLETED' || remaining === 0
      case 'OVER_BUDGET':
        return remaining < 0
      case 'SHARED':
        return memberCount > 0
      case 'THIS_MONTH': {
        const currentMonth = new Date().getMonth()
        const currentYear = new Date().getFullYear()
        const errandDate = new Date(errand.createdAt)
        return (
          errandDate.getMonth() === currentMonth &&
          errandDate.getFullYear() === currentYear
        )
      }
      case 'ALL':
      default:
        return true
    }
  })

  return (
    <div className='space-y-6 animate-in fade-in duration-300 pb-12'>
      <ErrandsHeader />

      {summary && (
        <ErrandsSummary
          totalAllocated={summary.totalAllocated}
          totalSpent={summary.totalSpent}
          totalErrandsCount={summary.totalErrandsCount}
        />
      )}

      <ErrandsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeFilter={activeFilter as ErrandStatusFilter}
        setActiveFilter={(f) => setActiveFilter(f as ExtendedErrandFilter)}
      />

      {filteredErrands.length === 0 ? (
        <div className='rounded-2xl border border-slate-200/60 bg-white p-12 text-center shadow-sm'>
          <p className='text-slate-500 text-sm font-medium'>
            No tracked errands found matching the current workspace filters.
          </p>
        </div>
      ) : (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {filteredErrands.map((errand) => (
            <ErrandCard key={errand.id} errand={errand} />
          ))}
        </div>
      )}
    </div>
  )
}
