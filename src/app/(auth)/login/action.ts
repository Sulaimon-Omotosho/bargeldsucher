'use server'

import { prisma } from '@/lib/prisma'
import { RegisterSchema } from '@/lib/ValidationSchema'
import bcrypt from 'bcryptjs'

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

  const parsed = RegisterSchema.safeParse({
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
