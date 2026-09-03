import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { NotificationType } from '@prisma/client';
import { toDecimal, roundMoney } from '../utils/money';

export const notificationService = {
  async listNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return {
      notifications,
      unreadCount,
    };
  },

  async markAsRead(userId: string, id: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw ApiError.notFound('Notification not found');

    return prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read' };
  },

  async deleteNotification(userId: string, id: string) {
    const notification = await prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!notification) throw ApiError.notFound('Notification not found');

    await prisma.notification.delete({ where: { id } });
    return { message: 'Notification deleted successfully' };
  },

  async createNotification(userId: string, title: string, message: string, type: NotificationType = 'SYSTEM') {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  },

  async triggerSystemCheck(userId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Check Budgets
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
    });

    for (const b of budgets) {
      const spentAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: b.categoryId,
          type: 'EXPENSE',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        _sum: { amount: true },
      });

      const budgetAmount = toDecimal(b.amount);
      const spent = toDecimal(spentAgg._sum.amount || 0);
      const pct = budgetAmount.isZero() ? 0 : spent.dividedBy(budgetAmount).times(100).toNumber();

      if (pct >= 100) {
        // Check if notified recently
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'BUDGET_EXCEEDED',
            message: { contains: b.category.name },
            createdAt: { gte: startOfMonth },
          },
        });
        if (!recentNotif) {
          await prisma.notification.create({
            data: {
              userId,
              title: `Budget Exceeded 🚨 ${b.category.name}`,
              message: `You have spent ₹${roundMoney(spent)} of your ₹${roundMoney(budgetAmount)} budget (${Math.round(pct)}%).`,
              type: 'BUDGET_EXCEEDED',
            },
          });
        }
      } else if (pct >= 80) {
        const recentNotif = await prisma.notification.findFirst({
          where: {
            userId,
            type: 'BUDGET_WARNING',
            message: { contains: b.category.name },
            createdAt: { gte: startOfMonth },
          },
        });
        if (!recentNotif) {
          await prisma.notification.create({
            data: {
              userId,
              title: `Budget Warning ⚠️ ${b.category.name}`,
              message: `You've used ${Math.round(pct)}% of your ${b.category.name} monthly budget.`,
              type: 'BUDGET_WARNING',
            },
          });
        }
      }
    }

    // 2. Check Upcoming Recurring Payments (due in <= 3 days)
    const threeDaysLater = new Date();
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const upcoming = await prisma.recurringTransaction.findMany({
      where: {
        userId,
        isActive: true,
        nextDate: { gte: now, lte: threeDaysLater },
      },
    });

    for (const item of upcoming) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'RECURRING_DUE',
          message: { contains: item.description },
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId,
            title: `Upcoming Bill Due 🔔 ${item.description}`,
            message: `Scheduled payment of ₹${roundMoney(item.amount)} is due on ${item.nextDate.toISOString().slice(0, 10)}.`,
            type: 'RECURRING_DUE',
          },
        });
      }
    }

    return { message: 'System checks completed' };
  },
};
