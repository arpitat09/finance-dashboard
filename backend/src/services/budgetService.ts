import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { toDecimal, roundMoney } from '../utils/money';
import { BudgetPeriod } from '@prisma/client';

export const budgetService = {
  async listBudgets(userId: string) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Determine current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgetsWithMetrics = await Promise.all(
      budgets.map(async (b) => {
        // Query spent amount in period
        const spentAgg = await prisma.transaction.aggregate({
          where: {
            userId,
            categoryId: b.categoryId,
            type: 'EXPENSE',
            date: {
              gte: b.startDate > startOfMonth ? b.startDate : startOfMonth,
              lte: b.endDate && b.endDate < endOfMonth ? b.endDate : endOfMonth,
            },
          },
          _sum: { amount: true },
        });

        const budgetAmount = toDecimal(b.amount);
        const spent = toDecimal(spentAgg._sum.amount || 0);
        const remaining = budgetAmount.minus(spent);
        const percentage = budgetAmount.isZero() ? 0 : spent.dividedBy(budgetAmount).times(100).toNumber();

        let status: 'NORMAL' | 'APPROACHING' | 'EXCEEDED' = 'NORMAL';
        if (percentage >= 100) {
          status = 'EXCEEDED';
        } else if (percentage >= 80) {
          status = 'APPROACHING';
        }

        return {
          id: b.id,
          name: b.name,
          categoryId: b.categoryId,
          category: b.category,
          amount: roundMoney(budgetAmount),
          spent: roundMoney(spent),
          remaining: roundMoney(remaining),
          percentage: Math.min(1000, Math.round(percentage * 10) / 10),
          period: b.period,
          status,
          startDate: b.startDate,
          endDate: b.endDate,
        };
      })
    );

    const totalBudget = budgetsWithMetrics.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgetsWithMetrics.reduce((sum, b) => sum + b.spent, 0);
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      budgets: budgetsWithMetrics,
      summary: {
        totalBudget: roundMoney(totalBudget),
        totalSpent: roundMoney(totalSpent),
        totalRemaining: roundMoney(Math.max(0, totalBudget - totalSpent)),
        overallPercentage: Math.round(overallPercentage * 10) / 10,
        exceededCount: budgetsWithMetrics.filter((b) => b.status === 'EXCEEDED').length,
        approachingCount: budgetsWithMetrics.filter((b) => b.status === 'APPROACHING').length,
      },
    };
  },

  async createBudget(
    userId: string,
    data: {
      categoryId: string;
      name: string;
      amount: number;
      period?: BudgetPeriod;
      startDate?: string;
      endDate?: string | null;
    }
  ) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
    });
    if (!category) throw ApiError.badRequest('Invalid category');

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId,
        name: data.name.trim(),
        amount: toDecimal(data.amount).toString(),
        period: data.period || 'MONTHLY',
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
      include: {
        category: true,
      },
    });

    return {
      ...budget,
      amount: roundMoney(budget.amount),
    };
  },

  async updateBudget(
    userId: string,
    id: string,
    data: {
      name?: string;
      amount?: number;
      categoryId?: string;
      period?: BudgetPeriod;
      startDate?: string;
      endDate?: string | null;
    }
  ) {
    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Budget not found or unauthorized');

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
      });
      if (!category) throw ApiError.badRequest('Invalid category');
    }

    const updated = await prisma.budget.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.amount !== undefined && { amount: toDecimal(data.amount).toString() }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.period && { period: data.period }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
      },
      include: { category: true },
    });

    return {
      ...updated,
      amount: roundMoney(updated.amount),
    };
  },

  async deleteBudget(userId: string, id: string) {
    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Budget not found or unauthorized');

    await prisma.budget.delete({ where: { id } });
    return { message: 'Budget deleted successfully' };
  },
};
