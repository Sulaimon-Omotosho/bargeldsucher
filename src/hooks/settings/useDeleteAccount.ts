import { useState } from 'react'
import { signOut } from 'next-auth/react'

export function useDeleteAccount() {
  const [tokenSent, setTokenSent] = useState(false)
  const [isSendingToken, setIsSendingToken] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // Step 1: Request Email Token
  const requestToken = async () => {
    setIsSendingToken(true)
    setServerError(null)

    try {
      const res = await fetch('/api/account/delete/token', {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send security code.')
      }

      setTokenSent(true)
    } catch (err: any) {
      setServerError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSendingToken(false)
    }
  }

  // Step 2: Delete Account with Token
  const deleteAccount = async (token: string) => {
    setIsDeleting(true)
    setServerError(null)

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete account.')
      }

      // Log out completely and redirect to login page
      await signOut({ callbackUrl: '/login' })
    } catch (err: any) {
      setServerError(err.message || 'An error occurred during deletion.')
      setIsDeleting(false)
    }
  }

  return {
    tokenSent,
    isSendingToken,
    isDeleting,
    serverError,
    requestToken,
    deleteAccount,
  }
}
