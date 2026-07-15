'use client'

import { useState } from 'react'
import { FileText, Plus, Trash2, Loader2 } from 'lucide-react'
import { useErrand, useErrandNotes } from '@/hooks/useErrands'
import { Errand } from '@/types/types'

interface ErrandNotesProps {
  errandId: string
}

export default function ErrandNotes({ errandId }: ErrandNotesProps) {
  const [newNote, setNewNote] = useState('')
  const { data: errand, isLoading } = useErrand(errandId)
  const { addNote, isAdding, deleteNote } = useErrandNotes(errandId)

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newNote.trim() || isAdding) return

    addNote(newNote.trim(), {
      onSuccess: () => setNewNote(''),
    })
  }

  if (isLoading) {
    return (
      <div className='bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3 animate-pulse'>
        <div className='h-4 bg-slate-200 rounded w-1/4' />
        <div className='h-8 bg-slate-100 rounded-xl' />
      </div>
    )
  }

  // Fallback to empty array if no notes are populated yet
  const notes = (errand as Errand)?.notes || []

  return (
    <div className='bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4'>
      <div>
        <h3 className='text-base font-bold text-slate-900 flex items-center gap-2'>
          <FileText className='h-4 w-4 text-slate-400' /> Workspace Notes
        </h3>
        <p className='text-xs text-slate-400 mt-0.5'>
          Contextual memos and reminders for this specific run.
        </p>
      </div>

      <form onSubmit={handleAddNote} className='flex gap-2'>
        <input
          type='text'
          placeholder={
            isAdding ? 'Recording memo...' : 'Add operational note...'
          }
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          disabled={isAdding}
          className='flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-slate-900 disabled:opacity-60'
        />
        <button
          type='submit'
          disabled={isAdding || !newNote.trim()}
          className='bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition disabled:bg-slate-300'
        >
          {isAdding ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : (
            <Plus className='h-3.5 w-3.5' />
          )}
        </button>
      </form>

      <div className='space-y-2 max-h-[180px] pr-1 overflow-y-auto no-scrollbar'>
        {notes.length === 0 ? (
          <p className='text-[11px] text-slate-400 text-center py-4 italic font-medium'>
            No notes or operational warnings recorded for this errand run loop.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className='flex items-start justify-between gap-2 p-2.5 bg-slate-50/60 rounded-xl border border-slate-100 group'
            >
              <p className='text-xs text-slate-600 font-medium leading-relaxed break-words max-w-[90%]'>
                {note.content}
              </p>
              <button
                onClick={() => deleteNote(note.id)}
                className='text-slate-400 hover:text-rose-600 transition opacity-0 group-hover:opacity-100 shrink-0 mt-0.5'
              >
                <Trash2 className='h-3 w-3' />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
