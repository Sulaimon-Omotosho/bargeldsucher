import { z } from 'zod'

export const ExpenseCategoryEnum = z.enum([
  'TRANSPORT',
  'FOOD',
  'OFFICE',
  'UTILITIES',
  'SHOPPING',
  'OTHER',
])

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter.')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter.')
  .regex(/[0-9]/, 'Must contain at least one number.')
  .regex(
    /[!@#$%^&*(),.?":{}|<>]/,
    'Must contain at least one special character.',
  )

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: passwordSchema,
})

export const RegisterSchema = z
  .object({
    firstName: z.string().min(2, 'Name must be at least 2 characters long'),
    lastName: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.email('Please enter a valid email address'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

export const RegisterServerSchema = z.object({
  firstName: z.string().min(2, 'Name must be at least 2 characters long'),
  lastName: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.email('Please enter a valid email address'),
  password: passwordSchema,
})

export const ErrandSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().trim().max(500).optional(),
  amountReceived: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z
      .number()
      .positive('Amount must be greater than zero')
      .refine((val) => Number.isFinite(val), 'Amount is required')
      .refine(
        (val) => Number(val.toFixed(2)) === val,
        'Amount cannot have more than 2 decimal places',
      ),
  ),
})

export const ExpenseSchema = z.object({
  description: z.string().min(3, 'Description must be at least 3 characters'),
  amount: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z
      .number()
      .positive('Amount must be greater than zero')
      .refine((val) => Number.isFinite(val), 'Amount is required')
      .refine(
        (val) => Number(val.toFixed(2)) === val,
        'Amount cannot have more than 2 decimal places',
      ),
  ),
  category: ExpenseCategoryEnum.default('OTHER'),
  vendor: z.string().optional().nullable(),
  receiptUrl: z
    .string()
    .url('Must be a valid URL link')
    .optional()
    .or(z.literal('')),
  expenseDate: z
    .string()
    .min(1, 'Date is required')
    .refine(
      (date) => new Date(date) <= new Date(),
      'Expense date cannot be in the future',
    ),
  errandId: z.string().min(1, 'Please map this to a valid Errand loop'),
})
