'use client'

import { Search, Calendar, CircleDollarSign } from 'lucide-react'

interface FilterControlsProps {
  search: string
  setSearch: (v: string) => void
  timeline: string
  setTimeline: (v: string) => void
  fromAmount: string
  setFromAmount: (v: string) => void
  toAmount: string
  setToAmount: (v: string) => void
}

export default function FilterControls({
  search,
  setSearch,
  timeline,
  setTimeline,
  fromAmount,
  setFromAmount,
  toAmount,
  setToAmount,
}: FilterControlsProps) {
  return (
    <div className='bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4'>
      {/* Absolute Dynamic Input String */}
      <div className='relative'>
        <Search className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
        <input
          type='text'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Search items by descriptor text, vendors, category or origin errand...'
          className='w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/40 font-medium placeholder-slate-400'
        />
      </div>

      {/* Custom Ranges & Timeline Settings Flex-Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1'>
        {/* Timeline Dropdown */}
        <div className='space-y-1'>
          <label className='flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
            <Calendar className='h-3 w-3' /> Time Range
          </label>
          <select
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 focus:border-slate-900 focus:outline-none transition cursor-pointer appearance-none hover:bg-slate-50'
          >
            {['All Time', 'Today', 'This Week', 'This Month', 'This Year'].map(
              (opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Minimum Custom Capital Filter Boundary Input */}
        <div className='space-y-1'>
          <label className='flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
            <CircleDollarSign className='h-3 w-3' /> Price From (₦)
          </label>
          <input
            type='number'
            placeholder='Min amount e.g. 0'
            value={fromAmount}
            onChange={(e) => setFromAmount(e.target.value)}
            className='w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 focus:border-slate-900 focus:outline-none transition bg-white'
          />
        </div>

        {/* Maximum Custom Capital Filter Boundary Input */}
        <div className='space-y-1'>
          <label className='flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
            <CircleDollarSign className='h-3 w-3' /> Price To (₦)
          </label>
          <input
            type='number'
            placeholder='Max amount e.g. 50000'
            value={toAmount}
            onChange={(e) => setToAmount(e.target.value)}
            className='w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 focus:border-slate-900 focus:outline-none transition bg-white'
          />
        </div>
      </div>
    </div>
  )
}
