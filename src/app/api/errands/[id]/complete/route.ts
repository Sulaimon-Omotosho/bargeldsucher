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

    const { id } = await params
    const body = await req.json()
    const { handlingMethod } = body

    const userId = session.user.id

    return await prisma.$transaction(async (tx) => {
      const errand = await tx.errand.findFirst({
        where: { id, userId },
        include: { expenses: true },
      })

      if (!errand || errand.status === 'COMPLETED') {
        return NextResponse.json(
          { error: 'Errand unavailable or closed' },
          { status: 400 },
        )
      }

      const hasReturnedCashExpense = errand.expenses.some(
        (exp) => exp.description === 'Returned Cash',
      )

      const allocated = Number(errand.amountReceived)
      const totalSpent = errand.expenses
        .filter((exp) => exp.description !== 'Returned Cash')
        .reduce((sum, exp) => sum + Number(exp.amount), 0)
      const variance = allocated - totalSpent

      let logTitle = 'Errand Completed'
      let logMeta = ''

      if (variance > 0) {
        if (handlingMethod === 'RETURNED') {
          logTitle = 'Loop Closed: Cash Returned'
          logMeta = `Surplus of ₦${variance.toLocaleString()} was officially recorded as returned cash.`

          await tx.expense.create({
            data: {
              errandId: id,
              description: 'Returned Cash',
              amount: variance,
            },
          })
        } else {
          logTitle = 'Loop Closed: Cash Retained'
          logMeta = `Surplus of ₦${variance.toLocaleString()} is saved and held for future operational outlays.`
        }
      } else if (variance < 0) {
        const deficit = Math.abs(variance)
        logTitle = 'Loop Closed: Deficit Settled'
        logMeta = `Overspent by ₦${deficit.toLocaleString()}. Supplementary cash injected to clear balances.`
      } else {
        logTitle = 'Loop Closed: Balanced Settle'
        logMeta = 'Spent exactly 100% of allocated provisions.'
      }

      const finalizedErrand = await tx.errand.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })

      await tx.activityLog.create({
        data: {
          errandId: id,
          type: 'COMPLETED',
          title: logTitle,
          meta: logMeta,
        },
      })

      await tx.errandNote.create({
        data: {
          errandId: id,
          content: `[Automated Closeout Summary] ${logTitle}: ${logMeta}`,
        },
      })

      const notificationTitle = 'Errand Completed!'
      const notificationMessage = `"${errand.title}" is officially marked complete. ${logTitle}: ${logMeta}`

      await tx.notification.create({
        data: {
          userId,
          type: NotificationType.ERRAND_STATUS,
          title: notificationTitle,
          message: notificationMessage,
          actionLabel: 'View Summary',
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

      return NextResponse.json({ success: true, errand: finalizedErrand })
    })
  } catch (error: any) {
    console.error('Settlement Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.status || 500 },
    )
  }
}
