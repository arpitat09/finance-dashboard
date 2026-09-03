import { prisma } from '../config';
import { toDecimal, roundMoney } from '../utils/money';

export const analyticsService = {
  async getAnalyticsOverview(userId: string) {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      include: { category: true },
      orderBy: { date: 'asc' },
    });

    // 1. Monthly Trends (Income vs Expense vs Savings)
    const monthMap: Record<string, { month: string; income: number; expense: number; savings: number; savingsRate: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const monthName = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap[key] = { month: monthName, income: 0, expense: 0, savings: 0, savingsRate: 0 };
    }

    // 2. Day of Week distribution
    const dayOfWeek = [
      { day: 'Sun', amount: 0, count: 0 },
      { day: 'Mon', amount: 0, count: 0 },
      { day: 'Tue', amount: 0, count: 0 },
      { day: 'Wed', amount: 0, count: 0 },
      { day: 'Thu', amount: 0, count: 0 },
      { day: 'Fri', amount: 0, count: 0 },
      { day: 'Sat', amount: 0, count: 0 },
    ];

    // 3. Payment Method breakdown
    const paymentMethods: Record<string, { method: string; amount: number; count: number }> = {};

    let totalIncomeAllTime = 0;
    let totalExpenseAllTime = 0;
    let expenseCount = 0;
    let largestExpense = { description: 'None', amount: 0, category: 'N/A', date: '' };
    const activeDates = new Set<string>();

    for (const t of transactions) {
      const monthKey = t.date.toISOString().slice(0, 7);
      const amt = toDecimal(t.amount).toNumber();
      activeDates.add(t.date.toISOString().slice(0, 10));

      if (monthMap[monthKey]) {
        if (t.type === 'INCOME') {
          monthMap[monthKey].income += amt;
        } else {
          monthMap[monthKey].expense += amt;
        }
      }

      if (t.type === 'INCOME') {
        totalIncomeAllTime += amt;
      } else {
        totalExpenseAllTime += amt;
        expenseCount += 1;

        const dayIdx = t.date.getDay();
        dayOfWeek[dayIdx].amount += amt;
        dayOfWeek[dayIdx].count += 1;

        const method = t.paymentMethod || 'UPI';
        if (!paymentMethods[method]) paymentMethods[method] = { method, amount: 0, count: 0 };
        paymentMethods[method].amount += amt;
        paymentMethods[method].count += 1;

        if (amt > largestExpense.amount) {
          largestExpense = {
            description: t.description,
            amount: roundMoney(amt),
            category: t.category.name,
            date: t.date.toISOString().slice(0, 10),
          };
        }
      }
    }

    const monthlyTrends = Object.values(monthMap).map((m) => {
      const inc = roundMoney(m.income);
      const exp = roundMoney(m.expense);
      const net = roundMoney(inc - exp);
      const rate = inc > 0 ? Math.round((net / inc) * 1000) / 10 : 0;
      return {
        ...m,
        income: inc,
        expense: exp,
        savings: net,
        savingsRate: rate,
      };
    });

    const activeDaysCount = Math.max(1, activeDates.size);
    const avgDailySpend = roundMoney(totalExpenseAllTime / activeDaysCount);
    const avgTransactionSize = expenseCount > 0 ? roundMoney(totalExpenseAllTime / expenseCount) : 0;
    const avgMonthlyExpense = monthlyTrends.length > 0 ? roundMoney(totalExpenseAllTime / monthlyTrends.length) : 0;
    const netSavings = roundMoney(totalIncomeAllTime - totalExpenseAllTime);
    const overallSavingsRate = totalIncomeAllTime > 0 ? Math.round((netSavings / totalIncomeAllTime) * 1000) / 10 : 0;

    // Heatmap: Day of Week totals
    const dayHeatmap = dayOfWeek.map((d) => ({
      ...d,
      amount: roundMoney(d.amount),
      percentage: totalExpenseAllTime > 0 ? Math.round((d.amount / totalExpenseAllTime) * 1000) / 10 : 0,
    }));

    // Find highest spending day
    const highestSpendingDay = [...dayHeatmap].sort((a, b) => b.amount - a.amount)[0]?.day || 'Saturday';

    return {
      monthlyTrends,
      dayHeatmap,
      paymentMethods: Object.values(paymentMethods).map((p) => ({
        ...p,
        amount: roundMoney(p.amount),
      })),
      statistics: {
        avgDailySpend,
        avgTransactionSize,
        avgMonthlyExpense,
        highestSpendingDay,
        largestExpense,
        totalIncomeAnalyzed: roundMoney(totalIncomeAllTime),
        totalExpensesAnalyzed: roundMoney(totalExpenseAllTime),
        transactionCount: transactions.length,
        totalTransactions: transactions.length,
        savingsRate: overallSavingsRate,
      },
    };
  },
};
