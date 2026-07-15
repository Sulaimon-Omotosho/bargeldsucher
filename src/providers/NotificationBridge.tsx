'use client'

import { useNotifications } from '@/hooks/useNotifications'

interface NotificationBridgeProps {
  userId: string
}

export default function NotificationBridge({
  userId,
}: NotificationBridgeProps) {
  useNotifications(userId)

  return null
}
