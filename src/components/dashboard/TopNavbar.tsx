'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import UserDropdown from './UserDropdown'
// import Sidebar from './Sidebar'
import { Bell, Menu, Loader2, AlertCircle } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useQuery } from '@tanstack/react-query'
import { getDashboardDataAction } from '@/app/actions/dashboard'
import { SidebarTrigger } from '../ui/sidebar'

export default function TopNavbar() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const currentRouteName = pathname.split('/')[1] || 'Dashboard'

  // Hydration protection block
  useEffect(() => {
    setMounted(true)
  }, [])

  // Single data cache hook synced perfectly across the main dashboard layout space
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardDataAction,
    enabled: mounted, // Only fetch once hydration completes securely
  })

  // Safe variable fallbacks for dynamic badge evaluations
  const pendingNotificationCount = data?.insights?.pendingErrands ?? 0

  if (!mounted) {
    return (
      <header className='flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-8' />
    )
  }

  return (
    <header className='sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white/80 backdrop-blur-md px-4 md:px-8 shadow-sm shadow-slate-100/30 select-none'>
      <SidebarTrigger />
      {/* Left side: Mobile Menu Trigger + Route Dynamic Headers */}
      <div className='flex items-center gap-3'>
        {/* <div className='md:hidden'>
          <Sheet>
            <SheetTrigger
              className='rounded-xl p-2 text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 transition-all focus:outline-none'
              aria-label='Open navigation menu'
            >
              <Menu className='h-5 w-5' />
            </SheetTrigger>

            <SheetContent
              side='left'
              className='p-0 w-64 border-r-0 shadow-2xl'
            >
              <Sidebar isMobile={true} />
            </SheetContent>
          </Sheet>
        </div> */}

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

      {/* Right side: Dynamic Actions & Active Profiles */}
      <div className='flex items-center gap-3.5'>
        {/* Real-time Notification Center Hub */}
        <button
          type='button'
          className='group relative rounded-xl p-2 text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 transition-all focus:outline-none'
          title={
            pendingNotificationCount > 0
              ? `${pendingNotificationCount} actions pending`
              : 'No unread logs'
          }
        >
          <Bell className='h-5 w-5 transition-transform group-hover:rotate-12 duration-200' />

          {/* Condition-controlled alert badge triggered by live db tracking states */}
          {pendingNotificationCount > 0 && (
            <span className='absolute top-1.5 right-1.5 flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75' />
              <span className='relative inline-flex rounded-full h-2 w-2 bg-rose-500' />
            </span>
          )}
        </button>

        <div className='h-4 w-px bg-slate-200' />

        {/* User Identity Container */}
        <div className='transition-all duration-200 hover:opacity-95 active:scale-[0.99]'>
          <UserDropdown />
        </div>
      </div>
    </header>
  )
}
