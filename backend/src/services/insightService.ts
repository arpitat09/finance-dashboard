import { prisma } from '../config';
import { toDecimal, roundMoney } from '../utils/money';

export const insightService = {
  async generateInsights(userId: string) {
    const now = new Date();
    const currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    const [currentTxs, prevTxs, recurring, goals, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId, date: { gte: currentStart } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId, date: { gte: prevStart, lte: prevEnd } },
      }),
      prisma.recurringTransaction.findMany({
        where: { userId, isActive: true },
      }),
      prisma.goal.findMany({
        where: { userId },
      }),
      prisma.budget.findMany({
        where: { userId },
        include: { category: true },
      }),
    ]);

    const currentIncome = currentTxs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + toDecimal(t.amount).toNumber(), 0);
    const currentExpenses = currentTxs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toDecimal(t.amount).toNumber(), 0);
    const prevExpenses = prevTxs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + toDecimal(t.amount).toNumber(), 0);

    const insights = [];

    // 1. Top spending category
    const catMap: Record<string, { name: string; amount: number }> = {};
    for (const t of currentTxs.filter((t) => t.type === 'EXPENSE')) {
      const name = t.category.name;
      if (!catMap[name]) catMap[name] = { name, amount: 0 };
      catMap[name].amount += toDecimal(t.amount).toNumber();
    }
    const topCat = Object.values(catMap).sort((a, b) => b.amount - a.amount)[0];

    if (topCat && currentExpenses > 0) {
      const pct = Math.round((topCat.amount / currentExpenses) * 100);
      insights.push({
        id: 'top-spending',
        type: 'category',
        icon: 'Trophy',
        color: '#F97316',
        title: 'Top Expense Category',
        value: topCat.name,
        description: `₹${roundMoney(topCat.amount)} spent this month — accounts for ${pct}% of your total expenses.`,
        priority: 'high',
      });
    }

    // 2. Month-over-month expense change
    if (prevExpenses > 0 && currentExpenses > 0) {
      const momChange = ((currentExpenses - prevExpenses) / prevExpenses) * 100;
      const isPositive = momChange <= 0;
      insights.push({
        id: 'mom-trend',
        type: 'trend',
        icon: isPositive ? 'TrendingDown' : 'TrendingUp',
        color: isPositive ? '#22C55E' : '#EF4444',
        title: 'Month-over-Month Spending',
        value: `${momChange >= 0 ? '+' : ''}${Math.round(momChange * 10) / 10}%`,
        description: isPositive
          ? `Great job! Your spending is down ${Math.abs(Math.round(momChange))}% compared to last month.`
          : `Spending increased by ${Math.round(momChange)}% compared to this point last month.`,
        priority: 'medium',
      });
    }

    // 3. Savings Rate
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;
    insights.push({
      id: 'savings-rate',
      type: 'savings',
      icon: 'PiggyBank',
      color: savingsRate >= 20 ? '#22C55E' : '#F59E0B',
      title: 'Current Savings Rate',
      value: `${Math.round(savingsRate * 10) / 10}%`,
      description:
        savingsRate >= 30
          ? 'Exceptional savings rate! You are well above the recommended 20% benchmark.'
          : savingsRate >= 20
          ? 'Healthy savings rate meeting standard personal financial targets.'
          : 'Consider reviewing discretionary dining and shopping to boost savings.',
      priority: 'high',
    });

    // 4. Weekend vs Weekday analysis
    let weekendSpend = 0;
    let weekdaySpend = 0;
    for (const t of currentTxs.filter((t) => t.type === 'EXPENSE')) {
      const day = t.date.getDay();
      const amt = toDecimal(t.amount).toNumber();
      if (day === 0 || day === 6) weekendSpend += amt;
      else weekdaySpend += amt;
    }
    if (currentExpenses > 0) {
      const weekendPct = Math.round((weekendSpend / currentExpenses) * 100);
      insights.push({
        id: 'weekend-spend',
        type: 'behavior',
        icon: 'Calendar',
        color: '#06B6D4',
        title: 'Weekend vs Weekday',
        value: `${weekendPct}% Weekend Spend`,
        description: `You spent ₹${roundMoney(weekendSpend)} on Saturdays and Sundays (${weekendPct}% of total).`,
        priority: 'medium',
      });
    }

    // 5. Recurring Subscriptions Load
    const recurringTotal = recurring.reduce((s, r) => s + toDecimal(r.amount).toNumber(), 0);
    if (recurring.length > 0) {
      insights.push({
        id: 'recurring-load',
        type: 'subscriptions',
        icon: 'Repeat',
        color: '#8B5CF6',
        title: 'Recurring Commitments',
        value: `₹${roundMoney(recurringTotal)} / mo`,
        description: `${recurring.length} active subscriptions and recurring bills scheduled this month.`,
        priority: 'medium',
      });
    }

    // 6. Closest Goal Progress
    if (goals.length > 0) {
      const topGoal = [...goals].sort((a, b) => {
        const aPct = toDecimal(a.currentAmount).dividedBy(toDecimal(a.targetAmount)).toNumber();
        const bPct = toDecimal(b.currentAmount).dividedBy(toDecimal(b.targetAmount)).toNumber();
        return bPct - aPct;
      })[0];

      const gTarget = toDecimal(topGoal.targetAmount).toNumber();
      const gCurrent = toDecimal(topGoal.currentAmount).toNumber();
      const gPct = Math.round((gCurrent / gTarget) * 100);
      insights.push({
        id: 'goal-progress',
        type: 'goal',
        icon: 'Target',
        color: '#10B981',
        title: `Goal: ${topGoal.name}`,
        value: `${gPct}% Complete`,
        description: `₹${roundMoney(gCurrent)} saved of ₹${roundMoney(gTarget)}. ₹${roundMoney(gTarget - gCurrent)} remaining.`,
        priority: 'medium',
      });
    }

    // 7. Optimization tip
    if (topCat) {
      const savings15 = roundMoney(topCat.amount * 0.15);
      insights.push({
        id: 'optimization-tip',
        type: 'recommendation',
        icon: 'Lightbulb',
        color: '#F97316',
        title: 'Savings Opportunity',
        value: `Save ₹${savings15}/mo`,
        description: `Trimming ${topCat.name} expenses by 15% would save an extra ₹${savings15} every month.`,
        priority: 'low',
      });
    }

    return insights;
  },
};
