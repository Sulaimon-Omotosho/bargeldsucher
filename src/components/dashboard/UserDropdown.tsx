// 'use client'

import { signOut } from 'next-auth/react'
import { LogOut, User as UserIcon, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getDashboardDataAction } from '@/app/actions/dashboard'
import { useSession } from 'next-auth/react'

export default function UserDropdown() {
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isUnauthenticated = status === 'unauthenticated'

  const displayName = session?.user?.name ?? 'User'
  const displayEmail = session?.user?.email ?? ''
  const userImage = session?.user?.image
  // const { data, isLoading } = useQuery({
  //   queryKey: ['dashboard'],
  //   queryFn: getDashboardDataAction,
  // })

  // const dbUser = data?.userProfile

  // const displayName =
  //   dbUser?.name ||
  //   [dbUser?.firstName, dbUser?.lastName].filter(Boolean).join(' ')

  // const displayEmail = dbUser?.email ?? ''

  const userInitial =
    displayName?.[0]?.toUpperCase() ?? displayEmail?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className='flex items-center gap-3'>
      {/* Active User Overview Badge */}
      <div className='hidden text-right md:block select-none'>
        {isLoading ? (
          <div className='space-y-1.5 flex flex-col items-end'>
            <div className='h-3.5 w-28 bg-slate-100 rounded animate-pulse' />
            <div className='h-2.5 w-36 bg-slate-50 rounded animate-pulse' />
          </div>
        ) : (
          <>
            <p className='text-sm font-bold leading-none text-slate-900 capitalize'>
              {displayName}
            </p>
            <p className='text-[11px] text-slate-400 font-medium mt-1 truncate max-w-[160px]'>
              {displayEmail}
            </p>
          </>
        )}
      </div>

      {/* Avatar Wrapper & System Controls Section */}
      <div className='flex items-center gap-1.5'>
        <div className='relative h-9 w-9 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/60 flex items-center justify-center font-bold text-slate-700 uppercase shadow-inner'>
          {isLoading ? (
            <Loader2 className='h-4 w-4 animate-spin text-slate-400' />
          ) : (
            <span className='tracking-wider text-sm text-slate-800'>
              {userInitial}
            </span>
          )}
          {/* Active online connectivity pulse point overlay */}
          {!isLoading && (
            <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white' />
          )}
        </div>

        {/* Integrated Immediate Logout Control Action Button */}
        <button
          type='button'
          onClick={() => signOut({ callbackUrl: '/login' })}
          title='Sign Out Securely'
          className='group rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/20'
        >
          <LogOut className='h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:scale-95 duration-200' />
        </button>
      </div>
    </div>
  )
}
