'use client'

import { useState } from 'react'
import { forgotPassword } from '../action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // console.log(Object.fromEntries(formData.entries()))

    try {
      const res = await forgotPassword(formData)

      toast.success(res.message)
      setMessage(res.message)
    } catch (error) {
      console.error(error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex min-h-screen items-center justify-center'>
      <div className='w-full max-w-md rounded-xl border bg-white p-8 shadow'>
        <h1 className='mb-2 text-2xl font-bold'>Forgot Password</h1>

        <p className='mb-6 text-sm text-slate-500'>
          Enter your email address and we'll send you a password reset link.
        </p>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <Label>Email</Label>

            <Input type='email' name='email' required />
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
          {/* 
          {message && (
            <p className='text-center text-sm text-emerald-600'>{message}</p>
          )} */}
        </form>
      </div>
    </div>
  )
}
