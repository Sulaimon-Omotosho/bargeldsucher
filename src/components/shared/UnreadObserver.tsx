'use client'

import { useEffect, useRef } from 'react'

interface UnreadObserverProps {
  notificationId: string
  isRead: boolean
  onVisible: (id: string) => void
  children: React.ReactNode
}

export default function UnreadObserver({
  notificationId,
  isRead,
  onVisible,
  children,
}: UnreadObserverProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isRead) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(notificationId)
          observer.disconnect()
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => observer.disconnect()
  }, [notificationId, isRead, onVisible])

  return <div ref={elementRef}>{children}</div>
}
