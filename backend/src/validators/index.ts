import { z } from 'zod';

// Auth Validators
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR').optional(),
  timezone: z.string().default('Asia/Kolkata').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  avatar: z.string().url().nullable().optional(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  timezone: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Transaction Validators
export const createTransactionSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Category is required'),
  accountId: z.string().optional().nullable(),
  date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  paymentMethod: z.enum(['CASH', 'UPI', 'CARD', 'NET_BANKING', 'TRANSFER', 'OTHER']).default('UPI').optional(),
  notes: z.string().max(1000).optional().nullable(),
  isRecurring: z.boolean().default(false).optional(),
  recurringTransactionId: z.string().optional().nullable(),
});

export const updateTransactionSchema = createTransactionSchema.partial();

export const queryTransactionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  categoryId: z.string().optional(),
  accountId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(['date', 'amount', 'description', 'createdAt']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Budget Validators
export const createBudgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(1, 'Budget name is required').max(100),
  amount: z.number().positive('Budget amount must be positive'),
  period: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']).default('MONTHLY'),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
});

export const updateBudgetSchema = createBudgetSchema.partial();

// Goal Validators
export const createGoalSchema = z.object({
  name: z.string().min(1, 'Goal name is required').max(100),
  targetAmount: z.number().positive('Target amount must be positive'),
  currentAmount: z.number().min(0, 'Current amount cannot be negative').default(0),
  deadline: z.string().optional().nullable(),
  color: z.string().default('#F97316').optional(),
  icon: z.string().default('Target').optional(),
  status: z.enum(['IN_PROGRESS', 'COMPLETED', 'PAUSED']).default('IN_PROGRESS').optional(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const contributeGoalSchema = z.object({
  amount: z.number().positive('Contribution amount must be positive'),
  accountId: z.string().optional().nullable(),
  createTransaction: z.boolean().default(false).optional(),
});

// Account Validators
export const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['CASH', 'BANK', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'WALLET']).default('BANK'),
  balance: z.number().default(0),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR').optional(),
});

export const updateAccountSchema = createAccountSchema.partial();

// Recurring Validators
export const createRecurringSchema = z.object({
  description: z.string().min(1, 'Description is required').max(255),
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
  categoryId: z.string().min(1, 'Category is required'),
  accountId: z.string().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']).default('MONTHLY'),
  nextDate: z.string().min(1, 'Next execution date is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional().nullable(),
  isActive: z.boolean().default(true).optional(),
});

export const updateRecurringSchema = createRecurringSchema.partial();

// Category Validators
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  type: z.enum(['INCOME', 'EXPENSE']).default('EXPENSE'),
  icon: z.string().default('CircleDot').optional(),
  color: z.string().default('#F97316').optional(),
});

export const updateCategorySchema = createCategorySchema.partial();
