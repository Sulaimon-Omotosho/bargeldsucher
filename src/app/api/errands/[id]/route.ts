import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
        notes: true,
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
      // 1. Capture old details for dynamic audit comparison strings
      const oldErrand = await tx.errand.findUnique({
        where: { id, userId: session.user.id },
      })

      // 2. Perform main meta update operations
      const updated = await tx.errand.update({
        where: {
          id,
          userId: session.user.id,
        },
        data: {
          title: title.trim(),
          description: description?.trim() || null,
        },
      })

      // 3. Document the modification on the activity stream
      const titleChanged = oldErrand?.title !== title.trim()
      await tx.activityLog.create({
        data: {
          errandId: id,
          type: 'SYSTEM',
          title: titleChanged
            ? `Renamed errand to "${title.trim()}"`
            : 'Updated errand core description details',
          meta:
            titleChanged && oldErrand
              ? `Previous: "${oldErrand.title}"`
              : 'Metadata configuration updated via management panel.',
        },
      })

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

    const { id } = await params

    await prisma.$transaction(async (tx) => {
      // 1. Create audit record pointing out that this item was explicitly thrown to archives
      await tx.activityLog.create({
        data: {
          errandId: id,
          type: 'DELETE_EXPENSE',
          title: 'Errand Pipeline Archived',
          meta: 'Operational tracking loop disabled and moved out of active feeds.',
        },
      })

      // 2. Perform standard soft-deletion archive script
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
