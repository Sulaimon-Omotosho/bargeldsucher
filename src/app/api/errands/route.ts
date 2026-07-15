import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'
import { NotificationType } from '../../../../generated/prisma/enums'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const errands = await prisma.errand.findMany({
      where: { userId: session.user.id },
      include: { expenses: true },
      orderBy: { createdAt: 'desc' },
    })

    // Serialize and compute inline totals while retaining structural integrity
    const formattedErrands = errands.map((errand) => {
      const serializedExpenses = errand.expenses.map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
      }))

      const totalSpent = serializedExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      )

      return {
        ...errand,
        amountReceived: Number(errand.amountReceived),
        expenses: serializedExpenses,
        totalSpent,
        status: (errand as any).status || 'ACTIVE',
      }
    })

    const globalSummary = {
      totalAllocated: formattedErrands.reduce(
        (sum, e) => sum + e.amountReceived,
        0,
      ),
      totalSpent: formattedErrands.reduce((sum, e) => sum + e.totalSpent, 0),
      totalErrandsCount: formattedErrands.length,
    }

    return NextResponse.json({
      errands: formattedErrands,
      summary: globalSummary,
    })
  } catch (error) {
    console.error('Errands GET Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const body = await req.json()
    const { title, description, amountReceived } = body

    if (!title || !amountReceived) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    const savedErrand = await prisma.$transaction(async (tx) => {
      const errand = await tx.errand.create({
        data: {
          title: title.trim(),
          description: description?.trim(),
          amountReceived: Number(amountReceived),
          userId: userId,
        },
      })

      await tx.activityLog.create({
        data: {
          errandId: errand.id,
          type: 'SYSTEM',
          title: 'Created errand instance pipeline',
          meta: `Initial authorization float set at ₦${Number(amountReceived).toLocaleString()}`,
        },
      })

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.ERRAND_STATUS, // Uses the strict enum
          title: 'New Errand Created 🚀',
          message: `Errand "${errand.title}" with a budget of ₦${Number(amountReceived).toLocaleString()} has been added.`,
          actionLabel: 'View Errand',
          actionRoute: `/errands/${errand.id}`,
          isRead: false,
        },
      })

      await redis.publish(
        `user:${userId}:notifications`,
        JSON.stringify({
          title: 'New Errand Created 🚀',
          message: `Errand "${errand.title}" with a budget of ₦${Number(amountReceived).toLocaleString()} has been added.`,
          type: NotificationType.ERRAND_STATUS,
          actionRoute: `/errands/${errand.id}`,
        }),
      )

      return errand
    })

    return NextResponse.json({
      ...savedErrand,
      amountReceived: Number(savedErrand.amountReceived),
    })
  } catch (error) {
    console.error('Errands POST Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
