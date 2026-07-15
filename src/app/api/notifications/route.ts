import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

// GET: Fetch notification history
// export async function GET(req: NextRequest) {
//   const userId = req.nextUrl.searchParams.get('userId')
//   if (!userId)
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

//   const notifications = await prisma.notification.findMany({
//     where: { userId },
//     orderBy: { createdAt: 'desc' },
//     take: 20,
//   })

//   return NextResponse.json(notifications)
// }

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Get pagination parameters from the URL
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const cursor = searchParams.get('cursor') // This will be the ID of the last fetched item

    // 2. Query Prisma using cursor pagination
    const notifications = await prisma.notification.findMany({
      where: { userId },
      take: limit + 1, // Fetch an extra item to check if there is a next page
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0, // Skip the cursor element itself
      orderBy: { createdAt: 'desc' },
    })

    // 3. Check if there are more pages
    let nextCursor: string | null = null
    if (notifications.length > limit) {
      const nextItem = notifications.pop() // Remove the extra item
      nextCursor = nextItem?.id || null
    }

    // 4. Return the format useInfiniteQuery expects!
    return NextResponse.json({
      items: notifications,
      nextCursor,
    })
  } catch (error: any) {
    console.error('Failed to fetch notifications:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
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
