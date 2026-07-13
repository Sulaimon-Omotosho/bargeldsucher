'use client'

import { useState } from 'react'
import {
  CalendarRange,
  ListFilter,
  Lightbulb,
  FileText,
  Paperclip,
} from 'lucide-react'
import { Expense, SerializedExpense } from '@/types/types'

// Import existing modules
import ErrandExpenseLedger from './ErrandExpenseLedger'
import ErrandActivityFeed from './ErrandActivityFeed'
import ErrandNotes from './ErrandNotes'
import ErrandSmartInsights from './ErrandSmartInsight'

interface ErrandProjectTabsProps {
  id: string
  expenses: SerializedExpense[]
  initialFunding: number
  remainingCash: number
  isCompleted: boolean
}

type TabType = 'timeline' | 'expenses' | 'insights' | 'notes' | 'attachments'

export default function ErrandProjectTabs({
  id,
  expenses,
  initialFunding,
  remainingCash,
  isCompleted,
}: ErrandProjectTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('expenses')

  const tabItems = [
    { id: 'timeline', label: 'Timeline', icon: CalendarRange },
    { id: 'expenses', label: 'Expense List', icon: ListFilter },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'attachments', label: 'Attachments', icon: Paperclip },
  ]

  return (
    <div className='space-y-4 w-full'>
      {/* Tab Switcher Headers */}
      <div className='flex items-center gap-1 border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth'>
        {tabItems.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-bold text-xs whitespace-nowrap transition-all outline-none ${
                isActive
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className='h-3.5 w-3.5' />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Dynamic Content Switching Panels */}
      <div className='animate-in fade-in duration-200'>
        {activeTab === 'timeline' && <ErrandActivityFeed errandId={id} />}

        {activeTab === 'expenses' && (
          <ErrandExpenseLedger expenses={expenses} isCompleted={isCompleted} />
        )}

        {activeTab === 'insights' && (
          <ErrandSmartInsights
            expenses={expenses}
            initialFunding={initialFunding}
            remainingCash={remainingCash}
          />
        )}

        {activeTab === 'notes' && <ErrandNotes errandId={id} />}

        {activeTab === 'attachments' && (
          <div className='bg-white rounded-2xl border border-slate-200/60 p-8 text-center shadow-sm'>
            <Paperclip className='h-8 w-8 text-slate-300 mx-auto mb-2' />
            <h4 className='text-xs font-bold text-slate-800'>
              Digital Receipt Capture Pool
            </h4>
            <p className='text-[11px] text-slate-400 mt-0.5 max-w-xs mx-auto'>
              Upload and store invoices, purchase slips, or payment captures
              linked directly to this errand.
            </p>
            <button className='mt-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition'>
              Upload Attachment
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
