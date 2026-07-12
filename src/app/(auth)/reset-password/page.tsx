'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { ResetPasswordSchema } from '@/lib/ValidationSchema'
import { resetPassword } from '../action'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import z from 'zod'
import { Eye, EyeOff } from 'lucide-react'

type ResetPasswordValues = z.infer<typeof ResetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
  })

  async function onSubmit(data: ResetPasswordValues) {
    if (!token) {
      toast.error('Invalid reset link.')
      return
    }

    setLoading(true)

    const formData = new FormData()

    formData.append('token', token)
    formData.append('password', data.password)
    formData.append('confirmPassword', data.confirmPassword)

    const res = await resetPassword(formData)

    setLoading(false)

    if (res.error) {
      toast.error(res.error)
      return
    }

    toast.success(res.success)

    router.push('/login?reset=success')
  }

  const password = watch('password', '')

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const strength =
    Number(passwordRules.length) +
    Number(passwordRules.uppercase) +
    Number(passwordRules.lowercase) +
    Number(passwordRules.number) +
    Number(passwordRules.special)
  const strengthText =
    strength <= 2 ? 'Weak' : strength <= 4 ? 'Medium' : 'Strong'
  const strengthWidth = `${(strength / 5) * 100}%`
  const strengthColor =
    strength <= 2
      ? 'bg-red-500'
      : strength <= 4
        ? 'bg-yellow-500'
        : 'bg-green-500'

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <p className='text-red-500'>Invalid reset link.</p>
      </div>
    )
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-100'>
      <div className='w-full max-w-md rounded-xl bg-white p-8 shadow'>
        <h1 className='mb-2 text-2xl font-bold'>Reset Password</h1>

        <p className='mb-6 text-sm text-slate-500'>
          Enter your new password below.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div className='space-y-1'>
            <Label>New Password</Label>

            {/* <Input type='password' {...register('password')} /> */}
            <div className='relative'>
              <Input
                // id='reg-password'
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className='pr-10'
              />

              <button
                type='button'
                onClick={() => setShowPassword((prev) => !prev)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700'
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            </div>
            <div className='space-y-2'>
              <div className='h-2 overflow-hidden rounded-full bg-slate-200'>
                <div
                  className={`h-full transition-all duration-300 ${strengthColor}`}
                  style={{
                    width: strengthWidth,
                  }}
                />
              </div>

              <div className='flex gap-2'>
                <p
                  className={`text-xs font-semibold ${
                    strength <= 2
                      ? 'text-red-500'
                      : strength <= 4
                        ? 'text-yellow-500'
                        : 'text-green-500'
                  }`}
                >
                  {strengthText}
                </p>
                <p className='text-xs text-slate-400'>
                  {strength * 20}% Secure
                </p>
              </div>
            </div>
            {errors.password && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label>Confirm Password</Label>

            <Input
              type={showPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
            />

            {errors.confirmPassword && (
              <p className='text-sm text-red-500 mt-1'>
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Updating Password...' : 'Reset Password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
