import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const cursor = searchParams.get('cursor')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const activeErrands = await prisma.errand.findMany({
      where: {
        userId: session.user.id,
        status: { not: 'COMPLETED' }, // Only active errands
        createdAt: { gte: oneYearAgo },
        ...(search.trim()
          ? {
              title: {
                contains: search,
                mode: 'insensitive',
              },
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        amountReceived: true,
        // We select the expenses to check current spending thresholds in real-time
        expenses: {
          select: {
            amount: true,
          },
        },
      },
      take: limit + 1, // Fetch an extra item to check if there is a next page
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      orderBy: { createdAt: 'desc' },
    })

    let nextCursor: string | undefined = undefined
    if (activeErrands.length > limit) {
      const nextItem = activeErrands.pop()
      nextCursor = nextItem?.id
    }

    const items = activeErrands.map((e) => {
      const totalSpent = e.expenses.reduce(
        (sum, exp) => sum + Number(exp.amount),
        0,
      )
      return {
        id: e.id,
        title: e.title,
        amountReceived: Number(e.amountReceived),
        totalSpent,
      }
    })

    return NextResponse.json({ items, nextCursor })
  } catch (error: any) {
    console.error('Error fetching selectable errands:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
