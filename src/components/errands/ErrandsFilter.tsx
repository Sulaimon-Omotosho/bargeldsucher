'use client'

import { Search } from 'lucide-react'

export type ErrandStatusFilter =
  | 'ALL'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'OVER_BUDGET'
  | 'THIS_MONTH'

interface ErrandsFiltersProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  activeFilter: ErrandStatusFilter
  setActiveFilter: (filter: ErrandStatusFilter) => void
}

export default function ErrandsFilters({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}: ErrandsFiltersProps) {
  const filterTabs: { label: string; value: ErrandStatusFilter }[] = [
    { label: 'All Logs', value: 'ALL' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Over Budget', value: 'OVER_BUDGET' },
    { label: 'This Month', value: 'THIS_MONTH' },
  ]

  return (
    <div className='space-y-4 md:flex md:items-center md:justify-between md:space-y-0 gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-200/40'>
      {/* Search Input Input */}
      <div className='relative flex-1 max-w-md'>
        <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          type='text'
          placeholder='Search errands by purpose or tags...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className='w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'
        />
      </div>

      {/* Segmented Control Tabs */}
      <div className='flex flex-wrap gap-1.5 overflow-x-auto no-scrollbar'>
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveFilter(tab.value)}
            className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
              activeFilter === tab.value
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
