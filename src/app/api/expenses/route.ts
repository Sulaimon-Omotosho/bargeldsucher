import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
        where: { id: errandId, userId: session.user.id },
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

      // Check for justification
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
      } else {
        await tx.activityLog.create({
          data: {
            errandId,
            type: 'SYSTEM',
            title: `Added ${description}`,
            meta: `- ₦${Number(amount).toLocaleString()}`,
          },
        })
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
