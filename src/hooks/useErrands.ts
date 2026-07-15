import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Errand } from '@/types/types'
import { ErrandsPayload } from '@/types/dashboard'

interface UpdateErrandArgs {
  id: string
  title: string
  description: string
}

export function useUpdateErrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, title, description }: UpdateErrandArgs) => {
      const res = await fetch(`/api/errands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description }),
      })
      if (!res.ok) throw new Error('Failed to update errand parameters')
      return res.json()
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['errand', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

async function fetchErrands(): Promise<ErrandsPayload> {
  const res = await fetch('/api/errands')
  if (!res.ok) throw new Error('Failed to retrieve active errands list stream')
  return res.json()
}

async function fetchSingleErrand(id: string): Promise<Errand> {
  const res = await fetch(`/api/errands/${id}`)
  if (!res.ok)
    throw new Error('Failed to retrieve individual targeted errand metric')
  return res.json()
}

async function createErrandRequest(data: {
  title: string
  description?: string
  amountReceived: number
}): Promise<Errand> {
  const res = await fetch('/api/errands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create new advance funding log')
  return res.json()
}

export function useErrands() {
  return useQuery<ErrandsPayload>({
    queryKey: ['errands', 'dashboard'],
    queryFn: fetchErrands,
  })
}

export function useErrand(id: string) {
  return useQuery<Errand>({
    queryKey: ['errands', 'dashboard', 'errand', id],
    queryFn: () => fetchSingleErrand(id),
    enabled: !!id,
  })
}

export function useCreateErrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createErrandRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useCompleteErrand(errandId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (handlingMethod?: 'RETURNED' | 'SAVED') => {
      const res = await fetch(`/api/errands/${errandId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handlingMethod }),
      })
      if (!res.ok) throw new Error('Failed to finalize and settle errand loop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errand', errandId] })
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useArchiveErrand() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/errands/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to archive targeted errand log loop')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['Notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useErrandNotes(errandId: string) {
  const queryClient = useQueryClient()

  // Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/errands/${errandId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed to create note')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands', errandId] })
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },
  })

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/errands/${errandId}/notes/${noteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to destroy note instance')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['errands', errandId] })
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },
  })

  return {
    addNote: addNoteMutation.mutate,
    isAdding: addNoteMutation.isPending,
    deleteNote: deleteNoteMutation.mutate,
    isDeleting: deleteNoteMutation.isPending,
  }
}
