import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { toDecimal, roundMoney } from '../utils/money';
import { AccountType } from '@prisma/client';

export const accountService = {
  async listAccounts(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    const netWorth = accounts.reduce((sum, acc) => {
      // Credit card balances are liabilities if positive debt
      if (acc.type === 'CREDIT') {
        return sum.minus(toDecimal(acc.balance));
      }
      return sum.plus(toDecimal(acc.balance));
    }, toDecimal(0));

    return {
      accounts: accounts.map((acc) => ({
        ...acc,
        balance: roundMoney(acc.balance),
      })),
      netWorth: roundMoney(netWorth),
    };
  },

  async getAccountById(userId: string, id: string) {
    const account = await prisma.account.findFirst({
      where: { id, userId },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    if (!account) throw ApiError.notFound('Account not found');
    return {
      ...account,
      balance: roundMoney(account.balance),
    };
  },

  async createAccount(userId: string, data: { name: string; type: AccountType; balance?: number; currency?: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const account = await prisma.account.create({
      data: {
        userId,
        name: data.name.trim(),
        type: data.type,
        balance: toDecimal(data.balance || 0).toString(),
        currency: data.currency || user.currency,
      },
    });

    return {
      ...account,
      balance: roundMoney(account.balance),
    };
  },

  async updateAccount(userId: string, id: string, data: { name?: string; type?: AccountType; balance?: number; currency?: string }) {
    const account = await prisma.account.findFirst({ where: { id, userId } });
    if (!account) throw ApiError.notFound('Account not found');

    const updated = await prisma.account.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.type && { type: data.type }),
        ...(data.balance !== undefined && { balance: toDecimal(data.balance).toString() }),
        ...(data.currency && { currency: data.currency }),
      },
    });

    return {
      ...updated,
      balance: roundMoney(updated.balance),
    };
  },

  async deleteAccount(userId: string, id: string) {
    const account = await prisma.account.findFirst({
      where: { id, userId },
      include: { _count: { select: { transactions: true } } },
    });

    if (!account) throw ApiError.notFound('Account not found');

    // Soft detach transactions or block if preferred
    if (account._count.transactions > 0) {
      await prisma.transaction.updateMany({
        where: { accountId: id },
        data: { accountId: null },
      });
    }

    await prisma.account.delete({ where: { id } });
    return { message: 'Account deleted successfully' };
  },
};
