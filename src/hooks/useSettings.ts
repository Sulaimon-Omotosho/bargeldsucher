import { PreferencesFormValues } from '@/components/settings/Preferences'
import { ChangePasswordFormValues } from '@/components/settings/Security'
import { updateSettings, UpdateSettingsPayload } from '@/lib/api/settings'
import { SettingsData } from '@/types/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { signOut } from 'next-auth/react'
import { ProfileFormValues } from '@/components/settings/Profile'

interface CheckUsernameResponse {
  available: boolean
  message?: string
}

// GET Settings fetch helper
async function fetchSettings(): Promise<SettingsData> {
  const response = await fetch('/api/settings')
  if (!response.ok) {
    throw new Error('Failed to load user settings profile')
  }
  return response.json()
}

// Standalone Mutation Hook
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateSettings(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      const sectionLabels: Record<string, string> = {
        profile: 'Profile updated successfully!',
        preferences: 'Preferences saved!',
        security: 'Password updated successfully!',
      }

      toast.success(sectionLabels[variables.section] || 'Settings updated!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update settings')
    },
  })
}

// Combined Hook
export function useSettings() {
  const settingsQuery = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  const updateSettingsMutation = useUpdateSettings()

  return {
    data: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,
    refetch: settingsQuery.refetch,

    // Mutation exports
    saveSettings: updateSettingsMutation.mutate,
    saveSettingsAsync: updateSettingsMutation.mutateAsync,
    isSaving: updateSettingsMutation.isPending,
    saveError: updateSettingsMutation.error,
    isSaveSuccess: updateSettingsMutation.isSuccess,
  }
}

// Profile
export function useProfile() {
  const [isSaving, setIsSaving] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Save profile updates to backend
  const updateProfile = async (values: ProfileFormValues) => {
    try {
      setIsSaving(true)
      setError(null)

      const payload = {
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        username: values.username.trim(),
        image: values.image || null,
        phone: values.phone?.trim() || null,
        occupation: values.occupation?.trim() || null,
        bio: values.bio?.trim() || null,
        dateOfBirth: values.dateOfBirth
          ? new Date(values.dateOfBirth).toISOString()
          : null,
        address: {
          streetAddress: values.address?.streetAddress?.trim() || null,
          city: values.address?.city?.trim() || null,
          state: values.address?.state?.trim() || null,
          country: values.address?.country?.trim() || null,
          postalCode: values.address?.postalCode?.trim() || null,
        },
      }

      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update profile')
      }

      const updatedData = await res.json()
      toast.success('Profile updated successfully')
      return { success: true, data: updatedData }
    } catch (err: any) {
      const message = err.message || 'Could not save profile changes'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsSaving(false)
    }
  }

  // Trigger verification email resend
  // const triggerEmailVerification = async () => {
  //   try {
  //     setIsVerifyingEmail(true)
  //     const res = await fetch('/api/settings/profile/verify-email', {
  //       method: 'POST',
  //     })

  //     if (!res.ok) {
  //       const errorData = await res.json().catch(() => ({}))
  //       throw new Error(errorData.message || 'Failed to send verification link')
  //     }

  //     toast.success('Verification link sent to your email')
  //     return { success: true }
  //   } catch (err: any) {
  //     const message = err.message || 'Could not send verification email'
  //     toast.error(message)
  //     return { success: false, error: message }
  //   } finally {
  //     setIsVerifyingEmail(false)
  //   }
  // }

  return {
    isSaving,
    isVerifyingEmail,
    error,
    updateProfile,
    // triggerEmailVerification,
  }
}

