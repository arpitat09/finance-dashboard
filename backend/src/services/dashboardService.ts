import { prisma } from '../config';
import { toDecimal, roundMoney } from '../utils/money';

export const dashboardService = {
  async getDashboardSummary(userId: string, period: string = 'this-month') {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (period === 'last-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59, 999);
    } else if (period === '3m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 3, 0, 23, 59, 59, 999);
    } else if (period === '6m') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth() - 6, 0, 23, 59, 59, 999);
    } else if (period === 'this-year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
      prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
    } else {
      // Default: 'this-month'
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    }

    // Current period aggregations
    const currentAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
      _count: { id: true },
    });

    const incomeSum = toDecimal(currentAgg.find((a) => a.type === 'INCOME')?._sum.amount || 0);
    const expenseSum = toDecimal(currentAgg.find((a) => a.type === 'EXPENSE')?._sum.amount || 0);
    const netSavings = incomeSum.minus(expenseSum);
    const savingsRate = incomeSum.isZero() ? 0 : netSavings.dividedBy(incomeSum).times(100).toNumber();

    // Previous period aggregations
    const prevAgg = await prisma.transaction.groupBy({
      by: ['type'],
      where: {
        userId,
        date: { gte: prevStartDate, lte: prevEndDate },
      },
      _sum: { amount: true },
    });

    const prevIncome = toDecimal(prevAgg.find((a) => a.type === 'INCOME')?._sum.amount || 0);
    const prevExpense = toDecimal(prevAgg.find((a) => a.type === 'EXPENSE')?._sum.amount || 0);

    const incomeChange = prevIncome.isZero()
      ? 0
      : incomeSum.minus(prevIncome).dividedBy(prevIncome).times(100).toNumber();
    const expenseChange = prevExpense.isZero()
      ? 0
      : expenseSum.minus(prevExpense).dividedBy(prevExpense).times(100).toNumber();

    // Total Net Worth from all accounts
    const accounts = await prisma.account.findMany({ where: { userId } });
    const totalBalance = accounts.reduce((sum, acc) => {
      if (acc.type === 'CREDIT') return sum.minus(toDecimal(acc.balance));
      return sum.plus(toDecimal(acc.balance));
    }, toDecimal(0));

    return {
      period,
      totalBalance: roundMoney(totalBalance),
      income: roundMoney(incomeSum),
      expenses: roundMoney(expenseSum),
      savings: roundMoney(netSavings),
      savingsRate: Math.round(savingsRate * 10) / 10,
      incomeChange: Math.round(incomeChange * 10) / 10,
      expenseChange: Math.round(expenseChange * 10) / 10,
      transactionCount: currentAgg.reduce((s, a) => s + a._count.id, 0),
    };
  },

  async getCashFlowTrend(userId: string, timeframe: string = '30D') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case '7D':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30D':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case '6M':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1Y':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
      select: {
        date: true,
        type: true,
        amount: true,
      },
    });

    // Bucket by day or month depending on duration
    const isMultiMonth = timeframe === '3M' || timeframe === '6M' || timeframe === '1Y';
    const timelineMap: Record<string, { income: number; expense: number; net: number; balance: number }> = {};

    let runningBalance = 0;

    for (const t of transactions) {
      const key = isMultiMonth
        ? t.date.toISOString().slice(0, 7) // YYYY-MM
        : t.date.toISOString().slice(0, 10); // YYYY-MM-DD

      if (!timelineMap[key]) {
        timelineMap[key] = { income: 0, expense: 0, net: 0, balance: 0 };
      }

      const amt = toDecimal(t.amount).toNumber();
      if (t.type === 'INCOME') {
        timelineMap[key].income += amt;
        runningBalance += amt;
      } else {
        timelineMap[key].expense += amt;
        runningBalance -= amt;
      }
      timelineMap[key].net = timelineMap[key].income - timelineMap[key].expense;
      timelineMap[key].balance = runningBalance;
    }

    const labels = Object.keys(timelineMap).sort();
    const data = labels.map((label) => ({
      date: label,
      income: roundMoney(timelineMap[label].income),
      expense: roundMoney(timelineMap[label].expense),
      net: roundMoney(timelineMap[label].net),
      balance: roundMoney(timelineMap[label].balance),
    }));

    return { timeframe, trend: data };
  },

  async getCategoryBreakdown(userId: string, period: string = 'this-month') {
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    if (period === 'last-month') startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    if (period === '3m') startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    if (period === 'this-year') startDate = new Date(now.getFullYear(), 0, 1);

    const expenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: startDate },
      },
      include: { category: true },
    });

    const categoryMap: Record<string, { id: string; name: string; icon: string; color: string; amount: number; count: number }> = {};
    let totalExpense = 0;

    for (const t of expenses) {
      const catId = t.categoryId;
      const amt = toDecimal(t.amount).toNumber();
      totalExpense += amt;

      if (!categoryMap[catId]) {
        categoryMap[catId] = {
          id: catId,
          name: t.category.name,
          icon: t.category.icon,
          color: t.category.color,
          amount: 0,
          count: 0,
        };
      }
      categoryMap[catId].amount += amt;
      categoryMap[catId].count += 1;
    }

    const categories = Object.values(categoryMap)
      .map((c) => ({
        ...c,
        amount: roundMoney(c.amount),
        percentage: totalExpense > 0 ? Math.round((c.amount / totalExpense) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalExpense: roundMoney(totalExpense),
      categories,
    };
  },

  async getFinancialHealthScore(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [txAgg, budgets, recurring, goals] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['type'],
        where: { userId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.recurringTransaction.findMany({ where: { userId, isActive: true, type: 'EXPENSE' } }),
      prisma.goal.findMany({ where: { userId } }),
    ]);

    const income = toDecimal(txAgg.find((a) => a.type === 'INCOME')?._sum.amount || 0).toNumber();
    const expense = toDecimal(txAgg.find((a) => a.type === 'EXPENSE')?._sum.amount || 0).toNumber();

    // 1. Savings Rate Score (Max 30)
    let savingsRateScore = 5;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;
    if (savingsRate >= 30) savingsRateScore = 30;
    else if (savingsRate >= 20) savingsRateScore = 24;
    else if (savingsRate >= 10) savingsRateScore = 16;
    else if (savingsRate > 0) savingsRateScore = 10;

    // 2. Budget Adherence Score (Max 25)
    let budgetScore = 25;
    if (budgets.length > 0) {
      // Check exceeded budgets
      let exceeded = 0;
      for (const b of budgets) {
        const spent = await prisma.transaction.aggregate({
          where: { userId, categoryId: b.categoryId, type: 'EXPENSE', date: { gte: startOfMonth } },
          _sum: { amount: true },
        });
        const spentAmt = toDecimal(spent._sum.amount || 0).toNumber();
        const budgetAmt = toDecimal(b.amount).toNumber();
        if (spentAmt > budgetAmt) exceeded++;
      }
      if (exceeded === 1) budgetScore = 16;
      else if (exceeded >= 2) budgetScore = 8;
    }

    // 3. Recurring Commitment Burden (Max 20)
    let recurringScore = 20;
    const recurringMonthly = recurring.reduce((s, r) => s + toDecimal(r.amount).toNumber(), 0);
    const recurringRatio = income > 0 ? (recurringMonthly / income) * 100 : 50;
    if (recurringRatio <= 25) recurringScore = 20;
    else if (recurringRatio <= 40) recurringScore = 14;
    else recurringScore = 7;

    // 4. Goals Progress (Max 25)
    let goalScore = 20;
    if (goals.length > 0) {
      const avgProgress =
        goals.reduce((sum, g) => {
          const t = toDecimal(g.targetAmount).toNumber();
          const c = toDecimal(g.currentAmount).toNumber();
          return sum + (t > 0 ? (c / t) * 100 : 0);
        }, 0) / goals.length;

      if (avgProgress >= 70) goalScore = 25;
      else if (avgProgress >= 40) goalScore = 18;
      else if (avgProgress >= 15) goalScore = 12;
      else goalScore = 7;
    }

    const totalScore = Math.min(100, savingsRateScore + budgetScore + recurringScore + goalScore);

    let status = 'Needs Attention';
    let summaryText = 'Keep building consistency in tracking expenses and growing your emergency savings.';
    if (totalScore >= 80) {
      status = 'Excellent';
      summaryText = 'Outstanding financial discipline! Strong savings rate and tight budget control.';
    } else if (totalScore >= 65) {
      status = 'Good';
      summaryText = 'Solid financial standing with healthy habits and room for minor budget optimizations.';
    } else if (totalScore >= 50) {
      status = 'Moderate';
      summaryText = 'On track, but watching high-spending categories will boost your monthly savings.';
    }

    return {
      score: totalScore,
      status,
      summaryText,
      metrics: {
        savingsRate: Math.round(savingsRate * 10) / 10,
        savingsRateScore,
        budgetScore,
        recurringMonthly: roundMoney(recurringMonthly),
        recurringScore,
        goalScore,
      },
    };
  },
};
