import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ProfileSchema } from '@/lib/ValidationSchema'
import { NextResponse } from 'next/server'

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate payload against schema
    const parsed = ProfileSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid data format', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const data = parsed.data

    // Check username uniqueness if changed
    const existingUsername = await prisma.user.findFirst({
      where: {
        username: data.username,
        NOT: { id: session.user.id },
      },
    })

    if (existingUsername) {
      return NextResponse.json(
        { message: 'Username is already taken' },
        { status: 400 },
      )
    }

    // Upsert or update profile record in database
    // const updatedUser = await prisma.user.update({
    //   where: { id: session.user.id },
    //   data: {
    //     firstName: data.firstName,
    //     lastName: data.lastName,
    //     username: data.username,
    //     image: data.image,
    //     // phone: data.phone,
    //     // occupation: data.occupation,
    //     // bio: data.bio,
    //     // dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    //     profile: {
    //       upsert: {
    //         create: {
    //           occupation: data.occupation,
    //           bio: data.bio,
    //           phone: data.phone,
    //           dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    //         },
    //         update: {
    //           occupation: data.occupation,
    //           bio: data.bio,
    //           phone: data.phone,
    //           dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    //         },
    //       },
    //     },
    //     address: data.address
    //       ? {
    //           upsert: {
    //             create: {
    //               streetAddress: data.address.streetAddress,
    //               city: data.address.city,
    //               state: data.address.state,
    //               country: data.address.country,
    //               postalCode: data.address.postalCode,
    //             },
    //             update: {
    //               streetAddress: data.address.streetAddress,
    //               city: data.address.city,
    //               state: data.address.state,
    //               country: data.address.country,
    //               postalCode: data.address.postalCode,
    //             },
    //           },
    //         }
    //       : undefined,
    //   },
    //   include: {
    //     // address: true,
    //   },
    // })

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        image: data.image,

        profile: {
          upsert: {
            create: {
              occupation: data.occupation,
              bio: data.bio,
              phone: data.phone,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
              ...(data.address && {
                address: {
                  create: {
                    streetAddress: data.address.streetAddress,
                    city: data.address.city,
                    state: data.address.state,
                    country: data.address.country,
                    postalCode: data.address.postalCode,
                  },
                },
              }),
            },
            update: {
              occupation: data.occupation,
              bio: data.bio,
              phone: data.phone,
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
              ...(data.address && {
                address: {
                  upsert: {
                    create: {
                      streetAddress: data.address.streetAddress,
                      city: data.address.city,
                      state: data.address.state,
                      country: data.address.country,
                      postalCode: data.address.postalCode,
                    },
                    update: {
                      streetAddress: data.address.streetAddress,
                      city: data.address.city,
                      state: data.address.state,
                      country: data.address.country,
                      postalCode: data.address.postalCode,
                    },
                  },
                },
              }),
            },
          },
        },
      },
      include: {
        profile: {
          include: {
            address: true,
          },
        },
      },
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'An error occurred while updating the profile' },
      { status: 500 },
    )
  }
}
