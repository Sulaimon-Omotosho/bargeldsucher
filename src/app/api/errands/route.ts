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

    const userId = session.user.id

    const errands = await prisma.errand.findMany({
      where: {
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      include: {
        expenses: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedErrands = errands.map((errand) => {
      const serializedExpenses = errand.expenses.map((expense) => ({
        ...expense,
        amount: Number(expense.amount),
      }))

      const totalSpent = serializedExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      )

      const isOwner = errand.userId === userId

      return {
        ...errand,
        amountReceived: Number(errand.amountReceived),
        expenses: serializedExpenses,
        totalSpent,
        status: (errand as any).status || 'ACTIVE',
        isOwner,
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

interface ErrandMemberInput {
  userId: string
  role: 'COLLABORATOR' | 'VIEWER'
  allocatedBudget?: number | string | null
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const creatorId = session.user.id
    const body = await req.json()
    const { title, description, amountReceived, members = [] } = body

    if (!title || !amountReceived) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    const numericAmount = Number(amountReceived)

    // Sanitize & Filter Members
    const validMembers: ErrandMemberInput[] = (
      members as ErrandMemberInput[]
    ).filter(
      (m) => m.userId && m.userId.trim() !== '' && m.userId !== creatorId,
    )

    // Validate Budget Allocation Limit
    const totalAllocated = validMembers.reduce((sum, member) => {
      if (member.role === 'VIEWER') return sum
      const budget = Number(member.allocatedBudget || 0)
      return sum + (isNaN(budget) ? 0 : budget)
    }, 0)

    if (totalAllocated > numericAmount) {
      return NextResponse.json(
        {
          error: `Total allocated budget (₦${totalAllocated.toLocaleString()}) exceeds total errand budget (₦${numericAmount.toLocaleString()}).`,
        },
        { status: 400 },
      )
    }

    // Database Transaction
    const savedErrand = await prisma.$transaction(async (tx) => {
      // Create the core errand instance
      const errand = await tx.errand.create({
        data: {
          title: title.trim(),
          description: description?.trim() || null,
          amountReceived: numericAmount,
          userId: creatorId,
          // Add Creator as OWNER + Add Invited Members
          members: {
            create: [
              {
                userId: creatorId,
                role: 'OWNER',
                allocatedBudget: null,
              },
              ...validMembers.map((m) => ({
                userId: m.userId,
                role: m.role,
                allocatedBudget:
                  m.role === 'VIEWER'
                    ? null
                    : m.allocatedBudget
                      ? Number(m.allocatedBudget)
                      : null,
              })),
            ],
          },
        },
        include: {
          members: true,
        },
      })

      // Log activity
      await tx.activityLog.create({
        data: {
          errandId: errand.id,
          type: 'SYSTEM',
          title: 'Created errand instance pipeline',
          meta: `Initial authorization float set at ₦${numericAmount.toLocaleString()}${
            validMembers.length > 0
              ? ` with ${validMembers.length} member(s)`
              : ''
          }`,
        },
      })

      // Create notification for Creator
      await tx.notification.create({
        data: {
          userId: creatorId,
          type: NotificationType.ERRAND_STATUS,
          title: 'New Errand Created',
          message: `Errand "${errand.title}" with a budget of ₦${numericAmount.toLocaleString()} has been added.`,
          actionLabel: 'View Errand',
          actionRoute: `/errands/${errand.id}`,
          isRead: false,
        },
      })

      await redis.publish(
        `user:${creatorId}:notifications`,
        JSON.stringify({
          title: 'New Errand Created',
          message: `Errand "${errand.title}" with a budget of ₦${numericAmount.toLocaleString()} has been added.`,
          type: NotificationType.ERRAND_STATUS,
          actionRoute: `/errands/${errand.id}`,
        }),
      )

      // Notify Invited Members
      for (const member of validMembers) {
        const inviteMessage =
          member.role === 'VIEWER'
            ? `You've been added as a viewer to "${errand.title}".`
            : `You've been assigned as a collaborator on "${errand.title}"${
                member.allocatedBudget
                  ? ` with a budget of ₦${Number(member.allocatedBudget).toLocaleString()}`
                  : ''
              }.`

        await tx.notification.create({
          data: {
            userId: member.userId,
            type: NotificationType.ERRAND_STATUS,
            title: 'Added to Errand',
            message: inviteMessage,
            actionLabel: 'View Errand',
            actionRoute: `/errands/${errand.id}`,
            isRead: false,
          },
        })

        await redis.publish(
          `user:${member.userId}:notifications`,
          JSON.stringify({
            title: 'Added to Errand 📋',
            message: inviteMessage,
            type: NotificationType.ERRAND_STATUS,
            actionRoute: `/errands/${errand.id}`,
          }),
        )
      }

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
