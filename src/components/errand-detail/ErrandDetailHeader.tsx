'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
} from 'lucide-react'
import { Errand } from '@/types/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import ErrandHeaderActions from './ErrandHeaderAction'

interface ErrandDetailHeaderProps {
  errand: Errand
  remainingCash: number
}

export default function ErrandDetailHeader({
  errand,
  remainingCash,
}: ErrandDetailHeaderProps) {
  const isCompleted = (errand as any).status === 'COMPLETED'

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <Link
          href='/errands'
          className='inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          <span>Back to All Errands</span>
        </Link>
      </div>

      <div className='bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div className='space-y-2 flex-1 min-w-0'>
          <h1 className='text-2xl font-black tracking-tight text-slate-900 capitalize truncate'>
            {errand.title}
          </h1>

          <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500'>
            <span className='flex items-center gap-1 text-slate-400'>
              <Calendar className='h-3.5 w-3.5' /> Created{' '}
              {new Date(errand.createdAt).toLocaleDateString('en-NG', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
            <span className='text-slate-300'>•</span>
            <div className='flex items-center gap-1.5'>
              <span>Status</span>
              {isCompleted ? (
                <span className='inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold text-[11px]'>
                  ⚫ Closed
                </span>
              ) : (
                <span className='inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold text-[11px]'>
                  🟢 Active
                </span>
              )}
            </div>
            <span className='text-slate-300'>•</span>
            <span className='font-bold text-slate-700'>
              Remaining:{' '}
              <span
                className={
                  remainingCash < 0 ? 'text-rose-600' : 'text-emerald-600'
                }
              >
                ₦{remainingCash.toLocaleString()}
              </span>
            </span>
          </div>
        </div>

        {/* Action controls button banks row */}
        <div className='flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center'>
          <ErrandHeaderActions errand={errand} />

          <DropdownMenu>
            <DropdownMenuTrigger className='inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition outline-none focus:ring-2 focus:ring-slate-900/10'>
              <Download className='h-3.5 w-3.5 text-slate-400' />
              <span>Export Report</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align='end'
              className='w-44 bg-white rounded-xl border border-slate-200 p-1 shadow-lg z-50'
            >
              <DropdownMenuItem
                onClick={() => alert('Compiling PDF...')}
                className='flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 font-semibold rounded-lg hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors'
              >
                <FileText className='h-3.5 w-3.5 text-rose-500 shrink-0' />
                <span>Export PDF</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => alert('Compiling CSV Spreadsheet...')}
                className='flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 font-semibold rounded-lg hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors'
              >
                <FileSpreadsheet className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
                <span>Export CSV</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className='my-1 bg-slate-100' />

              <DropdownMenuItem
                onClick={() => window.print()}
                className='flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 font-semibold rounded-lg hover:bg-slate-50 focus:bg-slate-50 outline-none cursor-pointer transition-colors'
              >
                <Printer className='h-3.5 w-3.5 text-slate-400 shrink-0' />
                <span>Print Sheet</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
