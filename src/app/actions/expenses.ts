'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import type { CreateExpenseInput, Expense } from '@/types/types'

interface CreateExpenseWithExplanationInput extends CreateExpenseInput {
  overspendExplanation?: string
}

export async function getAllExpensesAction(): Promise<Expense[]> {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const expenses = await prisma.expense.findMany({
    where: { errand: { userId: session.user.id } },
    include: { errand: true },
    orderBy: { expenseDate: 'desc' },
  })

  return expenses.map((exp) => ({
    ...exp,
    amount: Number(exp.amount),
    errand: {
      ...exp.errand,
      amountReceived: Number(exp.errand.amountReceived),
    },
  }))
}

export async function getSelectableErrandsAction(searchTerm?: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  const now = new Date()
  const cutoffDate = new Date()

  // Set temporal boundary based on active interaction profile
  if (searchTerm && searchTerm.trim()) {
    cutoffDate.setDate(now.getDate() - 30) // Search looks back 1 month
  } else {
    cutoffDate.setDate(now.getDate() - 7) // Default dropdown list looks back 1 week
  }

  const errands = await prisma.errand.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: cutoffDate },
      ...(searchTerm
        ? {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          }
        : {}),
    },
    select: {
      id: true,
      title: true,
      amountReceived: true,
    },
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
  })

  return errands.map((errand) => ({
    ...errand,
    amountReceived: Number(errand.amountReceived),
  }))
}

// export async function createExpenseAction(data: CreateExpenseInput) {
//   const session = await auth()

//   if (!session?.user?.id) {
//     throw new Error('Unauthorized')
//   }

//   // Wrap inside a transaction to ensure both records are created together
//   const savedExpense = await prisma.$transaction(async (tx) => {

//     const expense = await tx.expense.create({
//       data: {
//         description: data.description,
//         amount: data.amount,
//         category: data.category,
//         vendor: data.vendor || null,
//         receiptUrl: data.receiptUrl || null,
//         expenseDate: new Date(data.expenseDate),
//         errandId: data.errandId,
//       },
//     })

//     // 2. Automatically write the history item to the activityLog
//     await tx.activityLog.create({
//       data: {
//         errandId: data.errandId,
//         type: 'SYSTEM', // Using SYSTEM to align with your database enum values safely
//         title: `Added ${data.description}`,
//         meta: `- ₦${Number(data.amount).toLocaleString()}`,
//       },
//     })

//     return expense
//   })

//   return {
//     ...savedExpense,
//     amount: Number(savedExpense.amount),
//   }
// }

// Extend the input type locally to accept the user's explanation note

export async function createExpenseAction(
  data: CreateExpenseWithExplanationInput,
) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('Unauthorized')

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch errand metadata & existing expenses
    const errand = await tx.errand.findUnique({
      where: { id: data.errandId, userId: session.user.id },
      include: { expenses: true },
    })

    if (!errand) throw new Error('Errand workspace not found')
    if (errand.status === 'COMPLETED')
      throw new Error('Cannot modify closed errand loops')

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
      throw new Error(
        `Hard Limit Crossed: Spending is restricted to a maximum 30% buffer (₦${(allocated * 1.3).toLocaleString()}).`,
      )
    }

    // TIERS 1 & 2: Overspending validation check (> 0%)
    const isOverspending = overspendPercent > 0
    if (isOverspending && !data.overspendExplanation?.trim()) {
      throw new Error(
        `Justification Required: Please provide an explanation note explaining why this run is exceeding its budget.`,
      )
    }

    // 2. Commit the new expense to the database
    const expense = await tx.expense.create({
      data: {
        description: data.description,
        amount: data.amount,
        category: data.category,
        vendor: data.vendor || null,
        receiptUrl: data.receiptUrl || null,
        expenseDate: new Date(data.expenseDate),
        errandId: data.errandId,
      },
    })

    // 3. Create the User's Explanation Note and System Logs if overspent
    if (isOverspending && data.overspendExplanation) {
      const userExplanation = data.overspendExplanation.trim()

      // Save user's justification to workspace notes
      await tx.errandNote.create({
        data: {
          errandId: data.errandId,
          content: `[Budget Overage Justification] ${userExplanation}`,
        },
      })

      // Log to dynamic timeline
      const isSevere = overspendPercent > 15
      await tx.activityLog.create({
        data: {
          errandId: data.errandId,
          // type: isSevere ? 'SYSTEM' : 'SYSTEM',
          type: 'SYSTEM',
          title: isSevere
            ? 'Severe Budget Overrun logged'
            : 'Budget Overage Flex Authorized',
          meta: `Exceeded allocation by ${overspendPercent.toFixed(1)}% | Note: "${userExplanation.substring(0, 45)}..."`,
        },
      })
    } else {
      // Standard under-budget spent log
      await tx.activityLog.create({
        data: {
          errandId: data.errandId,
          type: 'SYSTEM',
          title: `Added ${data.description}`,
          meta: `- ₦${Number(data.amount).toLocaleString()}`,
        },
      })
    }

    return {
      ...expense,
      amount: Number(expense.amount),
    }
  })
}
