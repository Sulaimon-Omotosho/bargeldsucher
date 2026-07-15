import { ExpenseCategory } from '../../generated/prisma/enums'
import { ActivityLog, ErrandNote, Prisma } from '../../generated/prisma/client'

type ErrandModel = Prisma.ErrandGetPayload<{
  include: {
    expenses: true
  }
}>

type ExpenseModel = Prisma.ExpenseGetPayload<{
  include: {
    errand: true
  }
}>

export type SerializedExpense = Omit<
  ErrandModel['expenses'][number],
  'amount'
> & {
  amount: number
}

export type Errand = Omit<ErrandModel, 'amountReceived' | 'expenses'> & {
  amountReceived: number
  activities: ActivityLog[]
  expenses: SerializedExpense[]
  notes: ErrandNote[]
  content: string
}

export type Expense = Omit<ExpenseModel, 'amount' | 'errand'> & {
  amount: number
  notes?: string | null
  receiptUrl?: string | null
  errand: Omit<ExpenseModel['errand'], 'amountReceived'> & {
    amountReceived: number
  }
}

export type User = Prisma.UserGetPayload<{}>
export type Account = Prisma.AccountGetPayload<{}>
export type Session = Prisma.SessionGetPayload<{}>
export type VerificationToken = Prisma.VerificationTokenGetPayload<{}>

export interface CreateExpenseInput {
  description: string
  amount: number
  category: ExpenseCategory
  vendor?: string | null
  receiptUrl?: string | null
  expenseDate: string
  errandId: string
}

export interface SettingsData {
  // user: User
  name: string
  email: string
  isEmailVerified: boolean
  memberSince: string
  lastLogin: string
  completionPercentage: number
  stats: {
    errands: number
    expenses: number
    funding: number
    accountAgeDays: number
  }
  securityChecks: {
    emailVerified: boolean
    strongPassword: boolean
    recoveryEmail: boolean
    activeSessionProtected: boolean
  }
}
