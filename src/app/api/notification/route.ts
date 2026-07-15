import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch notification history
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(notifications)
}

// PATCH: Mark a notification (or all) as read
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { notificationId, userId } = body

  if (notificationId) {
    // Mark single notification as read
    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date() },
    })
    return NextResponse.json({ success: true, updated })
  }

  if (userId) {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
}
