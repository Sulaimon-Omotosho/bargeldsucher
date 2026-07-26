import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const token = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 15 * 60 * 1000)

  // Save token to DB (replace existing if any)
  await prisma.passwordResetToken.deleteMany({
    where: { userId },
  })

  const resetTokenRecord = await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expires,
    },
    include: {
      user: {
        select: { email: true, firstName: true },
      },
    },
  })

  const userEmail = resetTokenRecord.user.email

  if (!userEmail) {
    return NextResponse.json(
      { message: 'No valid email found for user' },
      { status: 400 },
    )
  }

  try {
    await sendEmail({
      to: userEmail,
      subject: 'Your Bargeldsucher Security Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Security Verification Code</h2>
          <p style="color: #475569; font-size: 14px;">
            Hello ${resetTokenRecord.user.firstName ?? 'there'},
          </p>
          <p style="color: #475569; font-size: 14px;">
            Use the following code in your account security settings to set or update your password:
          </p>
          
          <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
            <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0f172a;">
              ${token}
            </span>
          </div>

          <p style="color: #64748b; font-size: 12px;">
            This security code is valid for <strong>15 minutes</strong>. If you did not request this change, please secure your account immediately.
          </p>
        </div>
      `,
      text: `
Hello ${resetTokenRecord.user.firstName ?? 'there'},

Your Bargeldsucher security code is: ${token}

Enter this code in your account settings to update your password. This code expires in 15 minutes.
      `,
    })

    return NextResponse.json({
      success: true,
      message: 'Security token sent successfully',
    })
  } catch (error) {
    console.error('Failed to send security email:', error)
    return NextResponse.json(
      { message: 'Failed to send security token email' },
      { status: 500 },
    )
  }
}
