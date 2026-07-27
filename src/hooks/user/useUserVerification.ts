import { useState, useCallback } from 'react'

export type UserStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'self'

interface UserMap {
  [index: number]: {
    status: UserStatus
    userId?: string
    error?: string
  }
}

export function useUserVerification() {
  const [userStatuses, setUserStatuses] = useState<UserMap>({})

  const verifyUser = useCallback(async (index: number, query: string) => {
    const trimmed = query.trim()

    if (!trimmed) {
      setUserStatuses((prev) => {
        const copy = { ...prev }
        delete copy[index]
        return copy
      })
      return null
    }

    // Set status to checking
    setUserStatuses((prev) => ({
      ...prev,
      [index]: { status: 'checking' },
    }))

    try {
      const res = await fetch(
        `/api/users/search?query=${encodeURIComponent(trimmed)}`,
      )
      const data = await res.json()

      if (res.ok && data.found) {
        setUserStatuses((prev) => ({
          ...prev,
          [index]: { status: 'valid', userId: data.user.id },
        }))
        return data.user.id as string
      } else {
        const statusType: UserStatus = data.isSelf ? 'self' : 'invalid'
        setUserStatuses((prev) => ({
          ...prev,
          [index]: {
            status: statusType,
            error: data.message || 'User not found',
          },
        }))
        return null
      }
    } catch {
      setUserStatuses((prev) => ({
        ...prev,
        [index]: { status: 'invalid', error: 'Verification failed' },
      }))
      return null
    }
  }, [])

  const removeStatus = useCallback((index: number) => {
    setUserStatuses((prev) => {
      const copy = { ...prev }
      delete copy[index]
      return copy
    })
  }, [])

  return { userStatuses, verifyUser, removeStatus }
}
