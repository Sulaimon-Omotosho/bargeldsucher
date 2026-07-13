// 'use client'

// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Edit3, Trash2, CheckCircle2, Loader2 } from 'lucide-react'
// import { Errand } from '@/types/types'

// // Import custom hook structures safely
// import {
//   useUpdateErrand,
//   useArchiveErrand,
//   useCompleteErrand,
// } from '@/hooks/useErrands'

// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from '@/components/ui/alert-dialog'
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'

// interface ErrandHeaderActionsProps {
//   errand: Errand
// }

// export default function ErrandHeaderActions({
//   errand,
// }: ErrandHeaderActionsProps) {
//   const router = useRouter()
//   const updateMutation = useUpdateErrand()
//   const archiveMutation = useArchiveErrand()
//   const completeMutation = useCompleteErrand(errand.id)
//   const [isOpen, setIsOpen] = useState(false)

//   const [editOpen, setEditOpen] = useState(false)
//   const [title, setTitle] = useState(errand.title)
//   const [description, setDescription] = useState(errand.description || '')

//   const handleEditSubmit = (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!title.trim()) return

//     updateMutation.mutate(
//       { id: errand.id, title: title.trim(), description: description.trim() },
//       { onSuccess: () => setEditOpen(false) },
//     )
//   }

//   const handleArchiveExecute = () => {
//     archiveMutation.mutate(errand.id, {
//       onSuccess: () => router.push('/errands'),
//     })
//   }

//   return (
//     <div className='flex items-center gap-2'>
//       {/* 1. EDIT DIALOG CONTAINER */}
//       <Dialog open={editOpen} onOpenChange={setEditOpen}>
//         <DialogTrigger className='inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl transition outline-none focus:ring-2 focus:ring-slate-950/10'>
//           <Edit3 className='h-3.5 w-3.5 text-slate-400' />
//           <span>Edit</span>
//         </DialogTrigger>
//         <DialogContent className='sm:max-w-[425px] bg-white rounded-2xl p-6'>
//           <form onSubmit={handleEditSubmit} className='space-y-4'>
//             <DialogHeader>
//               <DialogTitle className='text-base font-black text-slate-900'>
//                 Edit Errand Details
//               </DialogTitle>
//               <DialogDescription className='text-xs text-slate-400'>
//                 Modify parameters for this running project instance wrapper.
//               </DialogDescription>
//             </DialogHeader>

//             <div className='space-y-3.5 py-2'>
//               <div className='space-y-1'>
//                 <label className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
//                   Errand Title
//                 </label>
//                 <input
//                   type='text'
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   className='w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900 transition'
//                   required
//                 />
//               </div>
//               <div className='space-y-1'>
//                 <label className='text-[10px] font-bold text-slate-400 uppercase tracking-wider'>
//                   Description
//                 </label>
//                 <textarea
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   className='w-full h-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-slate-900 transition resize-none'
//                 />
//               </div>
//             </div>

//             <DialogFooter className='gap-2 sm:gap-0'>
//               <button
//                 type='button'
//                 onClick={() => setEditOpen(false)}
//                 className='bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition'
//               >
//                 Cancel
//               </button>
//               <button
//                 type='submit'
//                 disabled={updateMutation.isPending}
//                 className='bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition disabled:opacity-50'
//               >
//                 {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
//               </button>
//             </DialogFooter>
//           </form>
//         </DialogContent>
//       </Dialog>

//       {/* 2. ARCHIVE ALERT DIALOG */}
//       <AlertDialog>
//         <AlertDialogTrigger
//           disabled={archiveMutation.isPending}
//           className='inline-flex items-center gap-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold px-3 py-2 rounded-xl transition disabled:opacity-40 outline-none'
//         >
//           <Trash2 className='h-3.5 w-3.5' />
//           <span>Delete</span>
//         </AlertDialogTrigger>
//         <AlertDialogContent className='bg-white rounded-2xl p-6 border border-slate-100 max-w-md'>
//           <AlertDialogHeader>
//             <AlertDialogTitle className='text-base font-black text-slate-900'>
//               Move Errand to Archives?
//             </AlertDialogTitle>
//             <AlertDialogDescription className='text-xs text-slate-500 leading-relaxed'>
//               Are you sure? This action hides this run from your active
//               workspace ledger loops. Its transaction histories will be saved
//               safely inside historical archives.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className='mt-2'>
//             <AlertDialogCancel className='bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition mt-0'>
//               Cancel
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleArchiveExecute}
//               className='bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-rose-700 transition'
//             >
//               {archiveMutation.isPending ? 'Archiving...' : 'Archive Project'}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>

