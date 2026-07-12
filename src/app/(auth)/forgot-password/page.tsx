'use client'

import { useEffect, useState } from 'react'
import { forgotPassword } from '../action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function ForgotPasswordPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    // console.log(Object.fromEntries(formData.entries()))

    try {
      const res = await forgotPassword(formData)

      toast.success(res.message)
      router.push('/login')
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
        {/* Logo  */}
        <Link href='/' className='flex items-center gap-2 w-fit mb-8'>
          <div className='h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900'>
            B
          </div>
          <span className='font-semibold text-lg tracking-wider'>
            bargeldsucher
          </span>
        </Link>
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
