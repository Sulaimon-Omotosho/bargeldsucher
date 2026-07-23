import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import z from 'zod'
import {
  ChangePasswordSchema,
  PreferencesSchema,
  ProfileSchema,
} from '@/lib/ValidationSchema'
import bcrypt from 'bcryptjs'

// Fetch user profile, related statistics, and security health
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // 1. Fetch User (with User level fields), Profile, Preferences, and Errand count
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        username: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        password: true,
        profile: {
          select: {
            phone: true,
            occupation: true,
            bio: true,
            dateOfBirth: true,
            address: {
              select: {
                streetAddress: true,
                city: true,
                state: true,
                country: true,
                postalCode: true,
              },
            },
          },
        },
        preferences: {
          select: {
            currency: true,
            theme: true,
            weekStartsOn: true,
            symbolPosition: true,
            timezone: true,
            language: true,
          },
        },
        _count: {
          select: {
            errands: {
              where: {
                isArchived: false,
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 2. Aggregate Total Funding directly on PostgreSQL/MySQL engine
    const fundingAggregate = await prisma.errand.aggregate({
      where: {
        userId,
        isArchived: false,
        deletedAt: null,
      },
      _sum: {
        amountReceived: true,
      },
    })

    const totalFunding = Number(fundingAggregate._sum.amountReceived) || 0

    // 3. Fetch ONLY Expense amounts & descriptions for this user's active errands
    const expenses = await prisma.expense.findMany({
      where: {
        errand: {
          userId,
          isArchived: false,
          deletedAt: null,
        },
      },
      select: {
        amount: true,
        description: true,
      },
    })

    // Compute expenses (subtraction for refunds)
    let totalExpenses = 0
    expenses.forEach((expense) => {
      const amt = Number(expense.amount) || 0
      const isRefund = expense.description?.toLowerCase().includes('refund')

      if (isRefund) {
        totalExpenses -= amt
      } else {
        totalExpenses += amt
      }
    })

    totalExpenses = Math.max(0, totalExpenses)

    // 4. Compute Account Age
    const accountAgeDays = Math.max(
      1,
      Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    )

    // 5. Structure Complete Payload for all Settings Tabs
    const formattedData = {
      user: {
        name: user.name ?? user.email.split('@')[0] ?? 'User',
        email: user.email,
        isEmailVerified: !!user.emailVerified,
        memberSince: new Date(user.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
        lastLogin: new Date(user.updatedAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
        }),
      },

      // Profile Tab (Combines User + UserProfile + Address)
      profile: {
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        username: user.username || '',
        image: user.image || '',
        phone: user.profile?.phone || '',
        occupation: user.profile?.occupation || '',
        bio: user.profile?.bio || '',
        dateOfBirth: user.profile?.dateOfBirth
          ? user.profile.dateOfBirth.toISOString().split('T')[0]
          : null,
        address: {
          streetAddress: user.profile?.address?.streetAddress || '',
          city: user.profile?.address?.city || '',
          state: user.profile?.address?.state || '',
          country: user.profile?.address?.country || '',
          postalCode: user.profile?.address?.postalCode || '',
        },
      },

      // Preferences Tab Data
      preferences: {
        currency: user.preferences?.currency || 'NGN',
        theme: user.preferences?.theme || 'SYSTEM',
        weekStartsOn: user.preferences?.weekStartsOn || 'MONDAY',
        symbolPosition: user.preferences?.symbolPosition || 'before',
        timezone: user.preferences?.timezone || '',
        language: user.preferences?.language || 'en',
      },

      // Security Tab Checks
      securityChecks: {
        emailVerified: !!user.emailVerified,
        hasPassword: !!user.password,
        recoveryEmail: true,
        activeSessionProtected: true,
      },

      // Stats Sidebar
      stats: {
        errands: user._count.errands,
        expenses: parseFloat(totalExpenses.toFixed(2)),
        funding: parseFloat(totalFunding.toFixed(2)),
        accountAgeDays,
      },
    }

    return NextResponse.json(formattedData)
  } catch (error: any) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

// Update user profile details
const patchSettingsSchema = z.object({
  section: z.enum(['profile', 'preferences', 'security']),
  data: z.record(z.string(), z.unknown()),
})

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = patchSettingsSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid payload wrapper', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { section, data } = parsed.data

    if (section === 'profile') {
      const profileData = ProfileSchema.parse(data)

      const updatedUser = await prisma.$transaction(async (tx) => {
        const result = await tx.user.update({
          where: { id: userId },
          data: {
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            name: `${profileData.firstName} ${profileData.lastName}`.trim(),
            username: profileData.username,
            image: profileData.image,
            profile: {
              upsert: {
                create: {
                  phone: profileData.phone,
                  occupation: profileData.occupation,
                  bio: profileData.bio,
                  dateOfBirth: profileData.dateOfBirth,
                  address: profileData.address
                    ? {
                        create: {
                          streetAddress: profileData.address.streetAddress,
                          city: profileData.address.city,
                          state: profileData.address.state,
                          country: profileData.address.country,
                          postalCode: profileData.address.postalCode,
                        },
                      }
                    : undefined,
                },
                update: {
                  phone: profileData.phone,
                  occupation: profileData.occupation,
                  bio: profileData.bio,
                  dateOfBirth: profileData.dateOfBirth,
                  address: profileData.address
                    ? {
                        upsert: {
                          create: {
                            streetAddress: profileData.address.streetAddress,
                            city: profileData.address.city,
                            state: profileData.address.state,
                            country: profileData.address.country,
                            postalCode: profileData.address.postalCode,
                          },
                          update: {
                            streetAddress: profileData.address.streetAddress,
                            city: profileData.address.city,
                            state: profileData.address.state,
                            country: profileData.address.country,
                            postalCode: profileData.address.postalCode,
                          },
                        },
                      }
                    : undefined,
                },
              },
            },
          },
          include: {
            profile: {
              include: { address: true },
            },
          },
        })

        await tx.notification.create({
          data: {
            userId: userId,
            type: 'SYSTEM_SECURITY',
            title: 'Profile Updated',
            message: 'Your personal profile details were updated successfully.',
            actionRoute: '/settings',
          },
        })

        return result
      })

      return NextResponse.json({
        message: 'Profile updated successfully',
        data: updatedUser,
      })
    }

    if (section === 'preferences') {
      const preferencesData = PreferencesSchema.parse(data)

      const updatedPreferences = await prisma.$transaction(async (tx) => {
        const result = await tx.userPreferences.upsert({
          where: { userId },
          update: {
            theme: preferencesData.theme,
            currency: preferencesData.currency,
            symbolPosition: preferencesData.symbolPosition,
            weekStartsOn: preferencesData.weekStartsOn,
            timezone: preferencesData.timezone,
            language: preferencesData.language,
          },
          create: {
            userId: userId,
            theme: preferencesData.theme,
            currency: preferencesData.currency,
            symbolPosition: preferencesData.symbolPosition,
            weekStartsOn: preferencesData.weekStartsOn,
            timezone: preferencesData.timezone,
            language: preferencesData.language,
          },
        })

        await tx.notification.create({
          data: {
            userId: userId,
            type: 'SYSTEM_SECURITY',
            title: 'Preferences Updated',
            message: 'Your system preferences have been updated.',
            actionRoute: '/settings',
          },
        })

        return result
      })

      return NextResponse.json({
        message: 'Preferences updated successfully',
        data: updatedPreferences,
      })
    }

    if (section === 'security') {
      const { currentPassword, newPassword } = ChangePasswordSchema.parse(data)

      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      })

      if (!dbUser || !dbUser.password) {
        return NextResponse.json(
          { message: 'Password record not found for this account.' },
          { status: 400 },
        )
      }

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        dbUser.password,
      )

      if (!isPasswordValid) {
        return NextResponse.json(
          { message: 'Incorrect current password' },
          { status: 400 },
        )
      }

      const hashedPassword = await bcrypt.hash(newPassword, 17)

      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        })

        await tx.notification.create({
          data: {
            userId: userId,
            type: 'SYSTEM_SECURITY',
            title: 'Password Changed',
            message: 'Your account password was successfully updated.',
            actionRoute: '/settings',
          },
        })
      })

      return NextResponse.json({
        message: 'Password updated successfully',
      })
    }

    return NextResponse.json({ message: 'Invalid section' }, { status: 400 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.flatten().fieldErrors },
        { status: 422 },
      )
    }

    console.error('[SETTINGS_PATCH_ERROR]:', error)
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
