// 'use server'

// import { prisma } from '@/lib/prisma'
// import { Redis } from '@upstash/redis'

// const redis = Redis.fromEnv()

// export async function createExpense(formData: {
//   description: string
//   amount: number
//   errandId: string
//   userId: string
// }) {
//   const { description, amount, errandId, userId } = formData

//   // 1. Save the expense
//   const expense = await prisma.expense.create({
//     data: {
//       description,
//       amount,
//       errandId,
//       expenseDate: new Date(),
//     },
//     include: { errand: true },
//   })

//   // 2. Aggregate current spending for the associated Errand
//   const totalSpentResult = await prisma.expense.aggregate({
//     where: { errandId },
//     _sum: { amount: true },
//   })

//   const totalSpent = totalSpentResult._sum.amount || 0
//   const budget = expense.errand?.budget || 0

//   // 3. Trigger alert if spending crosses 90% of the budget
//   if (budget > 0 && totalSpent >= budget * 0.9) {
//     const message = `${expense.errand?.title} has reached 90% of its budget (Spent ₦${totalSpent.toLocaleString()} of ₦${budget.toLocaleString()}).`

//     // Save the notification to Postgres for historical ledger/drawer review
//     await prisma.notification.create({
//       data: {
//         userId,
//         type: 'CASH_ALERT',
//         title: 'Budget Alert 💰',
//         message,
//         actionLabel: 'View Errand',
//         actionRoute: `/errands/${errandId}`,
//       },
//     })

//     // Publish to Redis Pub/Sub for real-time delivery
//     await redis.publish(
//       `user:${userId}:notifications`,
//       JSON.stringify({
//         title: 'Budget Alert 💰',
//         message,
//         type: 'CASH_ALERT',
//       }),
//     )
//   }

//   return expense
// }
