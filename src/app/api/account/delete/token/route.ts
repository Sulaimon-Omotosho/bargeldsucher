import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'

export async function POST() {
  const session = await auth()

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userEmail = session.user.email
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  try {
    // 1. Fetch user to get name for email greeting
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true },
    })

    // 2. Clear any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: userEmail },
    })

    // 3. Create the new token
    await prisma.verificationToken.create({
      data: {
        identifier: userEmail,
        token,
        expires,
      },
    })

    // 4. Send email
    await sendEmail({
      to: userEmail,
      subject: 'Bargeldsucher Account Deletion Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 12px; background-color: #fff5f5;">
          <h2 style="color: #991b1b; margin-bottom: 8px;">Account Deletion Verification</h2>
          <p style="color: #475569; font-size: 14px;">
            Hello ${user?.firstName ?? 'there'},
          </p>
          <p style="color: #475569; font-size: 14px;">
            You requested to permanently delete your Bargeldsucher account. Use the code below to complete this action:
          </p>
          
          <div style="background-color: #ffffff; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #dc2626;">
              ${token}
            </span>
          </div>

          <p style="color: #7f1d1d; font-size: 12px; font-weight: 500;">
            Warning: Entering this code will permanently erase all your profile data and records.
          </p>
          <p style="color: #64748b; font-size: 12px;">
            This security code is valid for <strong>15 minutes</strong>. If you did not initiate this request, please secure your account immediately.
          </p>
        </div>
      `,
      text: `
Hello ${user?.firstName ?? 'there'},

Your account deletion verification code is: ${token}

This code expires in 15 minutes. If you did not request this, please secure your account.
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Deletion token sent successfully',
    })
  } catch (error) {
    console.error('Failed to send deletion security email:', error)
    return NextResponse.json(
      { message: 'Failed to send security token email' },
      { status: 500 },
    )
  }
}
