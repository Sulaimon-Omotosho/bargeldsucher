'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Settings,
  HelpCircle,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Errands', href: '/errands', icon: Wallet },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface SidebarProps {
  isMobile?: boolean
}

export default function Sidebar({ isMobile = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={`${
        isMobile
          ? 'flex h-full w-full'
          : 'hidden md:flex h-screen sticky top-0 w-64 border-r border-slate-200/60'
      } flex-col bg-slate-50/50 backdrop-blur-md px-4 py-6 select-none`}
    >
      {/* Brand Profile Block */}
      <div className='flex items-center gap-3 px-2 mb-8'>
        <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center font-bold text-white shadow-sm shadow-emerald-200/80 ring-1 ring-emerald-600/10'>
          B
        </div>
        <div className='flex flex-col'>
          <span className='font-bold text-sm tracking-tight text-slate-900 leading-none mb-0.5'>
            bargeldsucher
          </span>
          <span className='text-[10px] text-slate-400 font-medium tracking-wider uppercase leading-none'>
            Cash Engine
          </span>
        </div>
      </div>

      {/* Main Dynamic Nav Menu */}
      <nav className='flex-1 space-y-1.5'>
        {navigation.map((item) => {
          // Using startsWith to ensure subroutes stay highlighted cleanly
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 ${
                isActive
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-100 border border-slate-200/40'
                  : 'text-slate-500 hover:bg-white/60 hover:text-slate-900 border border-transparent'
              }`}
            >
              {/* Subtle visual accent marker bar */}
              {isActive && (
                <div className='absolute left-0 top-3 bottom-3 w-1 rounded-r-md bg-emerald-600 animate-in fade-in zoom-in-75 duration-300' />
              )}

              <Icon
                className={`h-4.5 w-4.5 transition-colors duration-200 ${
                  isActive
                    ? 'text-emerald-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* System Status Footer Indicator */}
      <div className='mt-auto border-t border-slate-200/50 pt-4 px-2'>
        <div className='flex items-center gap-2 text-xs font-medium text-slate-400'>
          <HelpCircle className='h-4 w-4 text-slate-300' />
          <span>v1.0.0 Stable</span>
        </div>
      </div>
    </aside>
  )
}
