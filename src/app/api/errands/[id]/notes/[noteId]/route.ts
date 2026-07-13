import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; noteId: string }> },
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: errandId, noteId } = await params

    return await prisma.$transaction(async (tx) => {
      const targetNote = await tx.errandNote.findUnique({
        where: { id: noteId },
      })

      if (!targetNote) {
        return NextResponse.json(
          { error: 'Note element not found' },
          { status: 404 },
        )
      }

      await tx.errandNote.delete({
        where: { id: noteId },
      })

      await tx.activityLog.create({
        data: {
          errandId,
          type: 'DELETE_NOTE',
          title: 'Removed a workspace memo',
          meta: `Archived line: "${targetNote.content.substring(0, 35)}..."`,
        },
      })

      return NextResponse.json({ success: true })
    })
  } catch (error) {
    console.error('Notes DELETE Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