export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export function useCheckUsername(
  rawUsername: string | undefined,
  currentUsername?: string,
) {
  const debouncedUsername = useDebounce(rawUsername?.trim() || '', 400)

  const isSelf =
    debouncedUsername.toLowerCase() === currentUsername?.trim().toLowerCase()
  const isTooShort = debouncedUsername.length < 3
  const isEnabled = Boolean(debouncedUsername) && !isSelf && !isTooShort

  const query = useQuery<CheckUsernameResponse>({
    queryKey: ['check-username', debouncedUsername],
    queryFn: async () => {
      const res = await fetch(
        `/api/settings/check-username?username=${encodeURIComponent(debouncedUsername)}`,
      )
      if (!res.ok) {
        throw new Error('Failed to check username availability')
      }
      return res.json()
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    retry: false,
  })

  return {
    isChecking: query.isFetching && isEnabled,
    isAvailable: isEnabled ? query.data?.available : null,
    isSelf,
    error: query.error,
  }
}

// Preferences
export function usePreferences() {
  const [data, setData] = useState<PreferencesFormValues | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPreferences = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const res = await fetch('/api/settings/preferences')
      if (!res.ok) throw new Error('Failed to load preferences')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      const message = err.message || 'Could not load preferences'
      setError(message)
      toast.error('Could not load preferences')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const updatePreferences = async (values: PreferencesFormValues) => {
    try {
      setIsPending(true)
      setError(null)

      const res = await fetch('/api/settings/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to save preferences')
      }

      const updated = await res.json()
      setData(updated)
      toast.success('Preferences updated successfully!')
      return { success: true, data: updated }
    } catch (err: any) {
      const message = err.message || 'Failed to save preferences'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsPending(false)
    }
  }

  return {
    data,
    isLoading,
    isPending,
    isError: !!error,
    error,
    updatePreferences,
    refetch: fetchPreferences,
  }
}

// Security
export function useSecurity() {
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSecurityStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const res = await fetch('/api/settings/security')

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to load security settings')
      }

      const json = await res.json()
      setIsEmailVerified(json.isEmailVerified ?? false)
    } catch (err: any) {
      const message = err.message || 'Could not fetch security details'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSecurityStatus()
  }, [fetchSecurityStatus])

  // Update Password Mutation
  const updatePassword = async (values: ChangePasswordFormValues) => {
    try {
      setIsChangingPassword(true)
      setError(null)

      const res = await fetch('/api/settings/security', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to update password')
      }

      toast.success('Password updated successfully!')
      return { success: true }
    } catch (err: any) {
      const message = err.message || 'Failed to update password'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Email Verification Trigger
  const triggerEmailVerification = async () => {
    try {
      setIsVerifyingEmail(true)
      setError(null)

      const res = await fetch('/api/settings/security', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.message || 'Failed to send verification email',
        )
      }

      toast.success('Verification link sent to your email!')
      return { success: true }
    } catch (err: any) {
      const message = err.message || 'Failed to trigger verification'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsVerifyingEmail(false)
    }
  }

  return {
    isEmailVerified,
    isLoading,
    isChangingPassword,
    isVerifyingEmail,
    isError: !!error,
    error,
    updatePassword,
    triggerEmailVerification,
    refetch: fetchSecurityStatus,
  }
}

// Danger Zone
export function useAccountControl() {
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const archiveAccount = async () => {
    try {
      setIsArchiving(true)
      setError(null)

      const res = await fetch('/api/settings/account/archive', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to archive account')
      }

      toast.success('Account archived. Logging out...')
      // Sign out and redirect to login/home page
      await signOut({ callbackUrl: '/login' })
      return { success: true }
    } catch (err: any) {
      const message = err.message || 'Could not archive account'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsArchiving(false)
    }
  }

  const deleteAccount = async (password: string) => {
    try {
      setIsDeleting(true)
      setError(null)

      const res = await fetch('/api/settings/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to delete account')
      }

      toast.success('Account deleted successfully.')
      await signOut({ callbackUrl: '/login' })
      return { success: true }
    } catch (err: any) {
      const message = err.message || 'Could not delete account'
      setError(message)
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    isArchiving,
    isDeleting,
    isPending: isArchiving || isDeleting,
    isError: !!error,
    error,
    archiveAccount,
    deleteAccount,
  }
}
