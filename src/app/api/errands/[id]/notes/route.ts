import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: errandId } = await params
    const { content } = await req.json()

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Note content cannot be empty' },
        { status: 400 },
      )
    }

    return await prisma.$transaction(async (tx) => {
      const note = await tx.errandNote.create({
        data: {
          errandId,
          content: content.trim(),
        },
      })

      await tx.activityLog.create({
        data: {
          errandId,
          type: 'ADD_NOTE',
          title: 'Added a workspace memo',
          meta: `"${content.trim().substring(0, 45)}${content.trim().length > 45 ? '...' : ''}"`,
        },
      })

      return NextResponse.json(note)
    })
  } catch (error) {
    console.error('Notes POST Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
