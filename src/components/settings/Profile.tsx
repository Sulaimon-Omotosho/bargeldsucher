'use client'

import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
  Camera,
  User as UserIcon,
  AtSign,
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Check,
  X,
} from 'lucide-react'
import { SettingsData } from '@/types/types'
import { ProfileSchema } from '@/lib/ValidationSchema'
import { useCheckUsername, useSettings } from '@/hooks/useSettings'
import { cn } from '@/lib/utils'

export type ProfileFormValues = z.input<typeof ProfileSchema>

export interface ProfileProps {
  initialData?: Partial<SettingsData> | null
  onTriggerEmailVerification?: () => void
  isVerifyingEmail?: boolean
}

export function Profile({
  initialData,
  onTriggerEmailVerification,
  isVerifyingEmail = false,
}: ProfileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { saveSettingsAsync, isSaving } = useSettings()

  function formatDate(value?: Date | string | null) {
    if (!value) return ''
    return new Date(value).toISOString().split('T')[0]
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: initialData?.profile?.firstName || '',
      lastName: initialData?.profile?.lastName || '',
      username: initialData?.profile?.username || '',
      image: initialData?.profile?.image || null,
      phone: initialData?.profile?.phone || '',
      occupation: initialData?.profile?.occupation || '',
      bio: initialData?.profile?.bio || '',
      dateOfBirth: (formatDate(initialData?.profile?.dateOfBirth) || '') as any,
      address: {
        streetAddress: initialData?.profile?.address?.streetAddress || '',
        city: initialData?.profile?.address?.city || '',
        state: initialData?.profile?.address?.state || '',
        country: initialData?.profile?.address?.country || '',
        postalCode: initialData?.profile?.address?.postalCode || '',
      },
    },
  })

  const currentUsernameInput = watch('username')
  const originalUsername = initialData?.profile?.username || ''

  const { isChecking, isAvailable } = useCheckUsername(
    currentUsernameInput,
    originalUsername,
  )

  // Watch avatar image for real-time preview
  const avatarPreview = watch('image')

  // Re-hydrate form whenever initialData is fetched/updated
  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.profile?.firstName || '',
        lastName: initialData.profile?.lastName || '',
        username: initialData.profile?.username || '',
        image: initialData.profile?.image || null,
        phone: initialData.profile?.phone || '',
        occupation: initialData.profile?.occupation || '',
        bio: initialData.profile?.bio || '',
        dateOfBirth: formatDate(initialData.profile?.dateOfBirth) as any,
        address: {
          streetAddress: initialData.profile?.address?.streetAddress || '',
          city: initialData.profile?.address?.city || '',
          state: initialData.profile?.address?.state || '',
          country: initialData.profile?.address?.country || '',
          postalCode: initialData.profile?.address?.postalCode || '',
        },
      })
    }
  }, [initialData, reset])

  // Form Submit Handler
  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await saveSettingsAsync({
        section: 'profile',
        data: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          username: values.username.trim(),
          image: values.image || null,
          phone: values.phone?.trim() || null,
          occupation: values.occupation?.trim() || null,
          bio: values.bio?.trim() || null,
          dateOfBirth: values.dateOfBirth
            ? (new Date(values.dateOfBirth) as any)
            : null,
          address: {
            streetAddress: values.address?.streetAddress?.trim() || null,
            city: values.address?.city?.trim() || null,
            state: values.address?.state?.trim() || null,
            country: values.address?.country?.trim() || null,
            postalCode: values.address?.postalCode?.trim() || null,
          },
        },
      })
    } catch (error: any) {
      console.error('Failed to save profile settings:', error)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setValue('image', reader.result as string, { shouldDirty: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'

  // Safely fallback email reading from user or root object
  const userEmail = initialData?.user?.email || ''
  const isEmailVerified = initialData?.securityChecks?.emailVerified

  return (
    <div className='w-full animate-in fade-in-50 duration-200'>
      {/* Header Block */}
      <div className='mb-5'>
        <h3 className='text-base font-bold text-slate-900'>Account Profile</h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Manage your personal details, handle, and contact information.
        </p>
      </div>

      <div className='flex flex-col-reverse md:flex-row gap-8 items-start justify-between'>
        {/* Main Form Fields */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full md:flex-1 space-y-6 max-w-xl'
        >
          {/* Basic Information */}
          <div className='space-y-3.5'>
            <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Basic Information
            </h4>

            {/* First Name & Last Name */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  First Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('firstName')}
                  placeholder='First Name'
                  className={cn(
                    inputClass,
                    errors.firstName && 'border-red-500',
                  )}
                />
                {errors.firstName && (
                  <p className='text-[11px] font-medium text-red-500'>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Last Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  {...register('lastName')}
                  placeholder='Last Name'
                  className={cn(
                    inputClass,
                    errors.lastName && 'border-red-500',
                  )}
                />
                {errors.lastName && (
                  <p className='text-[11px] font-medium text-red-500'>
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Username & Date of Birth */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Username <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    {...register('username')}
                    placeholder='@username'
                    className={cn(
                      'w-full rounded-xl border border-slate-200 pl-8 pr-8 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white',
                      (errors.username || isAvailable === false) &&
                        'border-red-500',
                    )}
                  />
                  <AtSign className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400' />
                  {/* Real-time Visual Status Indicator */}
                  <div className='absolute right-2.5 top-2.5 flex items-center'>
                    {isChecking && (
                      <Loader2 className='h-4 w-4 animate-spin text-slate-400' />
                    )}
                    {!isChecking && isAvailable === true && (
                      <Check className='h-4 w-4 text-emerald-500' />
                    )}
                    {!isChecking && isAvailable === false && (
                      <X className='h-4 w-4 text-red-500' />
                    )}
                  </div>
                </div>
                {errors.username && (
                  <p className='text-[11px] font-medium text-red-500'>
                    {errors.username.message}
                  </p>
                )}
                {!errors.username && isAvailable === false && (
                  <p className='text-[11px] font-medium text-red-500'>
                    This username is already taken.
                  </p>
                )}
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Date of Birth
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    {...register('dateOfBirth')}
                    className='w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                  />
                  <Calendar className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400 pointer-events-none' />
                </div>
              </div>
            </div>

            {/* Occupation & Phone */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Occupation
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    {...register('occupation')}
                    placeholder='Software Engineer'
                    className='w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                  />
                  <Briefcase className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400' />
                </div>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Phone Number
                </label>
                <div className='relative'>
                  <input
                    type='tel'
                    {...register('phone')}
                    placeholder='234 800 000 0000'
                    className='w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                  />
                  <Phone className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400' />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-slate-700'>Bio</label>
              <textarea
                rows={2}
                {...register('bio')}
                placeholder='A short bio about yourself...'
                className='w-full rounded-xl border border-slate-200 p-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white resize-none'
              />
            </div>
          </div>

          <hr className='border-slate-100' />

          {/* Location & Address */}
          <div className='space-y-3.5'>
            <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Location & Address
            </h4>

            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-slate-700'>
                Street Address
              </label>
              <div className='relative'>
                <input
                  type='text'
                  {...register('address.streetAddress')}
                  placeholder='123 Innovation Way'
                  className='w-full rounded-xl border border-slate-200 pl-8 pr-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                />
                <MapPin className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400' />
              </div>
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-2.5'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>City</label>
                <input
                  type='text'
                  {...register('address.city')}
                  placeholder='Lagos'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  State
                </label>
                <input
                  type='text'
                  {...register('address.state')}
                  placeholder='Lagos'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Country
                </label>
                <input
                  type='text'
                  {...register('address.country')}
                  placeholder='Nigeria'
                  className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Postal Code
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    {...register('address.postalCode')}
                    placeholder='100001'
                    className='w-full rounded-xl border border-slate-200 pl-7 pr-2 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                  />
                  <Hash className='absolute left-2 top-2.5 h-3.5 w-3.5 text-slate-400' />
                </div>
              </div>
            </div>
          </div>

          <hr className='border-slate-100' />

          {/* Email Identity */}
          <div className='space-y-3.5'>
            <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Email Identity
            </h4>
            <div className='space-y-3'>
              <div className='space-y-1.5'>
                <label className='text-xs font-bold text-slate-700'>
                  Email Address
                </label>
                <div className='relative'>
                  <input
                    type='email'
                    value={userEmail}
                    disabled
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-8 pr-3 py-2 text-sm text-slate-400 font-medium cursor-not-allowed outline-none'
                  />
                  <Mail className='absolute left-2.5 top-2.5 h-4 w-4 text-slate-400' />
                </div>
              </div>

              {/* Dynamic Verification Badge */}
              {isEmailVerified ? (
                <div className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full'>
                  <CheckCircle className='h-3.5 w-3.5' /> Email Verified
                </div>
              ) : (
                <div className='flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/30 w-full'>
                  <div className='inline-flex items-center gap-1.5 text-xs font-bold text-amber-600'>
                    <AlertCircle className='h-4 w-4' /> Verification Pending
                  </div>
                  {onTriggerEmailVerification && (
                    <button
                      type='button'
                      onClick={onTriggerEmailVerification}
                      disabled={isVerifyingEmail}
                      className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-amber-700 hover:text-white bg-amber-100/50 hover:bg-amber-600 border border-amber-200/60 hover:border-amber-600 transition shadow-sm disabled:opacity-50 shrink-0'
                    >
                      {isVerifyingEmail ? (
                        <Loader2 className='h-3 w-3 animate-spin' />
                      ) : (
                        'Resend Link'
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className='pt-4 border-t border-slate-100 flex justify-end'>
            <button
              type='submit'
              disabled={isSaving}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[130px]'
            >
              {isSaving ? (
                <Loader2 className='h-4 w-4 animate-spin' />
              ) : (
                'Save Changes'
              )}
            </button>
            {/* Temporary debug block */}
            {/* <p>
              {Object.keys(errors).length > 0 && (
                <pre className='text-xs text-red-500'>
                  {JSON.stringify(errors, null, 2)}
                </pre>
              )}
            </p> */}
          </div>
        </form>

        {/* Avatar Uploader */}
        <div className='w-full md:w-auto flex flex-col items-center shrink-0 self-center md:self-start md:pt-4'>
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />

          <div
            onClick={handleAvatarClick}
            className='relative group h-28 w-28 rounded-2xl border border-slate-300/60 shadow-md flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 select-none'
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt='Profile Avatar'
                className='h-full w-full object-cover transition duration-300 group-hover:scale-105'
              />
            ) : (
              <div className='font-black text-slate-700 text-3xl uppercase tracking-tighter'>
                <UserIcon className='h-8 w-8 text-slate-400' />
              </div>
            )}

            <div className='absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]'>
              <Camera className='h-6 w-6 text-white drop-shadow-sm' />
            </div>
          </div>
          <p className='text-[11px] font-medium text-slate-400 mt-2 text-center'>
            Click image to upload
          </p>
        </div>
      </div>
    </div>
  )
}