//       {/* 3. SETTLEMENT COMPLETION FLOW */}
//       <AlertDialog>
//         <AlertDialogTrigger
//           disabled={completeMutation.isPending}
//           className='inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-40 outline-none'
//         >
//           {completeMutation.isPending ? (
//             <>
//               <Loader2 className='h-3.5 w-3.5 animate-spin text-slate-400' />
//               <span>Closing Loop...</span>
//             </>
//           ) : (
//             <>
//               <CheckCircle2 className='h-3.5 w-3.5 text-emerald-400' />
//               <span>Finish Errand</span>
//             </>
//           )}
//         </AlertDialogTrigger>
//         <AlertDialogContent className='bg-white rounded-2xl p-6 border border-slate-100 max-w-md'>
//           <AlertDialogHeader>
//             <AlertDialogTitle className='text-base font-black text-slate-900'>
//               Finalize Project Loop?
//             </AlertDialogTitle>
//             <AlertDialogDescription className='text-xs text-slate-500 leading-relaxed'>
//               Confirming this choice locks the ledger permanently. Remaining
//               surplus budget figures will be written off and factored safely
//               back into your core company capital balances.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter className='mt-2'>
//             <AlertDialogCancel className='bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition mt-0'>
//               Keep Active
//             </AlertDialogCancel>
//             <AlertDialogAction
//               onClick={() => completeMutation.mutate()}
//               className='bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition'
//             >
//               Settle and Close
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </div>
//   )
// }

'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, RefreshCw, Archive } from 'lucide-react'
import { useCompleteErrand } from '@/hooks/useErrands'
import { Errand } from '@/types/types'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Props {
  errand: Errand
}

export default function ErrandHeaderActions({ errand }: Props) {
  const completeMutation = useCompleteErrand(errand.id)
  const [isOpen, setIsOpen] = useState(false)

  // Calculate variances here to adapt UI choices on the fly
  const allocated = Number(errand.amountReceived)
  const totalSpent =
    errand.expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0
  const remainingCash = allocated - totalSpent
  const hasSurplus = remainingCash > 0

  const handleSettleExecute = (method?: 'RETURNED' | 'SAVED') => {
    completeMutation.mutate(method, {
      onSuccess: () => setIsOpen(false),
    })
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger className='inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm outline-none'>
        <CheckCircle2 className='h-3.5 w-3.5 text-emerald-400' />
        <span>Finish Errand</span>
      </AlertDialogTrigger>

      <AlertDialogContent className='bg-white rounded-2xl p-6 border border-slate-100 max-w-md outline-none'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-base font-black text-slate-900'>
            Finalize Errand Lifecycle
          </AlertDialogTitle>
          <AlertDialogDescription className='text-xs text-slate-500 leading-relaxed'>
            {hasSurplus
              ? `You have a leftover surplus of ₦${remainingCash.toLocaleString()}. Please indicate how this remaining cash was accounted for below:`
              : 'Confirming this action locks the ledger records. Deficits or balances will be indexed into historical audits.'}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Dynamic Context Action Grid Options Choice Block */}
        {hasSurplus && !completeMutation.isPending && (
          <div className='grid grid-cols-2 gap-3 my-4'>
            <button
              onClick={() => handleSettleExecute('RETURNED')}
              className='flex flex-col items-center gap-2 p-4 text-center rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 transition group outline-none'
            >
              <RefreshCw className='h-5 w-5 text-amber-500 group-hover:scale-110 transition' />
              <span className='text-xs font-bold text-slate-800 block'>
                Returned Money
              </span>
              <span className='text-[10px] text-slate-400 block leading-tight'>
                Deducts money from budget to match spent totals.
              </span>
            </button>

            <button
              onClick={() => handleSettleExecute('SAVED')}
              className='flex flex-col items-center gap-2 p-4 text-center rounded-xl border border-slate-200 hover:border-slate-900 bg-white hover:bg-slate-50 transition group outline-none'
            >
              <Archive className='h-5 w-5 text-emerald-500 group-hover:scale-110 transition' />
              <span className='text-xs font-bold text-slate-800 block'>
                Saving Money
              </span>
              <span className='text-[10px] text-slate-400 block leading-tight'>
                Keeps budget allocations intact for records.
              </span>
            </button>
          </div>
        )}

        <AlertDialogFooter className='mt-2'>
          <AlertDialogCancel
            disabled={completeMutation.isPending}
            className='bg-white border border-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition mt-0 outline-none'
          >
            Cancel
          </AlertDialogCancel>

          {/* If there's no surplus, just show the standard finish submit button button directly */}
          {(!hasSurplus || completeMutation.isPending) && (
            <button
              disabled={completeMutation.isPending}
              onClick={() => handleSettleExecute()}
              className='inline-flex items-center justify-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800 transition min-w-[100px]'
            >
              {completeMutation.isPending ? (
                <>
                  <Loader2 className='h-3 w-3 animate-spin text-slate-400' />
                  <span>Settling...</span>
                </>
              ) : (
                <span>Confirm Settlement</span>
              )}
            </button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
