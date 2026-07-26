import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ message: 'Token missing' }, { status: 400 })
  }

  try {
    const existingToken = await prisma.verificationToken.findFirst({
      where: { token },
    })

    if (!existingToken) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 400 },
      )
    }

    if (new Date(existingToken.expires) < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { token } })
      return NextResponse.json(
        { message: 'Token has expired' },
        { status: 400 },
      )
    }

    // Save to DB
    await prisma.user.update({
      where: { email: existingToken.identifier },
      data: { emailVerified: new Date() },
    })

    // Clean up used token
    await prisma.verificationToken.deleteMany({ where: { token } })

    return NextResponse.json(
      { success: true, message: 'Email verified' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 },
    )
  }
}
