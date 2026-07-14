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

    const { id: errandId } = await params
    const data = await req.json()

    // Validate base inputs
    if (!data.description || !data.amount || !data.category) {
      return NextResponse.json(
        { error: 'Missing required expense parameters.' },
        { status: 400 },
      )
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch current errand budget parameters
      const errand = await tx.errand.findUnique({
        where: { id: errandId, userId: session.user.id },
        include: { expenses: true },
      })

      if (!errand) {
        throw { status: 404, message: 'Errand workspace not found' }
      }
      if (errand.status === 'COMPLETED') {
        throw { status: 400, message: 'Cannot modify closed errand loops' }
      }

      const allocated = Number(errand.amountReceived)
      const currentTotal = errand.expenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      )
      const proposedTotal = currentTotal + Number(data.amount)

      const overspendAmount = proposedTotal - allocated
      const overspendPercent =
        allocated > 0 ? (overspendAmount / allocated) * 100 : 0

      // 🛑 TIER 3: Absolute Block (30%+)
      if (overspendPercent > 30) {
        throw {
          status: 422,
          message: `Hard Limit Crossed: Spending is restricted to a maximum 30% buffer (₦${(allocated * 1.3).toLocaleString()}).`,
        }
      }

      // ⚠️ TIERS 1 & 2: Overspending validation check (> 0%)
      const isOverspending = overspendPercent > 0
      if (isOverspending && !data.overspendExplanation?.trim()) {
        throw {
          status: 400,
          message: `Justification Required: Please provide an explanation note explaining why this run is exceeding its budget.`,
        }
      }

      // 2. Commit the new expense record
      const expense = await tx.expense.create({
        data: {
          description: data.description,
          amount: data.amount,
          category: data.category,
          vendor: data.vendor || null,
          receiptUrl: data.receiptUrl || null,
          expenseDate: data.expenseDate
            ? new Date(data.expenseDate)
            : new Date(),
          errandId,
        },
      })

      // 3. Create Notes and Audit Records if overspent
      if (isOverspending && data.overspendExplanation) {
        const userExplanation = data.overspendExplanation.trim()

        // Log justification explanation to the notes
        await tx.errandNote.create({
          data: {
            errandId,
            content: `[Budget Overage Justification] ${userExplanation}`,
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
            meta: `Exceeded allocation by ${overspendPercent.toFixed(1)}% | Note: "${userExplanation.substring(0, 45)}..."`,
          },
        })
      } else {
        // Log basic transaction entry
        await tx.activityLog.create({
          data: {
            errandId,
            type: 'SYSTEM',
            title: `Added ${data.description}`,
            meta: `- ₦${Number(data.amount).toLocaleString()}`,
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
    console.error('Expense API POST Error:', error)
    const statusCode = error.status || 500
    const message = error.message || 'Internal Server Error'
    return NextResponse.json({ error: message }, { status: statusCode })
  }
}
