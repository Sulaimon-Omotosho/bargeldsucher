import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { ChangePasswordSchema } from '@/lib/ValidationSchema'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import nodemailer from 'nodemailer'

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

export async function PUT(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = ChangePasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid payload', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { currentPassword, newPassword } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Account password not found' },
        { status: 400 },
      )
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Incorrect current password' },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 17)
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'An error occurred while updating the password' },
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

    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    })

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })

    const baseUrl =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      'http://localhost:3000'
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${encodeURIComponent(token)}`

    await transporter.sendMail({
      from:
        process.env.EMAIL_FROM || '"App Security" <no-reply@yourdomain.com>',
      to: email,
      subject: 'Verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Verify Your Email</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            You requested an email verification link for your account. Please click the button below to confirm your email identity.
          </p>
          <div style="margin: 28px 0;">
            <a href="${verifyUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">
            This link will expire in 24 hours. If you did not request this, you can safely ignore this email.
          </p>
        </div>
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
