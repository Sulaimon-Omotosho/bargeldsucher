// 'use client'

// import Link from 'next/link'
// import { usePathname, useSearchParams } from 'next/navigation'
// import { User, Settings, Shield, AlertTriangle } from 'lucide-react'

// export function Sidebar() {
//   const pathname = usePathname()
//   const searchParams = useSearchParams()

//   // Identify if we're currently on the settings base route
//   const isSettingsPage = pathname.startsWith('/settings')
//   const currentTab = searchParams.get('tab') || 'profile'

//   return (
//     <aside className='w-64 border-r border-slate-200 bg-slate-50 min-h-screen p-4 flex flex-col gap-2'>
//       {/* ... Your Existing Main Sidebar Links (Dashboard, Transactions, etc.) ... */}

//       <Link
//         href='/settings?tab=profile'
//         className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
//           isSettingsPage
//             ? 'bg-slate-200 text-slate-900'
//             : 'text-slate-600 hover:bg-slate-100'
//         }`}
//       >
//         <Settings className='h-4 w-4' />
//         <span>Settings</span>
//       </Link>

//       {/* ⬇️ NESTED SETTINGS SUB-MENU (Renders conditionally) */}
//       {isSettingsPage && (
//         <div className='ml-4 pl-3 border-l border-slate-200 flex flex-col gap-1 mt-1 animate-in slide-in-from-top-2 duration-200'>
//           <Link
//             href='/settings?tab=profile'
//             className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
//               currentTab === 'profile'
//                 ? 'bg-emerald-50 text-emerald-700'
//                 : 'text-slate-500 hover:bg-slate-100'
//             }`}
//           >
//             <User className='h-3.5 w-3.5' /> Profile Settings
//           </Link>

//           <Link
//             href='/settings?tab=preferences'
//             className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
//               currentTab === 'preferences'
//                 ? 'bg-emerald-50 text-emerald-700'
//                 : 'text-slate-500 hover:bg-slate-100'
//             }`}
//           >
//             <Settings className='h-3.5 w-3.5' /> Preferences
//           </Link>

//           <Link
//             href='/settings?tab=security'
//             className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
//               currentTab === 'security'
//                 ? 'bg-emerald-50 text-emerald-700'
//                 : 'text-slate-500 hover:bg-slate-100'
//             }`}
//           >
//             <Shield className='h-3.5 w-3.5' /> Security
//           </Link>

//           <Link
//             href='/settings?tab=danger'
//             className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
//               currentTab === 'danger'
//                 ? 'bg-rose-50 text-rose-700'
//                 : 'text-slate-500 hover:bg-rose-50/40 hover:text-rose-600'
//             }`}
//           >
//             <AlertTriangle className='h-3.5 w-3.5' /> Danger Zone
//           </Link>
//         </div>
//       )}
//     </aside>
//   )
// }

import React from 'react'

const Sidebar = () => {
  return <div>Sidebar</div>
}

export default Sidebar
