'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  createExpenseAction,
  getSelectableErrandsAction,
} from '@/app/actions/expenses'
import { Plus, Search, Loader2 } from 'lucide-react'
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
import { ExpenseCategory } from '@/generated/prisma/enums'

type ExpenseFormValues = z.input<typeof ExpenseSchema>

export default function CreateExpense({ errandId }: { errandId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const queryClient = useQueryClient()

  // Debounce search inputs to avoid hammering Server Actions
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const closeDialog = () => {
    setIsOpen(false)
    reset({
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'OTHER',
      errandId: errandId || '',
    })
    setSearchQuery('')
    setDebouncedSearch('')
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(ExpenseSchema),
    defaultValues: {
      expenseDate: new Date().toISOString().split('T')[0],
      category: 'OTHER',
      errandId: errandId || '',
    },
  })

  const { data: selectableErrands = [], isLoading: loadingErrands } = useQuery({
    queryKey: ['selectable-errands', debouncedSearch],
    queryFn: () => getSelectableErrandsAction(debouncedSearch),
    enabled: isOpen && !errandId,
  })

  useEffect(() => {
    if (errandId) setValue('errandId', errandId)
  }, [errandId, setValue])

  const { mutateAsync: createExpense, isPending } = useMutation({
    mutationFn: createExpenseAction,
    onSuccess: () => {
      if (errandId)
        queryClient.invalidateQueries({ queryKey: ['errand', errandId] })
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      closeDialog()
      toast.success('Expense logged successfully.')
    },
    onError(error) {
      console.error(error)
      toast.error(error.message)
    },
  })

  const onSubmit = async (data: ExpenseFormValues) => {
    console.log(data)
    try {
      await createExpense({
        description: data.description,
        amount: Number(data.amount),
        category: data.category as ExpenseCategory,
        vendor: data.vendor?.trim() || undefined,
        receiptUrl: data.receiptUrl?.trim() || undefined,
        expenseDate: data.expenseDate,
        errandId: data.errandId,
      })
    } catch (error) {
      console.error(error)
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
      <DialogTrigger className='inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/10 hover:bg-slate-800 transition active:scale-[0.98]'>
        <Plus className='h-4 w-4' />
        <span>Log Expense Item</span>
      </DialogTrigger>

      <DialogContent className='max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-md'>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-xl font-bold text-slate-900'>
            Deduct Expense
          </DialogTitle>
          <DialogDescription className='text-sm text-slate-500 mt-1'>
            Log a line-item spending deduction from your active cash
            allocations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 mt-4'>
          {/* ERRAND ASSIGNMENT SELECTOR BLOCK */}
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
              Map to Errand Loop
            </label>
            {errandId ? (
              <div className='w-full rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed'>
                Locked to Current Errand Profile Loop
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='relative'>
                  <Search className='absolute left-3.5 top-3 h-4 w-4 text-slate-400' />
                  <input
                    type='text'
                    placeholder='Search past 1 month records...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
                  />
                  {loadingErrands && (
                    <Loader2 className='absolute right-3.5 top-3 h-4 w-4 animate-spin text-slate-400' />
                  )}
                </div>

                <select
                  disabled={loadingErrands}
                  {...register('errandId')}
                  className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-white'
                >
                  <option value=''>
                    -- Select Active Loop (Past 7 Days Defaults) --
                  </option>
                  {selectableErrands.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} (₦{Number(e.amountReceived).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {errors.errandId && (
              <p className='text-xs text-rose-500 mt-1'>
                {errors.errandId.message}
              </p>
            )}
          </div>

          {/* BASIC CORE SPECS ROW */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Description
              </label>
              <input
                type='text'
                placeholder='e.g., Courier dispatch fee'
                {...register('description')}
                className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
              />
              {errors.description && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Amount Spent (₦)
              </label>
              <input
                type='number'
                step='0.01'
                placeholder='5000.00'
                {...register('amount')}
                className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
              />
              {errors.amount && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          {/* METRIC DYNAMICS EXTENSION ROW */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Category
              </label>
              <select
                {...register('category')}
                className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
              >
                {ExpenseCategoryEnum.options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Transaction Date
              </label>
              <input
                type='date'
                {...register('expenseDate')}
                className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
              />
              {errors.expenseDate && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.expenseDate.message}
                </p>
              )}
            </div>
          </div>

          {/* SYSTEM AUDITING OPTIONAL LINKS ROW */}
          <div className='grid gap-4 sm:grid-cols-2'>
            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Merchant / Vendor
              </label>
              <input
                type='text'
                placeholder='e.g., DHL Nigeria'
                {...register('vendor')}
                className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
              />
            </div>

            <div>
              <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5'>
                Receipt Link URL
              </label>
              <input
                type='url'
                placeholder='https://storage.provider/rec.pdf'
                {...register('receiptUrl')}
                className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50'
              />
              {errors.receiptUrl && (
                <p className='text-xs text-rose-500 mt-1'>
                  {errors.receiptUrl.message}
                </p>
              )}
            </div>
          </div>

          {/* ACTIONS ROW CONTROL PANEL */}
          <div className='flex items-center justify-end gap-3 pt-4 border-t border-slate-100'>
            {/* <button
              type='button'
              onClick={() => setIsOpen(false)}
              className='rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition'
              disabled={isPending}
            >
              Cancel
            </button> */}
            <button
              type='submit'
              disabled={isPending}
              className='rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition disabled:opacity-50'
            >
              {isPending ? 'Logging...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
