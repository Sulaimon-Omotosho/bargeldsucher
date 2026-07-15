import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'
import { NotificationType } from '../../../../../generated/prisma/enums'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const errand = await prisma.errand.findUnique({
      where: { id: id, userId: session.user.id },
      include: {
        expenses: true,
        activities: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!errand) {
      return NextResponse.json(
        { error: 'Errand target log entry not found' },
        { status: 404 },
      )
    }

    const serializedErrand = {
      ...errand,
      amountReceived: Number(errand.amountReceived),
      status: errand.status || 'ACTIVE',
      expenses: errand.expenses.map((exp) => ({
        ...exp,
        amount: Number(exp.amount),
      })),
      activities: errand.activities,
    }

    return NextResponse.json(serializedErrand)
  } catch (error) {
    console.error('Errand Single GET Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params
    const body = await req.json()
    const { title, description } = body

    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is a required parameter' },
        { status: 400 },
      )
    }

    const updatedErrand = await prisma.$transaction(async (tx) => {
      const oldErrand = await tx.errand.findUnique({
        where: { id, userId: userId },
      })

      if (!oldErrand)
        throw {
          status: 404,
          message: 'Errand not found',
        }

      const updated = await tx.errand.update({
        where: {
          id,
          userId: userId,
        },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
        },
      })

      const titleChanged = oldErrand?.title !== title.trim()
      await tx.activityLog.create({
        data: {
          errandId: id,
          type: 'SYSTEM',
          title: titleChanged
            ? `Renamed errand to "${title.trim()}"`
            : 'Updated errand core description details',
          meta: titleChanged
            ? `Previous: "${oldErrand.title}"`
            : 'Metadata configuration updated via management panel.',
        },
      })

      const notificationTitle = 'Errand Updated '
      const notificationMessage = titleChanged
        ? `Errand "${oldErrand.title}" was renamed to "${title.trim()}".`
        : `Details updated for errand "${title.trim()}".`

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.ERRAND_STATUS,
          title: notificationTitle,
          message: notificationMessage,
          actionLabel: 'View Errand',
          actionRoute: `/errands/${id}`,
          isRead: false,
        },
      })

      await redis.publish(
        `user:${userId}:notifications`,
        JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          type: NotificationType.ERRAND_STATUS,
          actionRoute: `/errands/${id}`,
        }),
      )

      return updated
    })

    return NextResponse.json(updatedErrand)
  } catch (error) {
    console.error('Errand PATCH Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const { id } = await params

    await prisma.$transaction(async (tx) => {
      const errand = await tx.errand.findUnique({
        where: { id, userId: userId },
      })

      if (!errand) throw { status: 404, message: 'Errand not found' }

      await tx.activityLog.create({
        data: {
          errandId: id,
          type: 'DELETE_EXPENSE',
          title: 'Errand Pipeline Archived',
          meta: 'Operational tracking loop disabled and moved out of active feeds.',
        },
      })

      await tx.errand.update({
        where: {
          id,
          userId: session.user.id,
        },
        data: {
          isArchived: true,
          deletedAt: new Date(),
        },
      })
      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.ERRAND_STATUS,
          title: 'Errand Archived 📁',
          message: `Errand "${errand.title}" has been moved into your archives.`,
          actionLabel: 'Go to Dashboard',
          actionRoute: '/dashboard',
          isRead: false,
        },
      })

      await redis.publish(
        `user:${userId}:notifications`,
        JSON.stringify({
          title: 'Errand Archived 📁',
          message: `Errand "${errand.title}" has been moved into your archives.`,
          type: NotificationType.ERRAND_STATUS,
          actionRoute: '/dashboard',
        }),
      )
    })

    return NextResponse.json({
      success: true,
      message: 'Errand entry successfully moved into archives',
    })
  } catch (error) {
    console.error('Errand Lifecycle Deletion Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
