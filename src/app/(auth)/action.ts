'use server'

import { sendEmail } from '@/lib/mail'
import { prisma } from '@/lib/prisma'
import { resend } from '@/lib/resend'
import {
  RegisterServerSchema,
  ResetPasswordSchema,
} from '@/lib/ValidationSchema'
import bcrypt from 'bcryptjs'

import crypto from 'crypto'

// REGISTER USER
export async function registerUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string

  if (!email || !password) {
    return { error: 'Missing required fields' }
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  })
  if (existingUser) {
    return { error: 'Email already registered' }
  }

  const parsed = RegisterServerSchema.safeParse({
    email,
    password,
    firstName,
    lastName,
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    }
  }

  const hashedPassword = await bcrypt.hash(password, 17)

  await prisma.user.create({
    data: {
      name: `${firstName} ${lastName}`.trim(),
      email,
      firstName,
      lastName,
      password: hashedPassword,
    },
  })

  return { success: true }
}

// SEND RESET TOKEN
export async function forgotPassword(formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return {
      message: 'A reset link has been sent to the mail.',
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
  })

  // Never reveal whether the email exists
  if (!user) {
    return {
      message: 'A reset link has been sent to the mail.',
    }
  }

  const rawToken = crypto.randomBytes(32).toString('hex')

  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

  const expires = new Date(Date.now() + 1000 * 60 * 60)

  await prisma.passwordResetToken.deleteMany({
    where: {
      userId: user.id,
    },
  })

  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      expires,
      userId: user.id,
    },
  })

  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${rawToken}`

  // await resend.emails.send({
  //   from: 'Bargeldsucher <onboarding@resend.dev>',
  //   to: email,
  //   subject: 'Reset your password',
  //   html: `
  //   <h2>Password Reset</h2>

  //   <p>You requested a password reset.</p>

  //   <p>
  //     <a href="${resetLink}">
  //       Reset Password
  //     </a>
  //   </p>

  //   <p>This link expires in one hour.</p>
  // `,
  // })
  // await sendEmail({
  //   to: user.email,
  //   subject: 'Reset your Bargeldsucher password',
  //   html: `
  //   <h2>Password Reset</h2>

  //   <p>You requested to reset your password.</p>

  //   <p>
  //     <a href="${resetLink}">
  //       Reset Password
  //     </a>
  //   </p>
  //   <p>${resetLink}</p>

  //   <p>This link expires in one hour.</p>

  //   <p>If you didn't request this, ignore this email.</p>
  // `,
  // })

  await sendEmail({
    to: user.email,
    subject: 'Reset your Bargeldsucher password',
    html: `
    <p>Hello ${user.firstName ?? ''},</p>

    <p>Copy this link into your browser if clicking doesn't work:</p>

    <p>${resetLink}</p>
  `,
    text: `
Hello ${user.firstName ?? ''},

Reset your password here:

${resetLink}

This link expires in one hour.
`,
  })

  return {
    message: 'A reset link has been sent to the mail.',
  }
}

// RESET PASSWORD
export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!token || !password || !confirmPassword) {
    return {
      error: 'Missing required fields.',
    }
  }

  const parsed = ResetPasswordSchema.safeParse({
    password,
    confirmPassword,
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0].message,
    }
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      token: hashedToken,
    },
    include: {
      user: true,
    },
  })

  if (!resetToken) {
    return {
      error: 'Invalid reset link.',
    }
  }

  if (resetToken.expires < new Date()) {
    return {
      error: 'Reset link has expired.',
    }
  }

  const hashedPassword = await bcrypt.hash(password, 17)

  await prisma.user.update({
    where: {
      id: resetToken.userId,
    },
    data: {
      password: hashedPassword,
    },
  })

  await prisma.passwordResetToken.delete({
    where: {
      token: hashedToken,
    },
  })
  return {
    success: 'Password reset successfully.',
  }
}
