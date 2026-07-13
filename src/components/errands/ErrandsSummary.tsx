// 'use client'

// import { Wallet, ClipboardList } from 'lucide-react'

// interface ErrandsSummaryProps {
//   totalAllocated: number
//   totalErrandsCount: number
// }

// export default function ErrandsSummary({
//   totalAllocated,
//   totalErrandsCount,
// }: ErrandsSummaryProps) {
//   return (
//     <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
//       {/* Disbursed Card */}
//       <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
//         <div className='flex items-center justify-between text-slate-400'>
//           <span className='text-xs font-semibold uppercase tracking-wider'>
//             Total Cash Disbursed
//           </span>
//           <Wallet className='h-5 w-5 text-emerald-600' />
//         </div>
//         <h3 className='mt-2 text-2xl font-black text-slate-900'>
//           ₦{totalAllocated.toLocaleString()}
//         </h3>
//       </div>

//       {/* Active Loops Card */}
//       <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
//         <div className='flex items-center justify-between text-slate-400'>
//           <span className='text-xs font-semibold uppercase tracking-wider'>
//             Active Errand Loops
//           </span>
//           <ClipboardList className='h-5 w-5 text-blue-600' />
//         </div>
//         <h3 className='mt-2 text-2xl font-black text-slate-900'>
//           {totalErrandsCount} {totalErrandsCount === 1 ? 'Log' : 'Logs'}
//         </h3>
//       </div>

//       {/* Spent Card */}
//       <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
//         <div className='flex items-center justify-between text-slate-400'>
//           <span className='text-xs font-semibold uppercase tracking-wider'>
//             Total Cash Spent
//           </span>
//           <Wallet className='h-5 w-5 text-emerald-600' />
//         </div>
//         <h3 className='mt-2 text-2xl font-black text-slate-900'>
//           ₦{totalAllocated.toLocaleString()}
//         </h3>
//       </div>
//     </div>
//   )
// }
'use client'

import { Wallet, ClipboardList, TrendingUp } from 'lucide-react'

interface ErrandsSummaryProps {
  totalAllocated: number
  totalSpent: number
  totalErrandsCount: number
}

export default function ErrandsSummary({
  totalAllocated,
  totalSpent,
  totalErrandsCount,
}: ErrandsSummaryProps) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
      {/* Disbursed Card */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between text-slate-400'>
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Total Cash Disbursed
          </span>
          <Wallet className='h-5 w-5 text-emerald-600' />
        </div>
        <h3 className='mt-2 text-2xl font-black text-slate-900'>
          ₦{totalAllocated.toLocaleString()}
        </h3>
      </div>

      {/* Spent Card */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm'>
        <div className='flex items-center justify-between text-slate-400'>
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Total Cash Spent
          </span>
          <TrendingUp className='h-5 w-5 text-rose-500' />
        </div>
        <h3 className='mt-2 text-2xl font-black text-rose-500'>
          ₦{totalSpent.toLocaleString()}
        </h3>
      </div>

      {/* Active Loops Card */}
      <div className='rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1'>
        <div className='flex items-center justify-between text-slate-400'>
          <span className='text-xs font-semibold uppercase tracking-wider'>
            Active Errand Loops
          </span>
          <ClipboardList className='h-5 w-5 text-blue-600' />
        </div>
        <h3 className='mt-2 text-2xl font-black text-slate-900'>
          {totalErrandsCount} {totalErrandsCount === 1 ? 'Log' : 'Logs'}
        </h3>
      </div>
    </div>
  )
}
