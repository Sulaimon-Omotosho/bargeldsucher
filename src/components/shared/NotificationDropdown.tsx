'use client'

import { useState } from 'react'
import {
  Bell,
  Check,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Mail,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import {
  useGroupedNotifications,
  useNotificationSystem,
} from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import Link from 'next/link'
import UnreadObserver from './UnreadObserver'

interface NotificationDropdownProps {
  userId: string
}

export default function NotificationDropdown({
  userId,
}: NotificationDropdownProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const {
    notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead,
    markAllAsRead,
  } = useNotificationSystem(userId)
  const { today, yesterday, earlier } = useGroupedNotifications(notifications)

  const unreadCount = notifications.filter((n: any) => n && !n.isRead).length

  const handleActionClick = () => {
    setIsPopoverOpen(false)
    setIsSheetOpen(false)
  }

  const handleViewAllClick = () => {
    setIsPopoverOpen(false)
    setIsSheetOpen(true)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'CASH_ALERT':
        return (
          <div className='p-1.5 bg-rose-50 text-rose-600 rounded-lg'>
            <CreditCard className='h-3.5 w-3.5' />
          </div>
        )
      case 'ERRAND_STATUS':
        return (
          <div className='p-1.5 bg-emerald-50 text-emerald-600 rounded-lg'>
            <CheckCircle2 className='h-3.5 w-3.5' />
          </div>
        )
      default:
        return (
          <div className='p-1.5 bg-amber-50 text-amber-600 rounded-lg'>
            <ShieldCheck className='h-3.5 w-3.5' />
          </div>
        )
    }
  }

  const renderList = (groupedArray: any[], sectionTitle: string) => {
    if (groupedArray.length === 0) return null
    return (
      <div className='space-y-2'>
        <h5 className='text-[10px] font-black tracking-wider text-slate-400 uppercase px-1'>
          {sectionTitle}
        </h5>
        <div className='space-y-1.5'>
          {groupedArray.map((notif) => (
            <UnreadObserver
              key={notif.id}
              notificationId={notif.id}
              isRead={notif.isRead}
              onVisible={markAsRead}
            >
              <div
                // key={notif.id}
                className={`p-3 rounded-xl border text-left transition-all ${
                  notif.isRead
                    ? 'bg-white border-slate-100'
                    : 'bg-slate-50/50 border-slate-200/60'
                }`}
              >
                <div className='flex items-start gap-3'>
                  {getIcon(notif.type)}
                  <div className='flex-1 space-y-1 min-w-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <p className='text-xs font-bold text-slate-800 truncate'>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <span className='h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0' />
                      )}
                    </div>
                    <p className='text-[10.5px] font-medium text-slate-500 leading-normal'>
                      {notif.message}
                    </p>

                    {(notif.actionLabel || !notif.isRead) && (
                      <div className='flex items-center gap-1.5 pt-2'>
                        {notif.actionLabel && notif.actionRoute && (
                          <Button
                            size='sm'
                            className='h-6 text-[9.5px] font-black px-2.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white'
                            // asChild
                          >
                            <Link
                              href={notif.actionRoute}
                              onClick={handleActionClick}
                            >
                              {notif.actionLabel}
                            </Link>
                          </Button>
                        )}
                        {!notif.isRead && (
                          <Button
                            onClick={() => markAsRead(notif.id)}
                            size='sm'
                            variant='ghost'
                            className='h-6 text-[9.5px] font-bold text-slate-400 hover:text-slate-600 px-2'
                          >
                            Dismiss
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </UnreadObserver>
          ))}
        </div>
      </div>
    )
  }

  const contentMarkup = (
    <div className='flex flex-col h-[350px] max-h-[50vh] sm:h-[400px]'>
      <div className='flex items-center justify-between pb-3 border-b border-slate-100'>
        <span className='text-xs font-bold text-slate-500'>
          {isLoading ? (
            <span className='flex items-center gap-1.5'>
              <Loader2 className='h-3 w-3 animate-spin' /> Loading...
            </span>
          ) : (
            `Unread (${unreadCount})`
          )}
        </span>
        {!isLoading && unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className='text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 focus:outline-none'
          >
            <Check className='h-3 w-3' /> Mark all read
          </button>
        )}
      </div>

      <div className='flex-1 overflow-y-auto space-y-4 pt-4 pr-1 scrollbar-thin'>
        {isLoading ? (
          <div className='space-y-2 pt-2'>
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className='h-16 w-full animate-pulse bg-slate-50 rounded-xl border border-slate-100'
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center h-full py-12 text-center'>
            <div className='p-3 bg-slate-50 rounded-full text-slate-300 mb-3'>
              <Mail className='h-5 w-5' />
            </div>
            <p className='text-xs font-bold text-slate-800'>Clear Ledger</p>
            <p className='text-[10px] text-slate-400 max-w-[180px] mt-1'>
              No notifications yet.
            </p>
          </div>
        ) : (
          <>
            {renderList(today, 'Today')}
            {renderList(yesterday, 'Yesterday')}
            {renderList(earlier, 'Earlier')}
            {hasNextPage && (
              <div className='pt-2 pb-4 text-center'>
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className='text-[10px] font-bold text-slate-400 hover:text-slate-600 transition disabled:opacity-50'
                >
                  {isFetchingNextPage
                    ? 'Loading older updates...'
                    : 'Load more logs'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* 1. Main Bell Button always triggers the Popover Dropdown */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger className='group relative rounded-xl p-2 text-slate-400 hover:bg-slate-100/80 hover:text-slate-700 transition-all focus:outline-none'>
          {/* <button type='button'> */}
          <Bell className='h-5 w-5 transition-transform group-hover:rotate-12 duration-200' />
          {unreadCount > 0 && (
            <span className='absolute top-1.5 right-1.5 flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75' />
              <span className='relative inline-flex rounded-full h-2 w-2 bg-rose-500' />
            </span>
          )}
          {/* </button> */}
        </PopoverTrigger>
        <PopoverContent
          className='w-[320px] sm:w-[360px] p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xl mt-2 mr-4'
          align='end'
        >
          <h4 className='text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3'>
            Recent Updates
          </h4>

          {contentMarkup}

          {/* 2. "View All" Button at bottom of Popover to open Slide-up Sheet */}
          <div className='mt-2 pt-2 border-t border-slate-100'>
            <button
              onClick={handleViewAllClick}
              className='w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all'
            >
              <span>View All</span>
              <ExternalLink className='h-3.5 w-3.5' />
            </button>
          </div>
        </PopoverContent>
      </Popover>

      {/* 3. Global Mobile Slide-Up Drawer */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side='bottom'
          className='rounded-t-3xl p-6 bg-white border-t border-slate-100 max-h-[85vh] focus:outline-none'
        >
          <SheetHeader className='text-left pb-2'>
            <SheetTitle className='text-xs font-black uppercase tracking-wider text-slate-400'>
              All Notifications
            </SheetTitle>
          </SheetHeader>
          {contentMarkup}
        </SheetContent>
      </Sheet>
    </>
  )
}
