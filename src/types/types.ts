import { ExpenseCategory } from '../../generated/prisma/enums'
import { ActivityLog, ErrandNote, Prisma } from '../../generated/prisma/client'

export type Theme = 'LIGHT' | 'DARK' | 'SYSTEM'
export type Currency = 'NGN' | 'USD' | 'EUR' | 'GBP'
export type WeekStart = 'MONDAY' | 'SUNDAY'

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

export interface UserPreferencesData {
  currency: Currency
  theme: Theme
  weekStartsOn: WeekStart
  symbolPosition: string
  timezone?: string | null
  language: string
}

export interface AddressData {
  streetAddress?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postalCode?: string | null
}

export interface UserProfileData {
  firstName: string
  lastName: string
  username: string | null
  image: string | null
  phone: string | null
  occupation: string | null
  bio: string | null
  dateOfBirth: Date | null
  address: AddressData
}

export interface SettingsData {
  user: {
    name: string
    email: string
    isEmailVerified: boolean
    memberSince: string
    lastLogin: string
  }

  profile: UserProfileData

  preferences: UserPreferencesData

  stats: {
    errands: number
    expenses: number
    funding: number
    accountAgeDays: number
  }

  securityChecks: {
    emailVerified: boolean
    hasPassword: boolean
    recoveryEmail: boolean
    activeSessionProtected: boolean
  }
}
