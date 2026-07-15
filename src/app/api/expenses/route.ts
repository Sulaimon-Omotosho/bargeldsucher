import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redis } from '@/lib/redis'
import { NotificationType } from '../../../../generated/prisma/enums'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const data = await req.json()
    const {
      description,
      amount,
      category,
      expenseDate,
      errandId,
      overspendExplanation,
      vendor,
      receiptUrl,
    } = data

    if (!description || !amount || !category || !errandId) {
      return NextResponse.json(
        {
          error:
            'Missing required parameters (description, amount, category, errandId).',
        },
        { status: 400 },
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      const errand = await tx.errand.findUnique({
        where: { id: errandId, userId: userId },
        include: { expenses: true },
      })

      if (!errand) throw { status: 404, message: 'Errand workspace not found' }
      if (errand.status === 'COMPLETED')
        throw { status: 400, message: 'Cannot modify closed errands' }

      const allocated = Number(errand.amountReceived)
      const currentTotal = errand.expenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      )
      const proposedTotal = currentTotal + Number(amount)

      const overspendAmount = proposedTotal - allocated
      const overspendPercent =
        allocated > 0 ? (overspendAmount / allocated) * 100 : 0

      // Absolute Lock (30%+)
      if (overspendPercent > 30) {
        throw {
          status: 422,
          message: `Hard Limit Crossed: Spending is locked at a maximum 30% buffer (₦${(allocated * 1.3).toLocaleString()}).`,
        }
      }

      const isOverspending = overspendPercent > 0
      if (isOverspending && !overspendExplanation?.trim()) {
        throw {
          status: 400,
          message: `Justification Required: Please explain why this is exceeding its budget.`,
        }
      }

      const expense = await tx.expense.create({
        data: {
          description,
          amount,
          category,
          vendor: vendor || null,
          receiptUrl: receiptUrl || null,
          expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
          errandId,
        },
      })

      let shouldNotify = false
      let notificationPayload: {
        title: string
        message: string
        type: NotificationType
      } = {
        title: '',
        message: '',
        type: NotificationType.SYSTEM_SECURITY,
      }

      if (isOverspending && overspendExplanation) {
        const justification = overspendExplanation.trim()

        await tx.errandNote.create({
          data: {
            errandId,
            content: `[Budget Overage Justification] ${justification}`,
          },
        })

        const isSevere = overspendPercent > 15
        await tx.activityLog.create({
          data: {
            errandId,
            type: 'SYSTEM',
            title: isSevere
              ? 'Severe Budget Overrun logged'
              : 'Budget Overage Flex Authorized',
            meta: `Exceeded allocation by ${overspendPercent.toFixed(1)}% | Note: "${justification.substring(0, 45)}..."`,
          },
        })

        // 🔔 Set up Budget Alert Notification
        shouldNotify = true
        notificationPayload = {
          title: isSevere
            ? 'Severe Budget Overrun! ⚠️'
            : 'Budget Limit Exceeded 💸',
          message: `Errand "${errand.title}" has gone over budget by ${overspendPercent.toFixed(1)}%. Reason: ${justification.substring(0, 45)}...`,
          type: 'CASH_ALERT',
        }
      } else {
        await tx.activityLog.create({
          data: {
            errandId,
            type: 'SYSTEM',
            title: `Added ${description}`,
            meta: `- ₦${Number(amount).toLocaleString()}`,
          },
        })

        shouldNotify = true
        notificationPayload = {
          title: 'New Expense Tracked 📝',
          message: `₦${Number(amount).toLocaleString()} logged for "${description}" on your errand.`,
          type: 'ERRAND_STATUS',
        }
      }

      if (shouldNotify) {
        // A. Save to PostgreSQL database for historical records
        await tx.notification.create({
          data: {
            userId,
            type: notificationPayload.type,
            title: notificationPayload.title,
            message: notificationPayload.message,
            actionLabel: 'View Errand',
            actionRoute: `/errands/${errandId}`,
            isRead: false,
          },
        })

        // B. Publish real-time event via Redis PubSub
        await redis.publish(
          `user:${userId}:notifications`,
          JSON.stringify({
            title: notificationPayload.title,
            message: notificationPayload.message,
            type: notificationPayload.type,
            actionRoute: `/errands/${errandId}`,
          }),
        )
      }

      return expense
    })

    return NextResponse.json({
      ...result,
      amount: Number(result.amount),
    })
  } catch (error: any) {
    console.error('API POST Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: error.status || 500 },
    )
  }
}
