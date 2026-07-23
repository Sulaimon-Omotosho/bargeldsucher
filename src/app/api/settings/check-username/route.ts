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
    const username = searchParams.get('username')?.trim()

    if (!username || username.length < 3) {
      return NextResponse.json(
        { available: false, message: 'Username too short' },
        { status: 400 },
      )
    }

    // Query database while excluding current user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: {
          equals: username,
          mode: 'insensitive',
        },
        NOT: {
          id: session.user.id,
        },
      },
      select: { id: true },
    })

    return NextResponse.json({
      available: !existingUser,
    })
  } catch (error) {
    console.error('Error checking username:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
