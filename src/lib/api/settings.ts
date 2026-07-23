import {
  ProfileSchema,
  PreferencesSchema,
  ChangePasswordSchema,
} from '@/lib/ValidationSchema'
import { z } from 'zod'

// Types derived directly from your Zod schemas
export type ProfileInput = z.infer<typeof ProfileSchema>
export type PreferencesInput = z.infer<typeof PreferencesSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>

// Discriminated union for strong section-level type safety
export type UpdateSettingsPayload =
  | { section: 'profile'; data: ProfileInput }
  | { section: 'preferences'; data: PreferencesInput }
  | { section: 'security'; data: ChangePasswordInput }

export async function updateSettings(payload: UpdateSettingsPayload) {
  const response = await fetch('/api/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const resData = await response.json()

  if (!response.ok) {
    // Pass along standard Zod validation field errors or general message
    const error = new Error(resData.message || 'Failed to update settings')
    ;(error as any).fieldErrors = resData.errors
    throw error
  }

  return resData
}
