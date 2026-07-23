import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { password } = await req.json()

    if (!password) {
      return NextResponse.json(
        { message: 'Password is required' },
        { status: 400 },
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'User record or password not found' },
        { status: 400 },
      )
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Incorrect password' },
        { status: 400 },
      )
    }

    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json(
      { message: 'Account permanently deleted' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Account deletion error:', error)
    return NextResponse.json(
      { message: 'An error occurred while deleting the account' },
      { status: 500 },
    )
  }
}
