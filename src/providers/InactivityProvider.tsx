'use client'

import { useEffect } from 'react'
import { signOut, useSession } from 'next-auth/react'

const INACTIVITY_TIMEOUT = 60 * 60 * 1000

export function InactivityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { status } = useSession()

  useEffect(() => {
    if (status !== 'authenticated') return

    let timer: NodeJS.Timeout

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        signOut({ callbackUrl: '/login?reason=inactivity' })
      }, INACTIVITY_TIMEOUT)
    }

    const events = ['mousemove', 'keydown', 'scroll', 'click']

    events.forEach((event) => window.addEventListener(event, resetTimer))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach((event) => window.removeEventListener(event, resetTimer))
    }
  }, [status])

  return <>{children}</>
}
