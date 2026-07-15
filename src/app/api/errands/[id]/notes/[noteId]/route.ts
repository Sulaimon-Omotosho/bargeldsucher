import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'
import { NotificationType } from '../../../../../../../generated/prisma/enums'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id: errandId, noteId } = await params

    return await prisma.$transaction(async (tx) => {
      const errand = await tx.errand.findUnique({
        where: { id: errandId, userId },
      })

      if (!errand) throw { status: 404, message: 'Errand not found' }

      const targetNote = await tx.errandNote.findUnique({
        where: { id: noteId },
      })

      if (!targetNote) {
        return NextResponse.json(
          { error: 'Note element not found' },
          { status: 404 },
        )
      }

      await tx.errandNote.delete({
        where: { id: noteId },
      })

      await tx.activityLog.create({
        data: {
          errandId,
          type: 'DELETE_NOTE',
          title: 'Removed a workspace memo',
          meta: `Archived line: "${targetNote.content.substring(0, 35)}..."`,
        },
      })

      const notificationTitle = 'Memo Removed 🗑️'
      const notificationMessage = `A note was deleted from errand "${errand.title}": "${targetNote.content.substring(0, 30)}${targetNote.content.length > 30 ? '...' : ''}"`

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.SYSTEM_SECURITY,
          title: notificationTitle,
          message: notificationMessage,
          actionLabel: 'View Errand',
          actionRoute: `/errands/${errandId}`,
          isRead: false,
        },
      })

      await redis.publish(
        `user:${userId}:notifications`,
        JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          type: NotificationType.SYSTEM_SECURITY,
          actionRoute: `/errands/${errandId}`,
        }),
      )

      return NextResponse.json({ success: true })
    })
  } catch (error) {
    console.error('Notes DELETE Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
