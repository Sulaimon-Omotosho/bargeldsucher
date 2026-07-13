'use client'

import { Clock, PlusCircle, Edit3, Trash2, CheckCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useErrand } from '@/hooks/useErrands'

interface ErrandActivityFeedProps {
  errandId: string
}

export default function ErrandActivityFeed({
  errandId,
}: ErrandActivityFeedProps) {
  const { data: errand, isLoading, error } = useErrand(errandId)

  if (isLoading) {
    return (
      <div className='bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-3 animate-pulse'>
        <div className='h-4 bg-slate-200 rounded w-1/3' />
        <div className='space-y-2 pt-2'>
          <div className='h-3 bg-slate-100 rounded w-3/4' />
          <div className='h-3 bg-slate-100 rounded w-1/2' />
        </div>
      </div>
    )
  }

  if (error || !errand) {
    return (
      <div className='bg-white rounded-2xl border border-red-100 p-5 text-center text-xs text-red-500 font-medium'>
        Could not initialize transaction history trail.
      </div>
    )
  }

  const logs = errand.activities || []

  if (logs.length === 0) {
    return (
      <div className='bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm text-center space-y-2'>
        <Clock className='h-5 w-5 text-slate-300 mx-auto' />
        <h3 className='text-xs font-bold text-slate-700'>
          No Ledger Trail Found
        </h3>
        <p className='text-[10px] text-slate-400'>
          Activities populate automatically as workspace records are adjusted.
        </p>
      </div>
    )
  }

  return (
    <div className='bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4'>
      <div>
        <h3 className='text-base font-bold text-slate-900 flex items-center gap-2'>
          <Clock className='h-4 w-4 text-slate-400' /> Audit Activity Log
        </h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Immutable background stream profiling operational states.
        </p>
      </div>

      <div className='max-h-[320px] overflow-y-auto pr-2 ml-2 pt-2 custom-scrollbar'>
        <div className='relative pl-4 space-y-4 border-l border-slate-100 ml-2 pt-2'>
          {logs.map((log) => {
            // Normalize type mappings for uniform styling matches
            const isEdit = log.type === 'EDIT_EXPENSE'
            const isDelete = log.type === 'DELETE_EXPENSE'
            const isCreate = log.type === 'CREATE_EXPENSE'
            const isComplete = log.type === 'COMPLETED' || log.type === 'SYSTEM'

            return (
              <div key={log.id} className='relative space-y-0.5'>
                {/* Contextual Status Point Indicators */}
                <div
                  className={`absolute -left-[23px] top-0.5 p-1 rounded-full border bg-white ${
                    isEdit
                      ? 'text-amber-500 border-amber-100'
                      : isDelete
                        ? 'text-rose-500 border-rose-100'
                        : isCreate
                          ? 'text-blue-500 border-blue-100'
                          : 'text-slate-400 border-slate-100'
                  }`}
                >
                  {isEdit && <Edit3 className='h-2.5 w-2.5' />}
                  {isDelete && <Trash2 className='h-2.5 w-2.5' />}
                  {isCreate && <PlusCircle className='h-2.5 w-2.5' />}
                  {isComplete && <CheckCircle className='h-2.5 w-2.5' />}
                </div>

                <div className='flex items-baseline justify-between gap-4'>
                  <h4 className='text-xs font-bold text-slate-800 tracking-tight leading-snug'>
                    {log.title}
                  </h4>
                  <span className='text-[10px] text-slate-400 font-medium whitespace-nowrap'>
                    {formatRelativeTime(log.createdAt)}
                  </span>
                </div>

                {log.meta && (
                  <p className='text-[11px] text-slate-400 font-medium leading-normal'>
                    {log.meta}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
