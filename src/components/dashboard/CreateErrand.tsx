'use client'

import { useRef, useState } from 'react'
import { createErrandAction } from '@/app/actions/errands'
import { Plus, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '../ui/button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import z from 'zod'
import { ErrandSchema } from '@/lib/ValidationSchema'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

type ErrandFormValues = z.input<typeof ErrandSchema>

export default function CreateErrand() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ErrandFormValues>({
    resolver: zodResolver(ErrandSchema),
    defaultValues: {
      title: '',
      description: '',
      amountReceived: '',
    },
  })

  const { mutateAsync: createErrand, isPending } = useMutation({
    mutationFn: createErrandAction,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['errands'],
      })
      reset()
      setIsOpen(false)
      toast.success('Errand created successfully.')
    },
    onError: (error) => {
      console.error(error)
      toast.error(error.message)
    },
  })

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   const formData = new FormData(e.currentTarget)

  //   console.log(Object.fromEntries(formData.entries()))

  //   // await createErrand({
  //   //   title: formData.get('title') as string,
  //   //   description: formData.get('description') as string,
  //   //   amountReceived: parseFloat(formData.get('amountReceived') as string),
  //   // })

  // const values: ErrandFormValues = {
  //   title: formData.get('title') as string,
  //   description: (formData.get('description') as string) || '',
  //   amountReceived: formData.get('amountReceived'),
  //   // amountReceived: Number(formData.get('amountReceived')),
  // }

  // const result = ErrandSchema.safeParse(values)

  // if (!result.success) {  setErrors({
  //   title: result.error.flatten().fieldErrors.title?.[0],
  //   description: result.error.flatten().fieldErrors.description?.[0],
  //   amountReceived: result.error.flatten().fieldErrors.amountReceived?.[0],
  // })
  //   return
  // }

  // await createErrand(result.data)
  // }
  const onSubmit = async (data: ErrandFormValues) => {
    // console.log(data)

    await createErrand({
      title: data.title,
      description: data.description ?? '',
      amountReceived: Number(data.amountReceived),
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Primary Trigger Button positioned at upper right of Errand space */}
      <DialogTrigger className='inline-flex items-center lg:gap-2 rounded-full lg:rounded-xl bg-emerald-600 p-2 lg:px-4 lg:py-2.5 text-sm font-semibold text-white shadow-sm shadow-emerald-100 hover:bg-emerald-700 transition active:scale-[0.98]'>
        <Plus className='h-8 w-8 lg:h-4 lg:w-4' />
        <span className='hidden lg:flex'>New Errand</span>
      </DialogTrigger>

      {/* Backdrop panel with backdrop-blur styling injected natively */}
      <DialogContent className='max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl backdrop-blur-md sm:max-w-xl'>
        <DialogHeader className='text-left'>
          <DialogTitle className='text-xl font-bold text-slate-900'>
            Log Cash Allocation
          </DialogTitle>
          <DialogDescription className='text-sm text-slate-500 mt-1'>
            Initialize a tracking run by establishing your starting budget cap.
          </DialogDescription>
        </DialogHeader>

        {/* Core Client Form Segment */}
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5 mt-4'>
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
              Errand Title / Purpose
            </label>
            <input
              type='text'
              {...register('title')}
              required
              placeholder='e.g., Office Supplies Run, Fuel Allocation'
              className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50 focus:bg-white'
            />
            {errors.title && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.title.message}
              </p>
            )}
          </div>
          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
              Amount Received (₦)
            </label>
            <input
              type='number'
              {...register('amountReceived')}
              required
              min='0.01'
              step='0.01'
              placeholder='100,000.00'
              className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition bg-slate-50/50 focus:bg-white'
            />
            {errors.amountReceived && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.amountReceived.message}
              </p>
            )}
          </div>

          <div>
            <label className='block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2'>
              Notes / Description (Optional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder='Notes...'
              className='w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none transition resize-none bg-slate-50/50 focus:bg-white'
            />
            {errors.description && (
              <p className='mt-1 text-sm text-red-500'>
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Action Row Layout Controllers */}
          <div className='flex items-center justify-end gap-3 pt-2'>
            <Button
              type='button'
              onClick={() => setIsOpen(false)}
              className='rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition'
              disabled={isPending}
            >
              Cancel
            </Button>
            <button
              type='submit'
              disabled={isPending}
              className='rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isPending ? 'Creating...' : 'Create Loop'}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
