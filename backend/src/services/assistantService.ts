import { dashboardService } from './dashboardService';
import { budgetService } from './budgetService';
import { goalService } from './goalService';
import { recurringService } from './recurringService';
import { roundMoney } from '../utils/money';

export const assistantService = {
  async processQuery(userId: string, query: string) {
    const q = query.toLowerCase().trim();

    // Fetch user's financial context
    const [summary, breakdown, budgets, goals, recurring] = await Promise.all([
      dashboardService.getDashboardSummary(userId, 'this-month'),
      dashboardService.getCategoryBreakdown(userId, 'this-month'),
      budgetService.listBudgets(userId),
      goalService.listGoals(userId),
      recurringService.listRecurring(userId),
    ]);

    let reply = '';
    let category: 'spending' | 'budget' | 'savings' | 'recurring' | 'general' = 'general';
    const suggestions: string[] = [];

    // 1. Where did I spend the most / spending queries
    if (q.includes('where') || q.includes('most') || q.includes('spend') || q.includes('top expense')) {
      category = 'spending';
      const topCat = breakdown.categories[0];
      if (topCat) {
        reply = `📊 **Top Spending Analysis:**\n\nYour highest spending category this month is **${topCat.name}**, where you spent **₹${topCat.amount.toLocaleString('en-IN')}** (${topCat.percentage}% of your total ₹${summary.expenses.toLocaleString('en-IN')} monthly expenses across ${topCat.count} transactions).\n\n` +
          `The top 3 categories are:\n` +
          breakdown.categories.slice(0, 3).map((c, i) => `${i + 1}. **${c.name}**: ₹${c.amount.toLocaleString('en-IN')} (${c.percentage}%)`).join('\n') +
          `\n\n💡 *Tip:* Reducing your ${topCat.name} spending by just 10% will save you **₹${Math.round(topCat.amount * 0.1).toLocaleString('en-IN')}** each month.`;
      } else {
        reply = `You haven't recorded any expenses for this month yet. Add a transaction to see spending insights!`;
      }
      suggestions.push('Am I staying within my budget?', 'How can I reduce my expenses?', 'What are my recurring expenses?');
    }

    // 2. Budget queries
    else if (q.includes('budget') || q.includes('limit') || q.includes('overspend')) {
      category = 'budget';
      const exceeded = budgets.budgets.filter((b) => b.status === 'EXCEEDED');
      const approaching = budgets.budgets.filter((b) => b.status === 'APPROACHING');

      if (budgets.budgets.length === 0) {
        reply = `You don't have any active budgets set up yet. Setting category budgets for Housing, Food, or Shopping helps track spending limits effectively.`;
      } else if (exceeded.length > 0) {
        reply = `🚨 **Budget Alert:**\n\nYou have **${exceeded.length} exceeded budget${exceeded.length > 1 ? 's' : ''}** this month:\n\n` +
          exceeded.map((b) => `• **${b.category.name}**: Spent ₹${b.spent.toLocaleString('en-IN')} / ₹${b.amount.toLocaleString('en-IN')} (${b.percentage}% used — over by ₹${Math.abs(b.remaining).toLocaleString('en-IN')})`).join('\n') +
          `\n\nOverall, you have used **${budgets.summary.overallPercentage}%** of your total monthly budget (₹${budgets.summary.totalSpent.toLocaleString('en-IN')} of ₹${budgets.summary.totalBudget.toLocaleString('en-IN')}).`;
      } else if (approaching.length > 0) {
        reply = `⚠️ **Budget Watch:**\n\nYou are on track overall, but **${approaching.length} category** is near its limit:\n\n` +
          approaching.map((b) => `• **${b.category.name}**: ₹${b.spent.toLocaleString('en-IN')} of ₹${b.amount.toLocaleString('en-IN')} (${b.percentage}% used, ₹${b.remaining.toLocaleString('en-IN')} remaining)`).join('\n') +
          `\n\nYour total budget utilization is **${budgets.summary.overallPercentage}%**.`;
      } else {
        reply = `✅ **Great news!** You are well within all your budgets this month.\n\n` +
          `• Total Budget: **₹${budgets.summary.totalBudget.toLocaleString('en-IN')}**\n` +
          `• Total Spent: **₹${budgets.summary.totalSpent.toLocaleString('en-IN')}**\n` +
          `• Total Remaining: **₹${budgets.summary.totalRemaining.toLocaleString('en-IN')}** (${budgets.summary.overallPercentage}% utilized).`;
      }
      suggestions.push('Where did I spend the most this month?', 'How much did I save this month?');
    }

    // 3. Savings / Goals queries
    else if (q.includes('save') || q.includes('savings') || q.includes('goal') || q.includes('how much did i save')) {
      category = 'savings';
      reply = `💰 **Savings & Wealth Summary:**\n\n` +
        `• **Monthly Income:** ₹${summary.income.toLocaleString('en-IN')}\n` +
        `• **Monthly Expenses:** ₹${summary.expenses.toLocaleString('en-IN')}\n` +
        `• **Net Monthly Savings:** ₹${summary.savings.toLocaleString('en-IN')} (**${summary.savingsRate}%** savings rate)\n\n` +
        `🎯 **Savings Goals Progress (${goals.summary.overallProgress}% overall):**\n` +
        goals.goals.map((g) => `• **${g.name}**: ₹${g.currentAmount.toLocaleString('en-IN')} / ₹${g.targetAmount.toLocaleString('en-IN')} (${g.percentage}% saved)`).join('\n');
      suggestions.push('How can I reduce my expenses?', 'What are my biggest recurring expenses?');
    }

    // 4. Recurring expenses queries
    else if (q.includes('recurring') || q.includes('subscription') || q.includes('bill')) {
      category = 'recurring';
      reply = `🔄 **Recurring Expenses & Subscriptions:**\n\n` +
        `You have **${recurring.summary.activeCount} active recurring items** totaling **₹${recurring.summary.monthlyCommitment.toLocaleString('en-IN')} / month**.\n\n` +
        recurring.recurring.map((r) => `• **${r.description}**: ₹${r.amount.toLocaleString('en-IN')} (${r.frequency.toLowerCase()}, next on ${r.nextDate.toISOString().slice(0, 10)})`).join('\n') +
        `\n\n💡 *Tip:* Review subscriptions every quarter to cancel unused memberships or services.`;
      suggestions.push('Where did I spend the most this month?', 'Am I staying within my budget?');
    }

    // 5. How to reduce expenses / advice
    else if (q.includes('reduce') || q.includes('cut') || q.includes('advice') || q.includes('tips') || q.includes('help')) {
      category = 'spending';
      const topCat = breakdown.categories[0];
      reply = `🎯 **Personalized Recommendations to Lower Expenses:**\n\n` +
        (topCat ? `1. **Target ${topCat.name}:** This is your largest cost center at ₹${topCat.amount.toLocaleString('en-IN')}/mo. Aim to reduce it by 10-15% to save ₹${Math.round(topCat.amount * 0.12).toLocaleString('en-IN')}.\n` : '') +
        `2. **Audit Subscriptions:** You currently spend ₹${recurring.summary.monthlyCommitment.toLocaleString('en-IN')}/mo on recurring payments.\n` +
        `3. **The 50/30/20 Rule:** Your current savings rate is **${summary.savingsRate}%**. Standard target is 20%+ for long-term financial security.\n` +
        `4. **Set Category Budgets:** Create spending caps on discretionary categories like Dining and Entertainment.`;
      suggestions.push('Where did I spend the most this month?', 'How much did I save this month?');
    }

    // Default general response
    else {
      reply = `👋 **FINORA Financial Assistant Overview:**\n\n` +
        `Here is a quick snapshot of your finances this month:\n` +
        `• **Net Balance:** ₹${summary.totalBalance.toLocaleString('en-IN')}\n` +
        `• **Monthly Income:** ₹${summary.income.toLocaleString('en-IN')}\n` +
        `• **Monthly Expenses:** ₹${summary.expenses.toLocaleString('en-IN')}\n` +
        `• **Savings Rate:** ${summary.savingsRate}%\n\n` +
        `You can ask me questions like:\n` +
        `• *"Where did I spend the most this month?"*\n` +
        `• *"Am I staying within my budget?"*\n` +
        `• *"How much did I save this month?"*\n` +
        `• *"What are my biggest recurring expenses?"*`;
      suggestions.push('Where did I spend the most this month?', 'Am I staying within my budget?', 'How much did I save this month?');
    }

    return {
      query,
      reply,
      category,
      suggestions,
      timestamp: new Date().toISOString(),
    };
  },
};
