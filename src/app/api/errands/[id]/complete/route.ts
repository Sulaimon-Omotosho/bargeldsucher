import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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
    const { handlingMethod } = body // 'RETURNED' or 'SAVED'

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

      // 1. If we have surplus money left over
      if (variance > 0) {
        if (handlingMethod === 'RETURNED') {
          logTitle = 'Loop Closed: Cash Returned'
          logMeta = `Surplus of ₦${variance.toLocaleString()} was officially recorded as returned cash.`

          // Create a special expense record representing the returned cash
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
      }
      // 2. If we went over budget (Deficit)
      else if (variance < 0) {
        const deficit = Math.abs(variance)
        logTitle = 'Loop Closed: Deficit Settled'
        logMeta = `Overspent by ₦${deficit.toLocaleString()}. Supplementary cash injected to clear balances.`
      }
      // 3. Perfect match budget
      else {
        logTitle = 'Loop Closed: Balanced Settle'
        logMeta = 'Spent exactly 100% of allocated provisions.'
      }

      // Finalize the status of the Errand
      const finalizedErrand = await tx.errand.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })

      // Store historical diagnostic trails in ActivityLog and ErrandNote
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

      return NextResponse.json({ success: true, errand: finalizedErrand })
    })
  } catch (error) {
    console.error('Settlement Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
