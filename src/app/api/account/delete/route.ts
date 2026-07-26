import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await req.json()

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { message: 'Verification token is required.' },
        { status: 400 },
      )
    }

    const userEmail = session.user.email
    const userId = session.user.id

    // 1. Verify token
    const tokenRecord = await prisma.verificationToken.findFirst({
      where: {
        identifier: userEmail,
        token,
      },
    })

    if (!tokenRecord) {
      return NextResponse.json(
        { message: 'Invalid verification token.' },
        { status: 400 },
      )
    }

    // 2. Check expiration
    if (new Date(tokenRecord.expires) < new Date()) {
      await prisma.verificationToken.deleteMany({
        where: { identifier: userEmail },
      })
      return NextResponse.json(
        {
          message: 'Verification token has expired. Please request a new one.',
        },
        { status: 400 },
      )
    }

    // 3. Clean up token record
    await prisma.verificationToken.deleteMany({
      where: { identifier: userEmail },
    })

    // 4. Delete user account
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json(
      { message: 'Account permanently deleted.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { message: 'Server error during account deletion.' },
      { status: 500 },
    )
  }
}
