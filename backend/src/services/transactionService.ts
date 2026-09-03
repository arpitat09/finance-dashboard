import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { toDecimal, roundMoney } from '../utils/money';
import { TransactionType, PaymentMethod, Prisma } from '@prisma/client';

export interface ListTransactionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'INCOME' | 'EXPENSE';
  categoryId?: string;
  accountId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'date' | 'amount' | 'description' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export const transactionService = {
  async listTransactions(userId: string, query: ListTransactionsQuery) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(query.type && { type: query.type }),
      ...(query.categoryId && { categoryId: query.categoryId }),
      ...(query.accountId && { accountId: query.accountId }),
      ...(query.search && {
        OR: [
          { description: { contains: query.search, mode: 'insensitive' } },
          { notes: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.startDate || query.endDate
        ? {
            date: {
              ...(query.startDate && { gte: new Date(query.startDate) }),
              ...(query.endDate && { lte: new Date(new Date(query.endDate).setHours(23, 59, 59, 999)) }),
            },
          }
        : {}),
      ...(query.minAmount || query.maxAmount
        ? {
            amount: {
              ...(query.minAmount !== undefined && { gte: query.minAmount }),
              ...(query.maxAmount !== undefined && { lte: query.maxAmount }),
            },
          }
        : {}),
    };

    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';

    const [total, transactions, aggregated] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, icon: true, color: true, type: true } },
          account: { select: { id: true, name: true, type: true } },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where,
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = aggregated.find((a) => a.type === 'INCOME')?._sum.amount || 0;
    const totalExpense = aggregated.find((a) => a.type === 'EXPENSE')?._sum.amount || 0;

    return {
      transactions: transactions.map((t) => ({
        ...t,
        amount: roundMoney(t.amount),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
        totalIncome: roundMoney(totalIncome),
        totalExpense: roundMoney(totalExpense),
        netSavings: roundMoney(toDecimal(totalIncome).minus(toDecimal(totalExpense))),
      },
    };
  },

  async getTransactionById(userId: string, id: string) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId },
      include: {
        category: true,
        account: true,
        recurringTransaction: true,
      },
    });

    if (!transaction) throw ApiError.notFound('Transaction not found or unauthorized');

    return {
      ...transaction,
      amount: roundMoney(transaction.amount),
    };
  },

  async createTransaction(
    userId: string,
    data: {
      description: string;
      amount: number;
      type: TransactionType;
      categoryId: string;
      accountId?: string | null;
      date: string | Date;
      paymentMethod?: PaymentMethod;
      notes?: string | null;
      isRecurring?: boolean;
      recurringTransactionId?: string | null;
    }
  ) {
    // Validate category ownership
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { userId: null }],
      },
    });

    if (!category) throw ApiError.badRequest('Invalid category selected');

    // Validate account ownership if specified
    if (data.accountId) {
      const account = await prisma.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) throw ApiError.badRequest('Invalid account selected');
    }

    const txDate = new Date(data.date);

    // Create transaction in transaction block with account balance update
    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId,
          description: data.description.trim(),
          amount: toDecimal(data.amount).toString(),
          type: data.type,
          categoryId: data.categoryId,
          accountId: data.accountId || null,
          date: txDate,
          paymentMethod: data.paymentMethod || 'UPI',
          notes: data.notes?.trim() || null,
          isRecurring: data.isRecurring || false,
          recurringTransactionId: data.recurringTransactionId || null,
        },
        include: {
          category: true,
          account: true,
        },
      });

      // Update account balance if accountId is provided
      if (data.accountId) {
        const delta = data.type === 'INCOME' ? toDecimal(data.amount) : toDecimal(data.amount).negated();
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: {
              increment: delta.toString(),
            },
          },
        });
      }

      // Check for large transaction alert (> ₹25,000 or $500)
      if (data.type === 'EXPENSE' && data.amount >= 25000) {
        await tx.notification.create({
          data: {
            userId,
            title: 'Unusually Large Expense ⚠️',
            message: `You spent ${data.amount} on "${data.description}". Keep an eye on high-value expenses.`,
            type: 'LARGE_TRANSACTION',
          },
        });
      }

      return transaction;
    });

    return {
      ...result,
      amount: roundMoney(result.amount),
    };
  },

  async updateTransaction(
    userId: string,
    id: string,
    data: {
      description?: string;
      amount?: number;
      type?: TransactionType;
      categoryId?: string;
      accountId?: string | null;
      date?: string | Date;
      paymentMethod?: PaymentMethod;
      notes?: string | null;
      isRecurring?: boolean;
    }
  ) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) throw ApiError.notFound('Transaction not found or unauthorized');

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
      });
      if (!category) throw ApiError.badRequest('Invalid category selected');
    }

    if (data.accountId) {
      const account = await prisma.account.findFirst({
        where: { id: data.accountId, userId },
      });
      if (!account) throw ApiError.badRequest('Invalid account selected');
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Revert previous account balance impact
      if (existing.accountId) {
        const prevReversal =
          existing.type === 'INCOME'
            ? toDecimal(existing.amount).negated()
            : toDecimal(existing.amount);
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: prevReversal.toString() } },
        });
      }

      const newAmount = data.amount !== undefined ? toDecimal(data.amount) : toDecimal(existing.amount);
      const newType = data.type || existing.type;
      const newAccountId = data.accountId !== undefined ? data.accountId : existing.accountId;

      // Apply new account balance impact
      if (newAccountId) {
        const newDelta = newType === 'INCOME' ? newAmount : newAmount.negated();
        await tx.account.update({
          where: { id: newAccountId },
          data: { balance: { increment: newDelta.toString() } },
        });
      }

      const result = await tx.transaction.update({
        where: { id },
        data: {
          ...(data.description && { description: data.description.trim() }),
          ...(data.amount !== undefined && { amount: newAmount.toString() }),
          ...(data.type && { type: data.type }),
          ...(data.categoryId && { categoryId: data.categoryId }),
          ...(data.accountId !== undefined && { accountId: data.accountId }),
          ...(data.date && { date: new Date(data.date) }),
          ...(data.paymentMethod && { paymentMethod: data.paymentMethod }),
          ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
          ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
        },
        include: {
          category: true,
          account: true,
        },
      });

      return result;
    });

    return {
      ...updated,
      amount: roundMoney(updated.amount),
    };
  },

  async deleteTransaction(userId: string, id: string) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) throw ApiError.notFound('Transaction not found or unauthorized');

    await prisma.$transaction(async (tx) => {
      // Revert account balance
      if (existing.accountId) {
        const reversal =
          existing.type === 'INCOME'
            ? toDecimal(existing.amount).negated()
            : toDecimal(existing.amount);
        await tx.account.update({
          where: { id: existing.accountId },
          data: { balance: { increment: reversal.toString() } },
        });
      }

      await tx.transaction.delete({ where: { id } });
    });

    return { message: 'Transaction deleted successfully' };
  },
};
