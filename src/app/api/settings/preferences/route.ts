import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { PreferencesSchema } from '@/lib/ValidationSchema'
import { Currency } from '../../../../../generated/prisma/enums'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    })

    return NextResponse.json(preferences || {})
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch preferences' },
      { status: 500 },
    )
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const validatedData = PreferencesSchema.parse(body)

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...validatedData,
        currency: validatedData.currency as Currency,
      },
      create: {
        userId,
        ...validatedData,
        currency: validatedData.currency as Currency,
      },
    })

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 400 },
    )
  }
}
