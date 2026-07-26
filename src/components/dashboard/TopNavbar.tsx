'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import UserDropdown from './UserDropdown'
import { Loader2, AlertCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getDashboardDataAction } from '@/app/actions/dashboard'
import { SidebarTrigger } from '../ui/sidebar'
import NotificationDropdown from '../shared/NotificationDropdown'
import { useSession } from 'next-auth/react'
import { User } from '@/types/types'

export default function TopNavbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const currentRouteName = pathname.split('/')[1] || 'Dashboard'

  const currentUserId = session?.user?.id

  // Hydration protection block
  useEffect(() => {
    setMounted(true)
  }, [])

  // Dashboard Query
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardDataAction,
    enabled: mounted,
  })

  const pendingNotificationCount = data?.insights?.pendingErrands ?? 0

  if (!mounted) {
    return (
      <header className='flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-8' />
    )
  }

  return (
    <header className='sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-8 shadow-sm shadow-slate-100/30 select-none'>
      {/* Left side: Mobile Trigger + Route Header */}
      <div className='flex items-center gap-3'>
        <SidebarTrigger />
        <div className='flex items-center gap-2'>
          <h2 className='text-md md:text-lg font-bold tracking-tight text-slate-900 capitalize'>
            {currentRouteName}
          </h2>

          {/* Reactive Route Context Pill */}
          {isLoading ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin text-slate-300' />
          ) : currentRouteName === 'dashboard' &&
            pendingNotificationCount > 0 ? (
            <span className='inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/40 animate-pulse'>
              <AlertCircle className='h-2.5 w-2.5' />
              {pendingNotificationCount} Action Items
            </span>
          ) : null}
        </div>
      </div>

      {/* Right side: Notifications & User Profile Dropdown */}
      <div className='flex items-center gap-3.5'>
        {currentUserId && <NotificationDropdown userId={currentUserId} />}

        <div className='h-4 w-px bg-slate-200' />

        {/* User Identity Dropdown Trigger */}
        <UserDropdown data={session?.user} />
      </div>
    </header>
  )
}
