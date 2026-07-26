import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { token?: string; newPassword?: string } = {}
  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: 'Invalid or missing JSON payload' },
      { status: 400 },
    )
  }

  const { token, newPassword } = body

  if (!token || !newPassword) {
    return NextResponse.json(
      { error: 'Token and new password are required' },
      { status: 400 },
    )
  }

  // Fetch token record
  const existingToken = await prisma.passwordResetToken.findFirst({
    where: {
      userId: session.user.id,
      token: token,
    },
  })

  if (!existingToken) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  // Check expiration
  if (new Date(existingToken.expires) < new Date()) {
    return NextResponse.json({ error: 'Token has expired' }, { status: 400 })
  }

  // Hash new password and update user
  const hashedPassword = await bcrypt.hash(newPassword, 17)

  await prisma.user.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  })

  // Cleanup used token
  await prisma.passwordResetToken.delete({
    where: { id: existingToken.id },
  })

  return NextResponse.json({
    success: true,
    message: 'Password updated successfully',
  })
}
