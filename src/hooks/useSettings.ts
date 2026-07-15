import { SettingsData } from '@/types/types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// GET Settings fetch helper
async function fetchSettings(): Promise<SettingsData> {
  const response = await fetch('/api/settings')
  if (!response.ok) {
    throw new Error('Failed to load user settings profile')
  }
  return response.json()
}

// PATCH Profile settings fetch helper
async function updateSettings(payload: { name?: string; email?: string }) {
  const response = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new Error('Failed to update profile settings')
  }
  return response.json()
}

export function useSettings() {
  const queryClient = useQueryClient()

  // 1. Fetch User Settings Hook
  const settingsQuery = useQuery<SettingsData>({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  })

  // 2. Save Settings Mutation Hook
  const saveSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      // Invalidate query to trigger visual refresh across the UI
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })

  return {
    data: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    error: settingsQuery.error,

    // Mutations
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending,
    saveError: saveSettingsMutation.error,
  }
}
