'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Loader2,
  Mail,
  CheckCircle,
  AlertCircle,
  Camera,
  UserIcon,
  // User,
} from 'lucide-react'
import { User } from '@/types/types'

interface AccountFormProps {
  // user: User
  initialData?: {
    name?: string
    email?: string
    isEmailVerified?: boolean
    image?: string
  }
  onSave: (data: { name: string; image?: string }) => void
  onTriggerEmailVerification?: () => void
  isPending: boolean
  isVerifyingEmail?: boolean
}

export function Profile({
  initialData,
  onSave,
  onTriggerEmailVerification,
  isPending,
  isVerifyingEmail = false,
}: AccountFormProps) {
  const [name, setName] = useState('')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialData?.name) setName(initialData.name)
    if (initialData?.image) setAvatarPreview(initialData.image)
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || isPending) return
    onSave({ name, ...(avatarPreview && { image: avatarPreview }) })
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create local preview URL or convert to base64 string to bubble up to server action
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className='w-full animate-in fade-in-50 duration-200'>
      {/* Header Block */}
      <div className='mb-6'>
        <h3 className='text-base font-bold text-slate-900'>Account Settings</h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Manage your profile details and associated email credentials.
        </p>
      </div>

      {/* Main Split Layout: Forms on Left, Avatar on Top Right */}
      <div className='flex flex-col-reverse md:flex-row gap-8 items-start justify-between'>
        {/* Left Side: Structural Forms */}
        <form
          onSubmit={handleSubmit}
          className='w-full md:flex-1 space-y-6 max-w-xl'
        >
          {/* Profile Name Details */}
          <div className='space-y-4'>
            <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
              Profile Details
            </h4>
            <div className='space-y-1.5'>
              <label className='text-xs font-bold text-slate-700'>
                Full Name
              </label>
              <input
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 font-medium text-slate-900 transition bg-white'
                required
              />
            </div>
          </div>

          <hr className='border-slate-100' />

          {/* Email Block with Active Verification Statuses */}
          <div className='space-y-4'>
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
                    value={initialData?.email || ''}
                    disabled
                    className='w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 py-2 text-sm text-slate-400 font-medium cursor-not-allowed outline-none'
                  />
                  <Mail className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
                </div>
              </div>

              {/* Dynamic Verification UI */}
              {initialData?.isEmailVerified ? (
                <div className='inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full'>
                  <CheckCircle className='h-3.5 w-3.5' /> Verified
                </div>
              ) : (
                <div className='flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-amber-200 bg-amber-50/20 w-full'>
                  <div className='inline-flex items-center gap-1.5 text-xs font-bold text-amber-600'>
                    <AlertCircle className='h-4 w-4' /> Verification Pending
                  </div>
                  <button
                    type='button'
                    onClick={onTriggerEmailVerification}
                    disabled={isVerifyingEmail}
                    className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold text-amber-700 hover:text-white bg-amber-100/50 hover:bg-amber-600 border border-amber-200/60 hover:border-amber-600 transition shadow-sm disabled:opacity-50 shrink-0'
                  >
                    {isVerifyingEmail ? (
                      <Loader2 className='h-3 w-3 animate-spin' />
                    ) : (
                      'Resend Email'
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Form Control Button Panel */}
          <div className='pt-4 border-t border-slate-100 flex justify-end'>
            <button
              type='submit'
              disabled={isPending || !name.trim()}
              className='w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50 min-w-[120px]'
            >
              {isPending ? (
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>

        {/* Right Side: Interactive, Enlarged Profile Picture Container */}
        <div className='w-full md:w-auto flex flex-col items-center shrink-0 self-center md:self-start md:pt-4'>
          {/* <h4 className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 w-full text-center md:text-left hidden md:block'>
            Avatar Image
          </h4> */}

          {/* Hidden HTML File Input Linkage */}
          <input
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            accept='image/*'
            className='hidden'
          />

          {/* Interactive enlarged badge block */}
          <div
            onClick={handleAvatarClick}
            className='relative group h-24 w-24 sm:h-28 sm:w-28 rounded-2xl border border-slate-300/60 shadow-md flex items-center justify-center cursor-pointer overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 select-none'
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
                {name ? (
                  name.charAt(0)
                ) : (
                  <UserIcon className='h-8 w-8 text-slate-400' />
                )}
              </div>
            )}

            {/* Hover Camera Overlay Mask */}
            <div className='absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center backdrop-blur-[1px]'>
              <Camera className='h-6 w-6 text-white drop-shadow-sm' />
            </div>
          </div>

          {/* <p className='text-[10px] text-slate-400 mt-2 font-medium tracking-normal text-center'>
            Click container to update photo
          </p> */}
        </div>
      </div>
    </div>
  )
}
