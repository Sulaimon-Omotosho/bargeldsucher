import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  try {
    // 1. Match using user session ID for robust relational security
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Pull all active errands and child logs directly
    const errands = await prisma.errand.findMany({
      where: { userId: session.user.id },
      include: { expenses: true },
    })

    // If there are truly no errands yet, return baseline initialization safely
    if (!errands || errands.length === 0) {
      return NextResponse.json({
        healthScore: 100,
        healthStatus: 'Excellent',
        reasons: [
          'No operational cash metrics logged yet.',
          'Your overall balance parameters are clean.',
        ],
        upcomingSpending: [],
      })
    }

    let scoreBasis = 100
    const reasons: string[] = []

    // 3. Compute Real Metrics
    const totalFunding = errands.reduce(
      (acc, curr) => acc + Number(curr.amountReceived),
      0,
    )
    const totalSpent = errands
      .flatMap((e) => e.expenses)
      .reduce((acc, curr) => acc + Number(curr.amount), 0)

    // Rule A: High Consumption Velocity
    const burnRate = totalFunding > 0 ? (totalSpent / totalFunding) * 100 : 0
    if (burnRate > 90) {
      scoreBasis -= 25
      reasons.push(
        `High Burn: Spending exceeds ${burnRate.toFixed(0)}% of funds.`,
      )
    } else if (burnRate > 70) {
      scoreBasis -= 10
      reasons.push(
        `Warning: Intake burn rate is high at ${burnRate.toFixed(0)}%.`,
      )
    } else {
      reasons.push('Overall budget velocity is completely healthy.')
    }

    // Rule B: Over-cap individual allocations
    const overBudgetErrands = errands.filter((e) => {
      const spent = e.expenses.reduce(
        (acc, curr) => acc + Number(curr.amount),
        0,
      )
      return spent > Number(e.amountReceived)
    })

    if (overBudgetErrands.length > 0) {
      scoreBasis -= overBudgetErrands.length * 10
      reasons.push(
        `${overBudgetErrands.length} active errands are currently over budget.`,
      )
    } else {
      reasons.push('No over-budget individual errands detected.')
    }

    // Rule C: Capital Reserve Deficits
    const currentCashBalance = totalFunding - totalSpent
    if (currentCashBalance < 0) {
      scoreBasis -= 30
      reasons.push('System cash on hand is running in a deficit.')
    } else {
      reasons.push('Main balance parameters stay within safe limits.')
    }

    // 4. Bound and Output Score Values
    const healthScore = Math.max(0, Math.min(scoreBasis, 100))
    let healthStatus = 'Excellent'
    if (healthScore < 50) healthStatus = 'Critical'
    else if (healthScore < 75) healthStatus = 'Warning'
    else if (healthScore < 90) healthStatus = 'Good'

    // 5. Construct live upcoming items tracker
    const upcomingSpending = errands
      .filter((e) => {
        const spent = e.expenses.reduce(
          (acc, curr) => acc + Number(curr.amount),
          0,
        )
        return spent < Number(e.amountReceived)
      })
      .map((e) => {
        const spent = e.expenses.reduce(
          (acc, curr) => acc + Number(curr.amount),
          0,
        )
        return {
          id: e.id,
          title: e.title,
          totalAllocated: Number(e.amountReceived),
          amountRemaining: Number(e.amountReceived) - spent,
          expenseCount: e.expenses.length,
          createdAt: e.createdAt,
        }
      })
      .slice(0, 3)

    return NextResponse.json({
      healthScore,
      healthStatus,
      reasons,
      upcomingSpending,
    })
  } catch (error) {
    console.error('Insights API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
