import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Update user record in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        isArchived: false,
      },
    })

    return NextResponse.json(
      { message: 'Account unarchived successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Unarchive account error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    )
  }
}
