'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import z from 'zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useErrandsList } from '@/hooks/useErrands'
import { CreateErrandFormSchema } from '@/lib/ValidationSchema'
import { useUserVerification } from '@/hooks/user/useUserVerification'
import { ErrandStepOne } from '../errands/ErrandStepOne'
import { ErrandStepTwo } from '../errands/ErrandStepTwo'

type CreateErrandValues = z.input<typeof CreateErrandFormSchema>

export default function CreateErrand() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const [hasCollaborators, setHasCollaborators] = useState(false)

  const { userStatuses, verifyUser, removeStatus } = useUserVerification()

  // Use updated useErrandsList hook
  const { createErrand, isCreating } = useErrandsList()

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateErrandValues>({
    resolver: zodResolver(CreateErrandFormSchema),
    defaultValues: {
      title: '',
      description: '',
      amountReceived: '',
      members: [],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  })

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      reset()
      setStep(1)
      setHasCollaborators(false)
    }
  }

  const handleNextStep = async () => {
    const isValid = await trigger(['title', 'amountReceived', 'description'])
    if (isValid) {
      if (fields.length === 0) {
        append({
          query: '',
          userId: '',
          role: 'COLLABORATOR',
          allocatedBudget: '',
        })
      }
      setStep(2)
    }
  }

  const handleUsernameBlur = async (index: number, value: string) => {
    const userId = await verifyUser(index, value)
    if (userId) {
      setValue(`members.${index}.userId` as any, userId)
    } else {
      setValue(`members.${index}.userId` as any, '')
    }
  }

  const handleRemoveMember = (index: number) => {
    remove(index)
    removeStatus(index)
  }

  const onSubmit = async (data: CreateErrandValues) => {
    const validMembers =
      data.members?.filter((m: any) => m.userId && m.userId.trim() !== '') || []

    const res = await createErrand({
      title: data.title,
      description: data.description ?? '',
      amountReceived: Number(data.amountReceived),
      ...(validMembers.length > 0
        ? {
            members: validMembers.map((m: any) => ({
              userId: m.userId,
              role: m.role,
              allocatedBudget: m.allocatedBudget
                ? Number(m.allocatedBudget)
                : null,
            })),
          }
        : {}),
    })

    if (res.success) {
      handleOpenChange(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className='inline-flex items-center gap-2 rounded-full lg:rounded-xl bg-emerald-600 p-3 lg:px-4 lg:py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition active:scale-[0.98] focus:outline-none'>
        <Plus className='h-5 w-5 lg:h-4 lg:w-4' />
        <span className='hidden lg:flex'>New Errand</span>
      </DialogTrigger>

      <DialogContent className='w-[92%] sm:max-w-xl rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl max-h-[85vh] flex flex-col justify-between overflow-hidden'>
        <DialogHeader className='text-left shrink-0'>
          <DialogTitle className='text-lg sm:text-xl font-bold text-slate-900'>
            {step === 1 ? 'Log Cash Allocation' : 'Add Shared Members'}
          </DialogTitle>
          <DialogDescription className='text-xs sm:text-sm text-slate-500 mt-1'>
            {step === 1
              ? 'Initialize a tracking run by establishing your starting budget cap.'
              : 'Invite team members or collaborators to manage or view this errand.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col flex-1 overflow-hidden mt-3 sm:mt-4'
        >
          {step === 1 ? (
            <ErrandStepOne
              register={register}
              errors={errors}
              hasCollaborators={hasCollaborators}
              setHasCollaborators={setHasCollaborators}
              onNextStep={handleNextStep}
              onClose={() => setIsOpen(false)}
              isPending={isCreating}
            />
          ) : (
            <ErrandStepTwo
              fields={fields}
              register={register}
              errors={errors}
              userStatuses={userStatuses}
              control={control as any}
              setValue={setValue}
              onBlurVerify={handleUsernameBlur}
              onRemoveMember={handleRemoveMember}
              onAddMember={() =>
                append({
                  query: '',
                  userId: '',
                  role: 'COLLABORATOR',
                  allocatedBudget: '',
                })
              }
              onBack={() => setStep(1)}
              isPending={isCreating}
            />
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
