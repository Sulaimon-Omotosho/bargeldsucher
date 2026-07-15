'use client'

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'

// 1. Robust Live SSE Listener with Auto-Reconnect
export function useNotifications(userId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!userId) return

    let eventSource: EventSource | null = null
    let reconnectTimeout: NodeJS.Timeout

    const connect = () => {
      eventSource = new EventSource(
        `/api/notifications/stream?userId=${userId}`,
      )

      eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)

          toast(notification.title, {
            description: notification.message,
            duration: 5000,
          })

          queryClient.invalidateQueries({ queryKey: ['notifications'] })
          queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        } catch (error) {
          console.error('Failed parsing notification event stream:', error)
        }
      }

      eventSource.onerror = () => {
        console.warn('SSE disconnected. Reconnecting in 3 seconds...')
        eventSource?.close()
        // Auto-reconnect safety net
        reconnectTimeout = setTimeout(connect, 3000)
      }
    }

    connect()

    return () => {
      if (eventSource) eventSource.close()
      clearTimeout(reconnectTimeout)
    }
  }, [userId, queryClient])
}

// 2. Paginated Client System using useInfiniteQuery
export function useNotificationSystem(userId: string) {
  const queryClient = useQueryClient()

  // Fetch infinite history with 10 items per page
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ['notifications', userId],
      queryFn: async ({ pageParam = '' }) => {
        // Pass the cursor/lastId to your API
        const res = await fetch(
          `/api/notifications?userId=${userId}&limit=10&cursor=${pageParam}`,
        )
        if (!res.ok) throw new Error('Failed to fetch history')
        return res.json() // Expected response schema: { items: [], nextCursor: string | null }
      },
      initialPageParam: '',
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: !!userId,
    })

  // Flatten the infinite pages structure into a flat array of notifications
  const notifications = useMemo(() => {
    // return data?.pages.flatMap((page) => page.items) ?? []
    return (
      data?.pages.flatMap((page) => page?.items || []).filter(Boolean) ?? []
    )
  }, [data])

  // Mutation to mark a single notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  // Mutation to mark all notifications as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  return {
    notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  }
}

// Grouped Notifications
export function useGroupedNotifications(notifications: any[]) {
  return useMemo(() => {
    const today: any[] = []
    const yesterday: any[] = []
    const earlier: any[] = []

    const now = new Date()
    const todayStr = now.toDateString()

    const tempYesterday = new Date()
    tempYesterday.setDate(now.getDate() - 1)
    const yesterdayStr = tempYesterday.toDateString()

    notifications.forEach((notif) => {
      if (!notif) return
      const notifDate = new Date(notif.createdAt)
      const notifDateStr = notifDate.toDateString()

      if (notifDateStr === todayStr) {
        today.push(notif)
      } else if (notifDateStr === yesterdayStr) {
        yesterday.push(notif)
      } else {
        earlier.push(notif)
      }
    })

    return { today, yesterday, earlier }
  }, [notifications])
}
