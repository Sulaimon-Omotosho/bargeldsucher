'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useMemo } from 'react'

interface UserDropdownProps {
  data?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  } | null
}

export default function UserDropdown({ data: user }: UserDropdownProps) {
  const userInitials = useMemo(() => {
    if (!user?.name) return 'U'

    return user.name
      ?.trim()
      .split(/\s+/)
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }, [user?.name])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label='Open user menu'
        className='flex items-center gap-2.5 rounded-full p-1 transition-all hover:bg-slate-100/80 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 cursor-pointer'
      >
        <Avatar className='h-8 w-8 border border-slate-200'>
          <AvatarImage
            src={user?.image ?? undefined}
            alt={user?.name ?? 'User'}
          />
          <AvatarFallback className='bg-slate-900 font-semibold text-white text-xs'>
            {userInitials}
          </AvatarFallback>
        </Avatar>

        <div className='hidden text-left md:block'>
          <p className='text-xs font-semibold text-slate-800 leading-tight'>
            {user?.name ?? 'User Name'}
          </p>
        </div>

        <ChevronDown className='h-3.5 w-3.5 text-slate-400' />
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-56' align='end'>
        <DropdownMenuGroup>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1 p-1'>
              <p className='text-sm font-semibold leading-none text-slate-900'>
                {user?.name ?? 'User'}
              </p>
              <p className='text-xs leading-none text-slate-500 truncate'>
                {user?.email ?? ''}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Navigation Section */}
        <DropdownMenuGroup>
          <Link href='/settings?tab=profile'>
            <DropdownMenuItem className='cursor-pointer flex items-center gap-2'>
              <UserIcon className='h-4 w-4 text-slate-500' />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          {/* <Link href='/settings'>
            <DropdownMenuItem className='cursor-pointer flex items-center gap-2'>
              <Settings className='h-4 w-4 text-slate-500' />
              <span>Account Settings</span>
            </DropdownMenuItem>
          </Link> */}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign Out Trigger */}
        <DropdownMenuItem
          onClick={() =>
            signOut({
              callbackUrl: '/login',
            })
          }
          className='flex items-center gap-2 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700'
        >
          <LogOut className='h-4 w-4' />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
