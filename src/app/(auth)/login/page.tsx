'use client'

import { useEffect, useState } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { registerUser } from '../action'
import { LoginSchema, RegisterSchema } from '@/lib/ValidationSchema'
import z from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

type LoginFormValues = z.infer<typeof LoginSchema>
type RegisterFormValues = z.infer<typeof RegisterSchema>

export default function AuthPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard')
    }
  }, [status, router])

  // REACT HOOK FORMS
  const {
    register: registerLoginField,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  })

  const {
    register: registerAuthField,
    handleSubmit: handleRegisterSubmit,
    watch,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
  })

  const password = watch('password', '')

  // SUBMIT HANDLERS
  const onLoginSubmit = async (data: LoginFormValues) => {
    setError(null)
    setLoading(true)

    const res = await signIn('credentials', {
      email: data.email,
      password: data.password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/dashboard')
    }
  }

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)
    formData.append('password', data.password)

    // console.log(Object.fromEntries(formData.entries()))

    const res = await registerUser(formData)

    if (res.error) {
      setError(res.error)
      setLoading(false)
    } else {
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        callbackUrl: '/dashboard',
      })
    }
  }

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

  return (
    <div className='flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans'>
      <div className='relative flex min-h-[550px] md:h-150 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl'>
        {/* LEFT SIDE: LOGIN FORM */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-12 transition-all duration-500 ${
            activeTab === 'login' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className='w-full max-w-sm mx-auto space-y-6'>
            {/* Logo  */}
            <Link href='/' className='flex items-center gap-2 w-fit md:hidden'>
              <div className='h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900'>
                B
              </div>
              <span className='font-semibold text-lg tracking-wider'>
                bargeldsucher
              </span>
            </Link>
            {/* Mobile-Only Tabs Toggle */}
            <div className='block md:hidden w-full mb-2'>
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  setError(null)
                  setActiveTab(val as 'login' | 'register')
                }}
              >
                <TabsList className='grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl text-slate-600'>
                  <TabsTrigger
                    value='login'
                    className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value='register'
                    className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className='space-y-2'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900'>
                Welcome back
              </h1>
              <p className='text-sm text-slate-500'>
                Log into your bargeldsucher workspace.
              </p>
            </div>

            {error && activeTab === 'login' && (
              <div className='p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-200 text-center animate-shake'>
                {error}
              </div>
            )}

            <form
              onSubmit={handleLoginSubmit(onLoginSubmit)}
              className='space-y-4'
            >
              <div className='space-y-1'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  {...registerLoginField('email')}
                />
                {loginErrors.email && (
                  <p className='text-red-500 text-sm'>
                    {loginErrors.email.message}
                  </p>
                )}
              </div>
              <div className='space-y-1'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='reg-password'
                    type={showPassword ? 'text' : 'password'}
                    {...registerLoginField('password')}
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
                {loginErrors.password && (
                  <p className='text-red-500 text-sm'>
                    {loginErrors.password?.message}
                  </p>
                )}
              </div>
              <Button className='w-full mt-2' type='submit' disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>

            <div className='relative w-full my-2'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-slate-400'>Or</span>
              </div>
            </div>

            <Button
              variant='outline'
              className='w-full'
              type='button'
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              Continue with Google
            </Button>
          </div>
        </div>

        {/* RIGHT SIDE: REGISTER FORM */}
        <div
          className={`w-full md:w-1/2 flex flex-col justify-center px-6 py-8 sm:px-12 transition-all duration-500 ${
            activeTab === 'register' ? 'flex' : 'hidden md:flex'
          }`}
        >
          <div className='w-full max-w-sm mx-auto space-y-4 sm:space-y-6'>
            {/* Logo  */}
            <Link href='/' className='flex items-center gap-2 w-fit md:hidden'>
              <div className='h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900'>
                B
              </div>
              <span className='font-semibold text-lg tracking-wider'>
                bargeldsucher
              </span>
            </Link>
            {/* Mobile-Only Tabs Toggle */}
            <div className='block md:hidden w-full mb-2'>
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  setError(null)
                  setActiveTab(val as 'login' | 'register')
                }}
              >
                <TabsList className='grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl text-slate-600'>
                  <TabsTrigger
                    value='login'
                    className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value='register'
                    className='rounded-lg data-[state=active]:bg-white data-[state=active]:text-slate-900'
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className='space-y-1 sm:space-y-2'>
              <h1 className='text-2xl sm:text-3xl font-bold tracking-tight text-slate-900'>
                Create an account
              </h1>
              <p className='text-sm text-slate-500'>
                Start tracking your expenses seamlessly.
              </p>
            </div>

            {error && activeTab === 'register' && (
              <div className='p-3 text-xs text-red-600 bg-red-50 rounded-md border border-red-200 text-center animate-shake'>
                {error}
              </div>
            )}

            <form
              onSubmit={handleRegisterSubmit(onRegisterSubmit)}
              className='space-y-2'
            >
              <div className='grid grid-cols-2 gap-2'>
                <div className='space-y-1'>
                  <Label htmlFor='reg-firstname'>First Name</Label>
                  <Input
                    id='reg-firstname'
                    type='text'
                    placeholder='John'
                    {...registerAuthField('firstName')}
                  />
                  {registerErrors.firstName && (
                    <p className='text-red-500 text-sm'>
                      {registerErrors.firstName?.message}
                    </p>
                  )}
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='reg-lastname'>Last Name</Label>
                  <Input
                    id='reg-lastname'
                    type='text'
                    placeholder='Doe'
                    {...registerAuthField('lastName')}
                  />
                  {registerErrors.lastName && (
                    <p className='text-red-500 text-sm'>
                      {registerErrors.lastName?.message}
                    </p>
                  )}
                </div>
              </div>
              <div className='space-y-1'>
                <Label htmlFor='reg-email'>Email Address</Label>
                <Input
                  id='reg-email'
                  type='email'
                  placeholder='you@example.com'
                  {...registerAuthField('email')}
                />
                {registerErrors.email && (
                  <p className='text-red-500 text-sm'>
                    {registerErrors.email?.message}
                  </p>
                )}
              </div>
              <div className='space-y-1'>
                <Label htmlFor='reg-password'>Password</Label>
                <div className='relative'>
                  <Input
                    id='reg-password'
                    type={showPassword ? 'text' : 'password'}
                    {...registerAuthField('password')}
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
                {registerErrors.password && (
                  <p className='text-red-500 text-sm'>
                    {registerErrors.password?.message}
                  </p>
                )}

                {/* <div className='rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2'>
                  <PasswordRequirement valid={passwordRules.length}>
                    At least 8 characters
                  </PasswordRequirement>

                  <PasswordRequirement valid={passwordRules.uppercase}>
                    One uppercase letter
                  </PasswordRequirement>

                  <PasswordRequirement valid={passwordRules.lowercase}>
                    One lowercase letter
                  </PasswordRequirement>

                  <PasswordRequirement valid={passwordRules.number}>
                    One number
                  </PasswordRequirement>

                  <PasswordRequirement valid={passwordRules.special}>
                    One special character
                  </PasswordRequirement>
                </div> */}
              </div>
              <div className='space-y-1'>
                <Label htmlFor='reg-confirm-password'>Confirm Password</Label>
                <div className='relative'>
                  <Input
                    id='reg-confirm-password'
                    type={showPassword ? 'text' : 'password'}
                    {...registerAuthField('confirmPassword')}
                    onPaste={(e) => e.preventDefault()}
                    className='pr-10'
                  />

                  {/* <button
                    type='button'
                    onClick={() => setShowPassword((prev) => !prev)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </button> */}
                </div>
                {registerErrors.confirmPassword && (
                  <p className='text-red-500 text-sm'>
                    {registerErrors.confirmPassword?.message}
                  </p>
                )}
              </div>
              <Button className='w-full mt-2' type='submit' disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'}
              </Button>
            </form>

            <div className='relative w-full my-1'>
              <div className='absolute inset-0 flex items-center'>
                <span className='w-full border-t' />
              </div>
              <div className='relative flex justify-center text-xs uppercase'>
                <span className='bg-white px-2 text-slate-400'>Or</span>
              </div>
            </div>

            <Button
              variant='outline'
              className='w-full'
              type='button'
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              Continue with Google
            </Button>
          </div>
        </div>

        {/* SLIDING INTRO PANEL OVERLAY - HIDDEN COMPLETELY ON MOBILE VIEWPORTS */}
        <div
          className={`hidden absolute top-0 left-0 h-full w-1/2 bg-slate-900 text-white transition-transform duration-500 ease-in-out md:flex flex-col justify-between p-12 z-20 ${
            activeTab === 'login' ? 'translate-x-full' : 'translate-x-0'
          }`}
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8)), url("https://images.unsplash.com/photo-1628126235206-5260b9ea6441?q=80&w=1200")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Brand/Logo Area */}
          <Link href='/' className='flex items-center gap-2 w-fit'>
            <div className='h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-900'>
              B
            </div>
            <span className='font-semibold text-lg tracking-wider text-emerald-400'>
              bargeldsucher
            </span>
          </Link>

          {/* Contextual Context Message */}
          <div className='space-y-4 max-w-xs transition-opacity duration-300'>
            {activeTab === 'login' ? (
              <>
                <h2 className='text-3xl font-bold leading-tight'>New here?</h2>
                <p className='text-slate-300 text-sm leading-relaxed'>
                  Sign up now and experience instantaneous, automatic cash
                  balance tracking with zero overhead.
                </p>
              </>
            ) : (
              <>
                <h2 className='text-3xl font-bold leading-tight'>
                  Welcome back!
                </h2>
                <p className='text-slate-300 text-sm leading-relaxed'>
                  Keep monitoring your errands, budgets, and operational
                  overhead easily.
                </p>
              </>
            )}
          </div>

          {/* Integrated Toggler System using Shadcn Tabs */}
          <div className='w-full flex justify-center'>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setError(null)
                setActiveTab(val as 'login' | 'register')
              }}
              className='w-full max-w-60'
            >
              <TabsList className='grid w-full grid-cols-2 bg-white/10 p-0 text-white border border-white/10 backdrop-blur-sm'>
                <TabsTrigger
                  value='login'
                  className='data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-r-none'
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value='register'
                  className='data-[state=active]:bg-white data-[state=active]:text-slate-900 rounded-l-none'
                >
                  Register
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
