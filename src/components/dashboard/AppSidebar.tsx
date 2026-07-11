'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Settings,
  HelpCircle,
  User,
  Shield,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useEffect, useState } from 'react'

type NavigationItem = {
  name: string
  href: string
  icon: LucideIcon
}

type SettingsItem = {
  name: string
  tab: string
  icon: LucideIcon
  isDanger?: boolean
}

const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Errands',
    href: '/errands',
    icon: Wallet,
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: Receipt,
  },
]

const settingsSubmenu: SettingsItem[] = [
  {
    name: 'Profile Settings',
    tab: 'profile',
    icon: User,
  },
  {
    name: 'Preferences',
    tab: 'preferences',
    icon: Settings,
  },
  {
    name: 'Security',
    tab: 'security',
    icon: Shield,
  },
  {
    name: 'Danger Zone',
    tab: 'danger',
    icon: AlertTriangle,
    isDanger: true,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const isSettingsPage = pathname.startsWith('/settings')

  const changeSettingsTab = (tab: string) => {
    router.push(`/settings?tab=${tab}`)
  }
  const currentTab =
    pathname === '/settings' ? (searchParams.get('tab') ?? 'profile') : null

  return (
    <Sidebar
      variant='sidebar'
      collapsible='icon'
      className='border-r border-slate-200/60 bg-slate-50/50 backdrop-blur-md'
    >
      <SidebarHeader className='p-4'>
        <div className='flex items-center gap-3 px-1'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm ring-1 ring-emerald-600/10'>
            B
          </div>

          <div className='flex flex-col group-data-[collapsible=icon]:hidden'>
            <span className='text-sm font-bold leading-none tracking-tight text-slate-900'>
              Bargeldsucher
            </span>

            <span className='mt-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400'>
              Cash Engine
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-2'>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='space-y-1'>
              {navigation.map(({ name, href, icon: Icon }) => {
                const isActive =
                  pathname === href ||
                  (href !== '/dashboard' && pathname.startsWith(href))

                return (
                  <SidebarMenuItem key={name}>
                    <Link href={href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={name}
                        className={`flex g-3 rounded-xl px-4 py-5 text-sm font-semibold transition-all duration-200 ${
                          isActive
                            ? 'border border-slate-200/50 bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-500 hover:bg-white hover:text-slate-900'
                        }`}
                      >
                        <Icon
                          className={`h-4.5 w-4.5 shrink-0 ${
                            isActive ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        />

                        <span>{name}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}

              <Collapsible
                open={isSettingsPage}
                // open={open}
                // onOpenChange={setOpen}
                className='group/collapsible'
              >
                <SidebarMenuItem>
                  {/* <CollapsibleTrigger className='w-full'> */}
                  <Link href='/settings?tab=profile'>
                    <SidebarMenuButton
                      tooltip='Settings'
                      className={`w-full rounded-xl px-4 py-5 text-sm font-semibold transition-all duration-200 ${
                        isSettingsPage
                          ? 'border border-slate-200/50 bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500 hover:bg-white hover:text-slate-900'
                      }`}
                    >
                      <Settings
                        className={`h-4.5 w-4.5 ${
                          isSettingsPage ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                      />

                      <span className='group-data-[collapsible=icon]:hidden'>
                        Settings
                      </span>
                      {/* 
                    <CollapsibleTrigger className='w-full'>
                      <ChevronRight className='ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 group-data-[collapsible=icon]:hidden' />
                    </CollapsibleTrigger> */}
                    </SidebarMenuButton>
                  </Link>
                  {/* </CollapsibleTrigger> */}

                  <CollapsibleContent>
                    <SidebarMenuSub className='my-2 ml-5 space-y-1 border-l border-slate-200 pl-3 group-data-[collapsible=icon]:hidden'>
                      {settingsSubmenu.map(
                        ({ name, tab, icon: Icon, isDanger }) => {
                          const isActive = isSettingsPage && currentTab === tab

                          return (
                            <SidebarMenuSubItem key={tab}>
                              <SidebarMenuSubButton
                                isActive={isActive}
                                onClick={() => changeSettingsTab(tab)}
                                className={`w-full rounded-lg px-3 py-4 text-xs font-semibold transition-all ${
                                  isActive
                                    ? isDanger
                                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-50'
                                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50'
                                    : isDanger
                                      ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
                                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <Icon
                                  className={`h-3.5 w-3.5 ${
                                    isActive
                                      ? isDanger
                                        ? 'text-rose-600'
                                        : 'text-emerald-600'
                                      : 'text-slate-400'
                                  }`}
                                />

                                <span>{name}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        },
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* -------------------------------------------------------------------------- */}
      {/* Footer */}
      {/* -------------------------------------------------------------------------- */}

      <SidebarFooter className='border-t border-slate-200/60 p-4'>
        <div className='flex items-center gap-2 px-1 text-xs font-medium text-slate-400'>
          <HelpCircle className='h-4 w-4 shrink-0 text-slate-300' />

          <span className='group-data-[collapsible=icon]:hidden'>
            v1.0.0 Stable
          </span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
