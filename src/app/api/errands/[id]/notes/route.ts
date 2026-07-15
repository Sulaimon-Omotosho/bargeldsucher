import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'
import { NotificationType } from '../../../../../../generated/prisma/enums'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id: errandId } = await params
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Note content cannot be empty' },
        { status: 400 },
      )
    }

    return await prisma.$transaction(async (tx) => {
      const errand = await tx.errand.findUnique({
        where: { id: errandId, userId },
      })

      if (!errand) throw { status: 404, message: 'Errand not found' }

      const note = await tx.errandNote.create({
        data: {
          errandId,
          content: content.trim(),
        },
      })

      await tx.activityLog.create({
        data: {
          errandId,
          type: 'ADD_NOTE',
          title: 'Added a workspace memo',
          meta: `"${content.trim().substring(0, 45)}${content.trim().length > 45 ? '...' : ''}"`,
        },
      })

      const notificationTitle = 'Memo Added'
      const notificationMessage = `A new note was pinned to errand "${errand.title}": "${content.trim().substring(0, 35)}${content.trim().length > 35 ? '...' : ''}"`

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.SYSTEM_SECURITY,
          title: notificationTitle,
          message: notificationMessage,
          actionLabel: 'View Errand',
          actionRoute: `/errands/${errandId}`, // 👈 Updated path mapping without /dashboard
          isRead: false,
        },
      })

      await redis.publish(
        `user:${userId}:notifications`,
        JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          type: NotificationType.SYSTEM_SECURITY,
          actionRoute: `/errands/${errandId}`, // 👈 Updated path mapping without /dashboard
        }),
      )

      return NextResponse.json(note)
    })
  } catch (error) {
    console.error('Notes POST Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
