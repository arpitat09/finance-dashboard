import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { toDecimal, roundMoney } from '../utils/money';
import { Frequency, TransactionType } from '@prisma/client';

export const recurringService = {
  async listRecurring(userId: string) {
    const items = await prisma.recurringTransaction.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        account: { select: { id: true, name: true, type: true } },
      },
      orderBy: { nextDate: 'asc' },
    });

    const now = new Date();

    const formatted = items.map((item) => {
      const diff = new Date(item.nextDate).getTime() - now.getTime();
      const daysUntil = Math.ceil(diff / (1000 * 60 * 60 * 24));

      return {
        ...item,
        amount: roundMoney(item.amount),
        daysUntil,
      };
    });

    // Calculate normalized monthly commitment
    const monthlyTotal = formatted
      .filter((i) => i.isActive && i.type === 'EXPENSE')
      .reduce((sum, i) => {
        let monthlyEquiv = i.amount;
        if (i.frequency === 'WEEKLY') monthlyEquiv = (i.amount * 52) / 12;
        if (i.frequency === 'DAILY') monthlyEquiv = i.amount * 30;
        if (i.frequency === 'QUARTERLY') monthlyEquiv = i.amount / 3;
        if (i.frequency === 'YEARLY') monthlyEquiv = i.amount / 12;
        return sum + monthlyEquiv;
      }, 0);

    return {
      recurring: formatted,
      summary: {
        activeCount: formatted.filter((i) => i.isActive).length,
        monthlyCommitment: roundMoney(monthlyTotal),
        upcomingThisWeek: formatted.filter((i) => i.isActive && i.daysUntil >= 0 && i.daysUntil <= 7).length,
      },
    };
  },

  async createRecurring(
    userId: string,
    data: {
      description: string;
      amount: number;
      type?: TransactionType;
      categoryId: string;
      accountId?: string | null;
      frequency?: Frequency;
      nextDate: string;
      startDate?: string;
      endDate?: string | null;
      isActive?: boolean;
    }
  ) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw ApiError.badRequest('Invalid category');

    const item = await prisma.recurringTransaction.create({
      data: {
        userId,
        description: data.description.trim(),
        amount: toDecimal(data.amount).toString(),
        type: data.type || 'EXPENSE',
        categoryId: data.categoryId,
        accountId: data.accountId || null,
        frequency: data.frequency || 'MONTHLY',
        nextDate: new Date(data.nextDate),
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
      include: { category: true, account: true },
    });

    return {
      ...item,
      amount: roundMoney(item.amount),
    };
  },

  async updateRecurring(
    userId: string,
    id: string,
    data: {
      description?: string;
      amount?: number;
      type?: TransactionType;
      categoryId?: string;
      accountId?: string | null;
      frequency?: Frequency;
      nextDate?: string;
      startDate?: string;
      endDate?: string | null;
      isActive?: boolean;
    }
  ) {
    const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Recurring payment not found or unauthorized');

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description.trim() }),
        ...(data.amount !== undefined && { amount: toDecimal(data.amount).toString() }),
        ...(data.type && { type: data.type }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.accountId !== undefined && { accountId: data.accountId }),
        ...(data.frequency && { frequency: data.frequency }),
        ...(data.nextDate && { nextDate: new Date(data.nextDate) }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: { category: true, account: true },
    });

    return {
      ...updated,
      amount: roundMoney(updated.amount),
    };
  },

  async deleteRecurring(userId: string, id: string) {
    const existing = await prisma.recurringTransaction.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Recurring payment not found or unauthorized');

    await prisma.recurringTransaction.delete({ where: { id } });
    return { message: 'Recurring payment deleted successfully' };
  },

  async processDueRecurring(userId?: string) {
    const now = new Date();
    const dueItems = await prisma.recurringTransaction.findMany({
      where: {
        isActive: true,
        nextDate: { lte: now },
        ...(userId && { userId }),
      },
    });

    const processed = [];

    for (const item of dueItems) {
      // Create transaction
      const transaction = await prisma.transaction.create({
        data: {
          userId: item.userId,
          accountId: item.accountId,
          categoryId: item.categoryId,
          type: item.type,
          amount: item.amount,
          description: `Recurring: ${item.description}`,
          date: item.nextDate,
          paymentMethod: 'NET_BANKING',
          isRecurring: true,
          recurringTransactionId: item.id,
        },
      });

      // Update account balance
      if (item.accountId) {
        const delta = item.type === 'INCOME' ? toDecimal(item.amount) : toDecimal(item.amount).negated();
        await prisma.account.update({
          where: { id: item.accountId },
          data: { balance: { increment: delta.toString() } },
        });
      }

      // Calculate next execution date
      const nextDate = new Date(item.nextDate);
      switch (item.frequency) {
        case 'DAILY':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'WEEKLY':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'MONTHLY':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextDate.setMonth(nextDate.getMonth() + 3);
          break;
        case 'YEARLY':
          nextDate.setFullYear(nextDate.getFullYear() + 1);
          break;
      }

      await prisma.recurringTransaction.update({
        where: { id: item.id },
        data: { nextDate },
      });

      await prisma.notification.create({
        data: {
          userId: item.userId,
          title: `Recurring Payment Processed 💳`,
          message: `Your scheduled payment of ₹${roundMoney(item.amount)} for "${item.description}" has been recorded.`,
          type: 'RECURRING_DUE',
        },
      });

      processed.push(transaction);
    }

    return { processedCount: processed.length };
  },
};
