import { prisma } from '../config';
import { roundMoney } from '../utils/money';
import { dashboardService } from './dashboardService';
import { budgetService } from './budgetService';
import { goalService } from './goalService';

export const exportService = {
  async exportTransactionsCSV(userId: string) {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true, account: true },
      orderBy: { date: 'desc' },
    });

    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Account', 'Payment Method', 'Notes'];
    const rows = transactions.map((t) => [
      t.date.toISOString().slice(0, 10),
      `"${t.description.replace(/"/g, '""')}"`,
      roundMoney(t.amount),
      t.type,
      `"${t.category.name.replace(/"/g, '""')}"`,
      `"${(t.account?.name || 'Unassigned').replace(/"/g, '""')}"`,
      t.paymentMethod,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  },

  async exportFullUserDataJSON(userId: string) {
    const [user, accounts, categories, transactions, budgets, goals, recurring] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, currency: true, timezone: true, createdAt: true },
      }),
      prisma.account.findMany({ where: { userId } }),
      prisma.category.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.recurringTransaction.findMany({ where: { userId } }),
    ]);

    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user,
      accounts: accounts.map((a) => ({ ...a, balance: roundMoney(a.balance) })),
      categories,
      transactions: transactions.map((t) => ({ ...t, amount: roundMoney(t.amount) })),
      budgets: budgets.map((b) => ({ ...b, amount: roundMoney(b.amount) })),
      goals: goals.map((g) => ({
        ...g,
        targetAmount: roundMoney(g.targetAmount),
        currentAmount: roundMoney(g.currentAmount),
      })),
      recurringTransactions: recurring.map((r) => ({ ...r, amount: roundMoney(r.amount) })),
    };
  },

  async getFinancialReport(userId: string, period: string = 'this-month') {
    const [summary, breakdown, budgets, goals] = await Promise.all([
      dashboardService.getDashboardSummary(userId, period),
      dashboardService.getCategoryBreakdown(userId, period),
      budgetService.listBudgets(userId),
      goalService.listGoals(userId),
    ]);

    return {
      generatedAt: new Date().toISOString(),
      period,
      summary,
      categoryBreakdown: breakdown,
      budgets: budgets.budgets,
      goals: goals.goals,
    };
  },
};
