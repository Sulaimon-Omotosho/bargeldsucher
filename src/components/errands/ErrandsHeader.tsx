'use client'

import CreateErrand from '@/components/dashboard/CreateErrand'

export default function ErrandsHeader() {
  return (
    <div className='flex items-center justify-between'>
      <div>
        <h1 className='text-2xl font-bold text-slate-900 md:text-3xl tracking-tight'>
          Tracked Errands
        </h1>
        <p className='text-sm text-slate-500 mt-0.5'>
          Manage advance funding records and balance usage logs.
        </p>
      </div>
      <CreateErrand />
    </div>
  )
}
