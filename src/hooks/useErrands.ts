'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import type { Errand } from '@/types/types'
import { ErrandMember, ErrandsPayload } from '@/types/dashboard'

// Types
export interface UpdateErrandArgs {
  title: string
  description?: string
  members?: ErrandMember[]
}

export interface ErrandMemberInput {
  userId: string
  role: 'OWNER' | 'COLLABORATOR' | 'VIEWER' | string
  allocatedBudget?: string | number | null
}

export interface CreateErrandPayload {
  title: string
  description?: string
  amountReceived: number
  members?: ErrandMemberInput[]
}

export type UserRole = 'OWNER' | 'COLLABORATOR' | 'VIEWER'

// 1. Global / List Errand Hooks

export function useErrandsList() {
  const queryClient = useQueryClient()

  // Fetch all errands
  const {
    data: errandsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<ErrandsPayload>({
    queryKey: ['errands'],
    queryFn: async () => {
      const res = await fetch('/api/errands')
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.message || 'Failed to retrieve active errands',
        )
      }
      return res.json()
    },
  })

  // Create Errand Mutation
  const createErrandMutation = useMutation({
    mutationFn: async (payload: CreateErrandPayload) => {
      const res = await fetch('/api/errands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok)
        throw new Error(
          data?.message || data?.error || 'Failed to create errand',
        )
      return data
    },
    onSuccess: () => {
      toast.success('Errand created successfully!')
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create errand')
    },
  })

  // Archive Errand Mutation
  const archiveErrandMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/errands/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to archive errand')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Errand archived')
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to archive errand')
    },
  })

  return {
    errands: errandsData,
    isLoading,
    isError,
    error: error instanceof Error ? error.message : null,

    // Mutation states
    isCreating: createErrandMutation.isPending,
    isArchiving: archiveErrandMutation.isPending,

    // Triggers returning standard { success, data/error }
    createErrand: async (payload: CreateErrandPayload) => {
      try {
        const data = await createErrandMutation.mutateAsync(payload)
        return { success: true, data }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    archiveErrand: async (id: string) => {
      try {
        await archiveErrandMutation.mutateAsync(id)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    refetch,
  }
}

// 2. Single Errand Specific Hook (Detail & Modifiers)

export function useErrand(id: string) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  // Fetch Single Errand
  const {
    data: errand,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Errand>({
    queryKey: ['errand', id],
    queryFn: async () => {
      const res = await fetch(`/api/errands/${id}`)
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to fetch errand details')
      }
      return res.json()
    },
    enabled: !!id,
  })

  const errandMembers = errand?.members || []

  // Direct check if current user is creator/owner of the errand
  const isOwner = Boolean(
    currentUserId &&
    ((errand as any)?.userId === currentUserId ||
      (errand as any)?.createdById === currentUserId),
  )

  // Match current user in the errand's members array
  const currentMember = errandMembers.find(
    (member) => member.userId === currentUserId,
  )

  // Derive explicit user role safely
  let userRole: UserRole = 'VIEWER'

  if (isOwner) {
    userRole = 'OWNER'
  } else if (currentMember?.role === 'OWNER') {
    userRole = 'OWNER'
  } else if (
    currentMember?.role === 'COLLABORATOR' ||
    currentMember?.role === 'ADMIN'
  ) {
    userRole = 'COLLABORATOR'
  } else if (currentMember?.role === 'VIEWER') {
    userRole = 'VIEWER'
  }

  // Derive explicit boolean flags based on verified userRole
  const derivedIsOwner = userRole === 'OWNER'
  const derivedIsCollaborator = userRole === 'COLLABORATOR'
  const derivedIsViewer = userRole === 'VIEWER' && !derivedIsOwner

  // Update Errand Mutation
  const updateErrandMutation = useMutation({
    mutationFn: async (payload: UpdateErrandArgs) => {
      const res = await fetch(`/api/errands/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update errand')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Errand updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['errand', id] })
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update errand')
    },
  })

  // Complete Errand Mutation
  const completeErrandMutation = useMutation({
    mutationFn: async (handlingMethod?: 'RETURNED' | 'SAVED') => {
      const res = await fetch(`/api/errands/${id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handlingMethod }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to complete errand')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Errand finalized successfully!')
      queryClient.invalidateQueries({ queryKey: ['errand', id] })
      queryClient.invalidateQueries({ queryKey: ['errands'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to complete errand')
    },
  })

  // Add Note Mutation
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/errands/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to add note')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Note added!')
      queryClient.invalidateQueries({ queryKey: ['errand', id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add note')
    },
  })

  // Delete Note Mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const res = await fetch(`/api/errands/${id}/notes/${noteId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete note')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('Note deleted')
      queryClient.invalidateQueries({ queryKey: ['errand', id] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete note')
    },
  })

  return {
    // Data & Derived Role State
    errand,
    members: errandMembers,
    userRole,
    isOwner: derivedIsOwner,
    isCollaborator: derivedIsCollaborator,
    isViewer: derivedIsViewer,

    // Main States
    isLoading,
    isError,
    error: error instanceof Error ? error.message : null,

    // Loading states for actions
    isUpdating: updateErrandMutation.isPending,
    isCompleting: completeErrandMutation.isPending,
    isAddingNote: addNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,

    // Async trigger actions returning boolean results
    updateErrand: async (payload: UpdateErrandArgs) => {
      try {
        await updateErrandMutation.mutateAsync(payload)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    completeErrand: async (handlingMethod?: 'RETURNED' | 'SAVED') => {
      try {
        await completeErrandMutation.mutateAsync(handlingMethod)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    addNote: async (content: string) => {
      try {
        await addNoteMutation.mutateAsync(content)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    deleteNote: async (noteId: string) => {
      try {
        await deleteNoteMutation.mutateAsync(noteId)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    refetch,
  }
}
