import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { sendEmail } from '@/lib/mail'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      isEmailVerified: !!user.emailVerified,
    })
  } catch (error) {
    return NextResponse.json(
      { message: 'Failed to fetch security settings' },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const email = session.user.email

    // Fetch user details for a personalized email
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { firstName: true },
    })

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Clean up old verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Store new verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const baseUrl = process.env.NEXTAUTH_URL

    const verifyUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`
    // const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`

    await sendEmail({
      to: email,
      subject: 'Verify your Bargeldsucher email address',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 8px;">Verify Your Email</h2>
          <p style="color: #475569; font-size: 14px;">
            Hello ${user?.firstName ?? 'there'},
          </p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            You requested an email verification link for your Bargeldsucher account. Click the button below to confirm your email identity.
          </p>
          <div style="margin: 24px 0;">
            <a href="${verifyUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">
            If the button doesn't work, copy and paste this link into your browser:<br />
            <a href="${verifyUrl}" style="color: #0f172a;">${verifyUrl}</a>
          </p>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">
            This link will expire in 24 hours. If you did not request this, you can safely ignore this message.
          </p>
        </div>
      `,
      text: `
Hello ${user?.firstName ?? 'there'},

Please verify your email address for Bargeldsucher by opening the link below:

${verifyUrl}

This link expires in 24 hours.
      `,
    })

    return NextResponse.json(
      { message: 'Verification link sent successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { message: 'Failed to send verification link' },
      { status: 500 },
    )
  }
}
