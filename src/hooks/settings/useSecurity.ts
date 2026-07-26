'use client'

import { ChangePasswordFormValues } from '@/components/settings/Security'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface SecurityStatusResponse {
  isEmailVerified: boolean
}

export function useSecurity() {
  const queryClient = useQueryClient()

  // Fetch Security Status
  const {
    data: securityData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SecurityStatusResponse>({
    queryKey: ['security-status'],
    queryFn: async () => {
      const res = await fetch('/api/settings/security')

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to load security settings')
      }

      return res.json()
    },
  })

  // Request Security Token Mutation
  const requestTokenMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/settings/security/token', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to send security token')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('Security token sent to your email!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to request token')
    },
  })

  // Update Password with Token Mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (values: ChangePasswordFormValues) => {
      const res = await fetch('/api/settings/security/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update password')
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('Password updated successfully!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update password')
    },
  })

  // Email Verification Trigger Mutation
  const verifyEmailMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/settings/security', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.message || 'Failed to send verification email',
        )
      }

      return res.json()
    },
    onSuccess: () => {
      toast.success('Verification link sent to your email!')
      queryClient.invalidateQueries({ queryKey: ['security-status'] })
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to trigger verification')
    },
  })

  return {
    // State
    isEmailVerified: securityData?.isEmailVerified ?? false,
    isLoading,
    isError,
    error: error instanceof Error ? error.message : null,

    // Loading states for actions
    isSendingToken: requestTokenMutation.isPending,
    isChangingPassword: updatePasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,

    // Trigger functions returning standard success boolean for the form reset
    requestPasswordToken: async () => {
      try {
        await requestTokenMutation.mutateAsync()
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    updatePasswordWithToken: async (values: ChangePasswordFormValues) => {
      try {
        await updatePasswordMutation.mutateAsync(values)
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    triggerEmailVerification: async () => {
      try {
        await verifyEmailMutation.mutateAsync()
        return { success: true }
      } catch (err: any) {
        return { success: false, error: err.message }
      }
    },

    refetch,
  }
}
