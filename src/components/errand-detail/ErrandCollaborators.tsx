'use client'

import { useMemo } from 'react'
import {
  Users,
  ShieldAlert,
  UserCheck,
  Eye,
  Wallet,
  Receipt,
} from 'lucide-react'
import { SerializedExpense } from '@/types/types'
import { ErrandMemberDetail } from './ErrandProjectTabs'

interface ErrandCollaboratorsProps {
  members?: ErrandMemberDetail[]
  expenses?: SerializedExpense[]
  initialFunding: number
}

export default function ErrandCollaborators({
  members = [],
  expenses = [],
  initialFunding,
}: ErrandCollaboratorsProps) {
  // Aggregate total spending per user
  const spentByUserMap = useMemo(() => {
    const map = new Map<string, number>()

    expenses.forEach((expense: any) => {
      const possibleUserIds = [
        expense.createdById,
        expense.userId,
        expense.user?.id,
        expense.createdBy?.id,
        expense.memberId,
      ].filter(Boolean)

      const amount = Number(expense.amount || 0)

      possibleUserIds.forEach((id) => {
        const current = map.get(id) || 0
        map.set(id, current + amount)
      })
    })

    return map
  }, [expenses])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'NGN',
    }).format(val)

  return (
    <div className='bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 md:p-6 space-y-4'>
      {/* Header Info */}
      <div className='flex items-center justify-between pb-3 border-b border-slate-100'>
        <div className='flex items-center gap-2.5'>
          <div className='h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0'>
            <Users className='h-4 w-4' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-slate-900'>
              Errand Collaborators
            </h3>
            <p className='text-xs text-slate-500'>
              {members.length} {members.length === 1 ? 'member' : 'members'}{' '}
              assigned to this errand
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Members List */}
      <div className='max-h-96 overflow-y-auto no-scrollbar rounded-xl border border-slate-100'>
        {members.length === 0 ? (
          <div className='p-10 text-center space-y-2'>
            <Users className='h-8 w-8 text-slate-300 mx-auto' />
            <p className='text-xs font-semibold text-slate-600'>
              No collaborators assigned
            </p>
            <p className='text-[11px] text-slate-400 max-w-xs mx-auto'>
              Collaborators added to this errand will appear here with their
              respective roles and budget allowances.
            </p>
          </div>
        ) : (
          <div className='divide-y divide-slate-100'>
            {members.map((member) => {
              const memberUserKey =
                member.userId || member.user?.id || member.id
              const spent = spentByUserMap.get(memberUserKey) || 0
              const isViewer = member.role === 'VIEWER'
              const isOwner = member.role === 'OWNER'

              const hasAllocatedCap =
                member.allocatedBudget !== null &&
                member.allocatedBudget !== undefined &&
                Number(member.allocatedBudget) > 0

              const allocatedBudgetDisplay = isViewer
                ? 'No Access'
                : hasAllocatedCap
                  ? formatCurrency(Number(member.allocatedBudget))
                  : `${formatCurrency(initialFunding)} (Full Pool)`

              return (
                <div
                  key={member.id || member.userId}
                  className='flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50/80 transition-colors gap-3'
                >
                  {/* Member Identity */}
                  <div className='flex items-center gap-3 min-w-0'>
                    <div className='h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0'>
                      {member.user?.name
                        ? member.user.name.charAt(0).toUpperCase()
                        : 'U'}
                    </div>
                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='text-xs font-bold text-slate-900 truncate'>
                          {member.user?.name || 'Unnamed Member'}
                        </p>
                        {/* Role Badge */}
                        {isOwner && (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200/60 shrink-0'>
                            <ShieldAlert className='h-3 w-3' /> Owner
                          </span>
                        )}
                        {member.role === 'COLLABORATOR' && (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 shrink-0'>
                            <UserCheck className='h-3 w-3' /> Collaborator
                          </span>
                        )}
                        {isViewer && (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 shrink-0'>
                            <Eye className='h-3 w-3' /> Viewer
                          </span>
                        )}
                      </div>
                      <p className='text-[11px] text-slate-400 truncate mt-0.5'>
                        {member.user?.email || member.userId}
                      </p>
                    </div>
                  </div>

                  {/* Financial Counters */}
                  <div className='flex items-center justify-between sm:justify-end gap-6 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100'>
                    {/* Budget Limit */}
                    <div className='text-left sm:text-right'>
                      <div className='flex items-center sm:justify-end gap-1 text-[10px] uppercase font-bold text-slate-400'>
                        <Wallet className='h-3 w-3' />
                        <span>Budget</span>
                      </div>
                      <p
                        className={`text-xs font-bold mt-0.5 ${
                          isViewer ? 'text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {allocatedBudgetDisplay}
                      </p>
                    </div>

                    {/* Total Spent */}
                    <div className='text-right'>
                      <div className='flex items-center justify-end gap-1 text-[10px] uppercase font-bold text-slate-400'>
                        <Receipt className='h-3 w-3' />
                        <span>Spent</span>
                      </div>
                      <p className='text-xs font-bold text-rose-600 mt-0.5'>
                        {formatCurrency(spent)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
