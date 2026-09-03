import Decimal from 'decimal.js';
import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { toDecimal, roundMoney } from '../utils/money';
import { GoalStatus } from '@prisma/client';

export const goalService = {
  async listGoals(userId: string) {
    const goals = await prisma.goal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const formattedGoals = goals.map((g) => {
      const target = toDecimal(g.targetAmount);
      const current = toDecimal(g.currentAmount);
      const remaining = target.minus(current);
      const percentage = target.isZero() ? 0 : current.dividedBy(target).times(100).toNumber();

      let daysLeft: number | null = null;
      if (g.deadline) {
        const diff = new Date(g.deadline).getTime() - now.getTime();
        daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      }

      return {
        id: g.id,
        name: g.name,
        targetAmount: roundMoney(target),
        currentAmount: roundMoney(current),
        remaining: roundMoney(Decimal.max(0, remaining)),
        percentage: Math.min(100, Math.round(percentage * 10) / 10),
        deadline: g.deadline,
        daysLeft,
        color: g.color,
        icon: g.icon,
        status: g.status,
        createdAt: g.createdAt,
      };
    });

    const totalTarget = formattedGoals.reduce((s, g) => s + g.targetAmount, 0);
    const totalSaved = formattedGoals.reduce((s, g) => s + g.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return {
      goals: formattedGoals,
      summary: {
        totalGoals: formattedGoals.length,
        completedGoals: formattedGoals.filter((g) => g.status === 'COMPLETED' || g.percentage >= 100).length,
        totalTarget: roundMoney(totalTarget),
        totalSaved: roundMoney(totalSaved),
        totalRemaining: roundMoney(Math.max(0, totalTarget - totalSaved)),
        overallProgress: Math.round(overallProgress * 10) / 10,
      },
    };
  },

  async createGoal(
    userId: string,
    data: {
      name: string;
      targetAmount: number;
      currentAmount?: number;
      deadline?: string | null;
      color?: string;
      icon?: string;
      status?: GoalStatus;
    }
  ) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: data.name.trim(),
        targetAmount: toDecimal(data.targetAmount).toString(),
        currentAmount: toDecimal(data.currentAmount || 0).toString(),
        deadline: data.deadline ? new Date(data.deadline) : null,
        color: data.color || '#F97316',
        icon: data.icon || 'Target',
        status: data.status || 'IN_PROGRESS',
      },
    });

    return {
      ...goal,
      targetAmount: roundMoney(goal.targetAmount),
      currentAmount: roundMoney(goal.currentAmount),
    };
  },

  async updateGoal(
    userId: string,
    id: string,
    data: {
      name?: string;
      targetAmount?: number;
      currentAmount?: number;
      deadline?: string | null;
      color?: string;
      icon?: string;
      status?: GoalStatus;
    }
  ) {
    const existing = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Goal not found or unauthorized');

    const updated = await prisma.goal.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.targetAmount !== undefined && { targetAmount: toDecimal(data.targetAmount).toString() }),
        ...(data.currentAmount !== undefined && { currentAmount: toDecimal(data.currentAmount).toString() }),
        ...(data.deadline !== undefined && { deadline: data.deadline ? new Date(data.deadline) : null }),
        ...(data.color && { color: data.color }),
        ...(data.icon && { icon: data.icon }),
        ...(data.status && { status: data.status }),
      },
    });

    return {
      ...updated,
      targetAmount: roundMoney(updated.targetAmount),
      currentAmount: roundMoney(updated.currentAmount),
    };
  },

  async contributeToGoal(
    userId: string,
    id: string,
    data: { amount: number; accountId?: string | null; createTransaction?: boolean }
  ) {
    const goal = await prisma.goal.findFirst({ where: { id, userId } });
    if (!goal) throw ApiError.notFound('Goal not found or unauthorized');

    const contribution = toDecimal(data.amount);
    const newCurrent = toDecimal(goal.currentAmount).plus(contribution);
    const target = toDecimal(goal.targetAmount);
    const isCompleted = newCurrent.gte(target);

    const result = await prisma.$transaction(async (tx) => {
      const updatedGoal = await tx.goal.update({
        where: { id },
        data: {
          currentAmount: newCurrent.toString(),
          ...(isCompleted && { status: 'COMPLETED' }),
        },
      });

      // Deduct from account if accountId specified
      if (data.accountId) {
        await tx.account.update({
          where: { id: data.accountId },
          data: {
            balance: { decrement: contribution.toString() },
          },
        });
      }

      // If milestone reached, create notification
      if (isCompleted) {
        await tx.notification.create({
          data: {
            userId,
            title: `Goal Achieved! 🎯 ${goal.name}`,
            message: `Congratulations! You reached your savings target of ₹${roundMoney(target)}. Keep building your future!`,
            type: 'GOAL_MILESTONE',
          },
        });
      }

      return updatedGoal;
    });

    return {
      ...result,
      targetAmount: roundMoney(result.targetAmount),
      currentAmount: roundMoney(result.currentAmount),
      percentage: Math.min(100, Math.round(newCurrent.dividedBy(target).times(100).toNumber() * 10) / 10),
    };
  },

  async deleteGoal(userId: string, id: string) {
    const existing = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) throw ApiError.notFound('Goal not found or unauthorized');

    await prisma.goal.delete({ where: { id } });
    return { message: 'Goal deleted successfully' };
  },
};
