import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { isArchived: true },
    })

    return NextResponse.json(
      { message: 'Account archived successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Account archive error:', error)
    return NextResponse.json(
      { message: 'Failed to archive account' },
      { status: 500 },
    )
  }
}
