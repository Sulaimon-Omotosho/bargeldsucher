import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { ExpenseCategory } from '../../../../../generated/prisma/enums'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const fromAmount = searchParams.get('from')
      ? Number(searchParams.get('from'))
      : undefined
    const toAmount = searchParams.get('to')
      ? Number(searchParams.get('to'))
      : undefined
    const timeline = searchParams.get('timeline') || 'All Time'
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '25', 10)

    // Build conditional timeline filters
    let dateFilter = {}
    const now = new Date()
    if (timeline === 'Today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = { gte: today }
    } else if (timeline === 'This Week') {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      dateFilter = { gte: oneWeekAgo }
    } else if (timeline === 'This Month') {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      dateFilter = { gte: oneMonthAgo }
    } else if (timeline === 'This Year') {
      dateFilter = { gte: new Date(now.getFullYear(), 0, 1) }
    }

    const searchTrimmed = search.trim()

    const matchingCategory = Object.values(ExpenseCategory).find(
      (cat) => cat.toLowerCase() === searchTrimmed.toLowerCase(),
    ) as ExpenseCategory | undefined

    const expenses = await prisma.expense.findMany({
      where: {
        errand: { userId: session.user.id },
        expenseDate: Object.keys(dateFilter).length ? dateFilter : undefined,
        amount: {
          gte: fromAmount,
          lte: toAmount,
        },
        ...(searchTrimmed
          ? {
              OR: [
                {
                  description: { contains: searchTrimmed, mode: 'insensitive' },
                },
                { vendor: { contains: searchTrimmed, mode: 'insensitive' } },
                {
                  errand: {
                    title: { contains: searchTrimmed, mode: 'insensitive' },
                  },
                },
                ...(matchingCategory ? [{ category: matchingCategory }] : []),
              ],
            }
          : {}),
      },
      include: {
        errand: {
          select: { title: true },
        },
      },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { expenseDate: 'desc' },
    })

    let nextCursor: string | undefined = undefined
    if (expenses.length > limit) {
      const nextItem = expenses.pop()
      nextCursor = nextItem?.id
    }

    const items = expenses.map((exp) => ({
      ...exp,
      amount: Number(exp.amount),
    }))

    return NextResponse.json({ items, nextCursor })
  } catch (error: any) {
    console.error('Stream Expense API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
