'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useCreateExpense, useSelectableErrands } from '@/hooks/useExpenses'
import {
  Plus,
  Search,
  Loader2,
  AlertTriangle,
  ShieldX,
  MessageSquare,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ExpenseSchema, ExpenseCategoryEnum } from '@/lib/ValidationSchema'
import { toast } from 'sonner'
import { ExpenseCategory } from '../../../generated/prisma/enums'

type ExpenseFormValues = z.input<typeof ExpenseSchema> & {
  overspendExplanation?: string
}

export default function CreateExpense({ errandId }: { errandId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isErrandDropdownOpen, setIsErrandDropdownOpen] = useState(false)

  // Track if the user is actively focused on the Amount input block area
  const [isAmountFocused, setIsAmountFocused] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
    clearErrors,
    watch,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'OTHER',
      errandId: errandId || '',
      overspendExplanation: '',
    },
  })

  const selectedErrandId = watch('errandId')
  const amountStr = watch('amount')
  const explanation = watch('overspendExplanation')

  const {
    data: errandPages,
    isLoading: loadingErrands,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSelectableErrands(debouncedSearch, isOpen)
  // } = useSelectableErrands(debouncedSearch, isOpen && !errandId)

  const selectableErrands =
    errandPages?.pages.flatMap((page) => page.items) || []

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    if (
      scrollHeight - scrollTop <= clientHeight + 50 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }

  // Calculate live dynamic budget balances
  const selectedErrand = selectableErrands.find(
    (e) => e.id === selectedErrandId,
  )
  const allocatedBudget = selectedErrand ? selectedErrand.amountReceived : 0
  const currentTotalSpent = selectedErrand ? selectedErrand.totalSpent : 0

  const proposedAmount = Number(amountStr) || 0
  const remainingBudget = allocatedBudget - currentTotalSpent
  const projectedSpent = currentTotalSpent + proposedAmount
  const overspendAmount = projectedSpent - allocatedBudget
  const overspendPercent =
    allocatedBudget > 0 ? (overspendAmount / allocatedBudget) * 100 : 0

  const isOverBudget = overspendPercent > 0
  const isSevereOverspend = overspendPercent >= 20
  const isHardBlocked = overspendPercent > 30

  const { mutateAsync: createExpense, isPending } = useCreateExpense(errandId)

  const closeDialog = () => {
    setIsOpen(false)
    reset({
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'OTHER',
      errandId: errandId || '',
      overspendExplanation: '',
    })
    setSearchQuery('')
    setDebouncedSearch('')
    setIsErrandDropdownOpen(false)
  }

  useEffect(() => {
    if (errandId) setValue('errandId', errandId)
  }, [errandId, setValue])

  const onSubmit = async (data: ExpenseFormValues) => {
    // Clear any residual error first
    clearErrors('overspendExplanation')

    if (isHardBlocked) {
      setError('amount', {
        type: 'manual',
        message: 'Budget limit locked at max 30% overrun.',
      })
      return
    }

    // Live Check: If over budget, validate the live watched value directly
    // instead of relying solely on Zod's parsing step.
    if (isOverBudget && !explanation?.trim()) {
      setError('overspendExplanation', {
        type: 'manual',
        message:
          'A brief justification note is required to save overbudget items.',
      })
      return
    }

    try {
      await createExpense({
        description: data.description,
        amount: Number(data.amount),
        category: data.category as ExpenseCategory,
        vendor: data.vendor?.trim() || undefined,
        receiptUrl: data.receiptUrl?.trim() || undefined,
        expenseDate: data.expenseDate,
        errandId: data.errandId,
        // Pass the live explanation value directly
        overspendExplanation: isOverBudget ? explanation?.trim() : undefined,
      })
      toast.success('Expense logged successfully.')
      closeDialog()
    } catch (error: any) {
      toast.error(error.message || 'Failed to record expense')
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) closeDialog()
      }}
    >
      <DialogTrigger className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition active:scale-[0.98] w-full sm:w-auto justify-center'>
        <Plus className='h-4 w-4' />
        <span>Log Expense Item</span>
      </DialogTrigger>

      <DialogContent className='w-[94%] max-w-lg rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-xl backdrop-blur-md overflow-hidden max-h-[92vh] flex flex-col'>
        <DialogHeader className='text-left shrink-0'>
          <DialogTitle className='text-lg md:text-xl font-bold text-slate-900'>
            Deduct Expense
          </DialogTitle>
          <DialogDescription className='text-xs md:text-sm text-slate-500 mt-0.5'>
            Log a line-item spending deduction from your active cash
            allocations.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='space-y-4 mt-4 overflow-y-auto flex-1 pr-1.5 -mr-1.5'
        >
          {/* ERRAND ASSIGNMENT SELECTOR BLOCK */}
          <div className='relative'>
            <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
              Map to Errand Loop
            </label>
            {errandId ? (
              <div className='w-full rounded-xl border border-slate-200 bg-slate-100/80 px-3.5 py-2 text-xs md:text-sm font-medium text-slate-500 cursor-not-allowed'>
                Locked to Current Errand Profile Loop
              </div>
            ) : selectedErrandId && selectedErrand ? (
              <div className='flex items-center justify-between w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs md:text-sm font-medium text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150'>
                <div className='flex flex-col min-w-0 pr-2'>
                  <span className='font-semibold text-slate-900 truncate'>
                    {selectedErrand.title}
                  </span>
                  <span className='text-[10px] text-slate-500 mt-0.5 font-medium'>
                    Remaining Budget: ₦
                    {remainingBudget.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => {
                    setValue('errandId', '')
                    setSearchQuery('')
                  }}
                  className='shrink-0 rounded-lg p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition'
                  title='Change Selected Errand'
                >
                  <svg
                    className='h-4 w-4'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div className='space-y-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Search past 1 year of active loops...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsErrandDropdownOpen(true)}
                    className='w-full rounded-xl border border-slate-200 pl-9 pr-10 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
                  />
                  {loadingErrands && (
                    <Loader2 className='absolute right-3 top-2.5 h-4 w-4 animate-spin text-slate-400' />
                  )}
                </div>

                {isErrandDropdownOpen && (
                  <>
                    <div
                      className='fixed inset-0 z-10'
                      onClick={() => setIsErrandDropdownOpen(false)}
                    />
                    <div
                      ref={containerRef}
                      onScroll={handleScroll}
                      className='absolute left-0 right-0 z-20 mt-1 max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-1 bg-white shadow-lg space-y-1'
                    >
                      {selectableErrands.length === 0 && !loadingErrands && (
                        <div className='p-3 text-center text-xs text-slate-400'>
                          No active errands found
                        </div>
                      )}
                      {selectableErrands.map((e) => {
                        const remaining = e.amountReceived - e.totalSpent
                        const isOverspent = remaining < 0
                        const overPercent =
                          e.amountReceived > 0
                            ? (Math.abs(remaining) / e.amountReceived) * 100
                            : 0

                        const isHitThreshold = isOverspent && overPercent >= 20

                        return (
                          <button
                            key={e.id}
                            type='button'
                            onClick={() => {
                              setValue('errandId', e.id)
                              setIsErrandDropdownOpen(false)
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition flex items-center justify-between border ${
                              selectedErrandId === e.id
                                ? 'bg-slate-900 border-slate-900 text-white font-semibold'
                                : isHitThreshold
                                  ? 'bg-red-50 border-red-200 hover:bg-red-100/70 text-red-700'
                                  : isOverspent
                                    ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70 text-amber-800'
                                    : 'hover:bg-slate-50 border-transparent text-slate-700'
                            }`}
                          >
                            <div className='flex flex-col min-w-0 pr-2'>
                              <span className='font-medium truncate'>
                                {e.title}
                              </span>
                              {isOverspent && (
                                <span
                                  className={`text-[10px] mt-0.5 font-semibold ${
                                    selectedErrandId === e.id
                                      ? 'text-red-300'
                                      : 'text-red-600'
                                  }`}
                                >
                                  Overspent by {overPercent.toFixed(0)}%
                                </span>
                              )}
                            </div>
                            <span className='shrink-0 text-right font-mono font-medium'>
                              {isOverspent ? (
                                <span
                                  className={
                                    selectedErrandId === e.id
                                      ? 'text-red-200'
                                      : 'text-red-600'
                                  }
                                >
                                  -₦
                                  {Math.abs(remaining).toLocaleString(
                                    undefined,
                                    { minimumFractionDigits: 2 },
                                  )}
                                </span>
                              ) : (
                                <span
                                  className={
                                    selectedErrandId === e.id
                                      ? 'text-slate-300'
                                      : 'text-emerald-600'
                                  }
                                >
                                  ₦
                                  {remaining.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                  })}{' '}
                                  left
                                </span>
                              )}
                            </span>
                          </button>
                        )
                      })}
                      {isFetchingNextPage && (
                        <div className='flex justify-center p-2'>
                          <Loader2 className='h-4 w-4 animate-spin text-slate-400' />
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {errors.errandId && (
              <p className='text-xs text-rose-500 mt-1'>
                {errors.errandId.message}
              </p>
            )}
          </div>

          {/* BASIC CORE SPECS ROW */}
          <div className='grid gap-3 sm:grid-cols-2 relative'>
            <div>
              <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Description
              </label>
              <input
                type='text'
                placeholder='Courier dispatch fee'
                {...register('description')}
                className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
              />
              {errors.description && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* COMBINED BLUR/FOCUS WRAPPER CONTAINER */}
            <div
              onFocus={() => setIsAmountFocused(true)}
              onBlur={(e) => {
                // Check if the newly focused element is still inside this specific container block
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setIsAmountFocused(false)
                }
              }}
            >
              <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Amount Spent (₦)
              </label>
              <input
                type='number'
                step='0.01'
                placeholder='5000.00'
                {...register('amount', {
                  onChange: () => {
                    clearErrors('overspendExplanation')
                  },
                })}
                className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
              />
              {errors.amount && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.amount.message}
                </p>
              )}

              {/* ABSOLUTE FLOATING PORTAL OVERLAY */}
              {selectedErrandId && isAmountFocused && isOverBudget && (
                <div className='absolute left-0 right-0 z-30 mt-1.5 p-3.5 rounded-xl border shadow-xl bg-white space-y-3 animate-in fade-in slide-in-from-top-1 duration-150 max-w-sm sm:max-w-none'>
                  {isHardBlocked ? (
                    <div className='flex gap-2 bg-rose-50 border border-rose-200 p-2.5 rounded-lg'>
                      <ShieldX className='h-4 w-4 text-rose-600 shrink-0 mt-0.5 animate-pulse' />
                      <p className='text-[11px] text-rose-700 font-semibold leading-normal'>
                        Soft Cap Exceeded: Capped at max 30% overrun.
                      </p>
                    </div>
                  ) : isSevereOverspend ? (
                    <div className='flex gap-2 bg-red-500 border border-red-600 p-2.5 rounded-lg text-white'>
                      <AlertTriangle className='h-4 w-4 text-white shrink-0 mt-0.5 animate-bounce' />
                      <p className='text-[11px] font-semibold leading-normal'>
                        Critical Overspend Level ({overspendPercent.toFixed(1)}
                        %): Bg color flags are fully armed.
                      </p>
                    </div>
                  ) : (
                    <div className='flex gap-2 bg-amber-50 border border-amber-200 p-2.5 rounded-lg'>
                      <AlertTriangle className='h-4 w-4 text-amber-600 shrink-0 mt-0.5' />
                      <p className='text-[11px] text-amber-800 font-semibold leading-normal'>
                        Overage Warning: Budget overrun is{' '}
                        {overspendPercent.toFixed(1)}%.
                      </p>
                    </div>
                  )}

                  {!isHardBlocked && (
                    <div className='space-y-1'>
                      <label className='flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider'>
                        <MessageSquare className='h-3 w-3 text-slate-400' />
                        Overage Justification Note
                      </label>
                      <textarea
                        placeholder='Why is this loop exceeding budget?'
                        {...register('overspendExplanation')}
                        className='w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-slate-900 h-14 resize-none'
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {errors.overspendExplanation && (
            <p className='text-xs text-rose-500 mt-1 font-medium animate-pulse'>
              ⚠️ {errors.overspendExplanation.message}
            </p>
          )}

          {/* METRIC DYNAMICS EXTENSION ROW */}
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Category
              </label>
              <select
                {...register('category')}
                className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
              >
                {ExpenseCategoryEnum.options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Transaction Date
              </label>
              <input
                type='date'
                {...register('expenseDate')}
                className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
              />
              {errors.expenseDate && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.expenseDate.message}
                </p>
              )}
            </div>
          </div>

          {/* SYSTEM AUDITING ROW */}
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Merchant / Vendor
              </label>
              <input
                type='text'
                placeholder='e.g. DHL Nigeria'
                {...register('vendor')}
                className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
              />
            </div>

            <div>
              <label className='block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Receipt Link URL
              </label>
              <input
                type='url'
                placeholder='https://storage.provider/rec.pdf'
                {...register('receiptUrl')}
                className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs md:text-sm focus:border-slate-900 focus:outline-none transition bg-slate-50/50'
              />
              {errors.receiptUrl && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.receiptUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* ACTIONS ROW */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0'>
            <button
              type='submit'
              disabled={isPending || isHardBlocked}
              className='rounded-xl bg-slate-900 px-5 py-2.5 text-xs md:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50 w-full sm:w-auto'
            >
              {isPending ? 'Logging...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
