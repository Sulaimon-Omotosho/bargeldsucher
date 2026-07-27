import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')?.trim()

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 },
      )
    }

    const currentUser = session.user
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Search by username OR email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: { equals: query, mode: 'insensitive' } },
          { email: { equals: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { found: false, message: 'User not found' },
        { status: 404 },
      )
    }

    if (user.id === currentUser.id) {
      return NextResponse.json(
        { found: false, isSelf: true, message: 'You cannot add yourself' },
        { status: 400 },
      )
    }

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
