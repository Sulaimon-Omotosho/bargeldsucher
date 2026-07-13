// import Link from 'next/link'
// import { ArrowUpRight, Receipt } from 'lucide-react'

// interface Activity {
//   id: string
//   title: string
//   date: string | Date
//   amount: number
//   errandTitle: string
// }

// interface RecentErrandsProps {
//   recentActivities?: Activity[]
// }

// export default function RecentErrands({
//   recentActivities,
// }: RecentErrandsProps) {
//   return (
//     <div className='lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm'>
//       <div className='flex items-center justify-between border-b border-slate-100 pb-4 mb-4'>
//         <div>
//           <h3 className='text-lg font-bold text-slate-900'>
//             Recent Running Errands
//           </h3>
//           <p className='text-xs text-slate-400'>
//             Your latest logged entries and tracking cycles
//           </p>
//         </div>
//         <Link
//           href='/errands'
//           className='group text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors'
//         >
//           <span>View all</span>
//           <ArrowUpRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
//         </Link>
//       </div>

//       <div className='divide-y divide-slate-100'>
//         {recentActivities && recentActivities.length > 0 ? (
//           recentActivities.map((activity) => (
//             <div
//               key={activity.id}
//               className='flex items-center justify-between py-3.5 first:pt-0 last:pb-0'
//             >
//               <div className='flex items-center gap-3'>
//                 <div className='rounded-xl bg-slate-100 p-2.5 text-slate-600'>
//                   <Receipt className='h-4 w-4' />
//                 </div>
//                 <div>
//                   <p className='text-sm font-semibold text-slate-900'>
//                     {activity.title}
//                   </p>
//                   <p className='text-xs text-slate-400'>
//                     {new Date(activity.date).toLocaleString('en-NG', {
//                       dateStyle: 'medium',
//                       timeStyle: 'short',
//                     })}
//                   </p>
//                 </div>
//               </div>

//               <div className='text-right'>
//                 <p className='text-sm font-bold text-slate-900'>
//                   ₦{activity.amount.toLocaleString()}
//                 </p>
//                 <span className='inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700'>
//                   {activity.errandTitle}
//                 </span>
//               </div>
//             </div>
//           ))
//         ) : (
//           <p className='text-sm text-slate-400 text-center py-6'>
//             No recent transactions logged.
//           </p>
//         )}
//       </div>
//     </div>
//   )
// }
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CATEGORY_MAP } from '@/lib/categories'

interface Activity {
  id: string
  title: string
  category: string // E.g., "FOOD", "TRANSPORT"
  date: string | Date
  amount: number
  errandTitle: string
}

interface RecentErrandsProps {
  recentActivities?: Activity[]
}

export default function RecentErrands({
  recentActivities,
}: RecentErrandsProps) {
  return (
    <div className='rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm flex flex-col h-full justify-between'>
      <div>
        <div className='flex items-center justify-between border-b border-slate-100 pb-4 mb-4'>
          <div>
            <h3 className='text-lg font-bold text-slate-900'>
              Recent Ledger Tracks
            </h3>
            <p className='text-xs text-slate-400'>
              Rich categorization profiles for tracked flow
            </p>
          </div>
          <Link
            href='/errands'
            className='group text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 transition-colors'
          >
            <span>View all</span>
            <ArrowUpRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
          </Link>
        </div>

        <div className='divide-y divide-slate-100/70'>
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((activity) => {
              // Extract config details dynamically based on category
              const catDetails =
                CATEGORY_MAP[activity.category] || CATEGORY_MAP.OTHER
              const Icon = catDetails.icon

              return (
                <div
                  key={activity.id}
                  className='flex items-center justify-between py-3.5 first:pt-0 last:pb-0'
                >
                  <div className='flex items-center gap-3.5 max-w-[70%]'>
                    <div
                      className={`rounded-xl p-2.5 bg-slate-50 border border-slate-100 shrink-0 ${catDetails.color}`}
                    >
                      <Icon className='h-4 w-4' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-sm font-bold text-slate-900 truncate'>
                        {activity.title}
                      </p>
                      <div className='flex items-center flex-wrap gap-x-2 text-[11px] text-slate-400 mt-0.5'>
                        <span className='font-medium text-slate-500 bg-slate-50 px-1 rounded border border-slate-200/30'>
                          {catDetails.label}
                        </span>
                        <span>•</span>
                        <span className='truncate'>
                          Loop: {activity.errandTitle}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='text-right shrink-0'>
                    <p className='text-sm font-black text-slate-900'>
                      ₦{activity.amount.toLocaleString()}
                    </p>
                    <p className='text-[10px] text-slate-400 mt-0.5'>
                      {new Date(activity.date).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <p className='text-sm text-slate-400 text-center py-6'>
              No recent transactions logged.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
