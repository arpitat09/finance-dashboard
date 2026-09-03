import { prisma } from '../config';
import { ApiError } from '../utils/errors';
import { TransactionType } from '@prisma/client';

export const DEFAULT_CATEGORIES = [
  // Income
  { name: 'Salary', type: TransactionType.INCOME, icon: 'Briefcase', color: '#10B981', isDefault: true },
  { name: 'Freelance', type: TransactionType.INCOME, icon: 'Laptop', color: '#06B6D4', isDefault: true },
  { name: 'Investment', type: TransactionType.INCOME, icon: 'TrendingUp', color: '#F59E0B', isDefault: true },
  { name: 'Other Income', type: TransactionType.INCOME, icon: 'PlusCircle', color: '#8B5CF6', isDefault: true },

  // Expense
  { name: 'Housing & Rent', type: TransactionType.EXPENSE, icon: 'Home', color: '#F97316', isDefault: true },
  { name: 'Food & Dining', type: TransactionType.EXPENSE, icon: 'Utensils', color: '#FB923C', isDefault: true },
  { name: 'Transportation', type: TransactionType.EXPENSE, icon: 'Car', color: '#38BDF8', isDefault: true },
  { name: 'Utilities & Bills', type: TransactionType.EXPENSE, icon: 'Zap', color: '#FBBF24', isDefault: true },
  { name: 'Shopping & Groceries', type: TransactionType.EXPENSE, icon: 'ShoppingBag', color: '#EC4899', isDefault: true },
  { name: 'Healthcare & Medical', type: TransactionType.EXPENSE, icon: 'HeartPulse', color: '#EF4444', isDefault: true },
  { name: 'Education & Learning', type: TransactionType.EXPENSE, icon: 'GraduationCap', color: '#6366F1', isDefault: true },
  { name: 'Entertainment & Leisure', type: TransactionType.EXPENSE, icon: 'Film', color: '#A855F7', isDefault: true },
  { name: 'Subscriptions', type: TransactionType.EXPENSE, icon: 'Repeat', color: '#14B8A6', isDefault: true },
  { name: 'Travel & Vacation', type: TransactionType.EXPENSE, icon: 'Plane', color: '#0EA5E9', isDefault: true },
  { name: 'Other Expense', type: TransactionType.EXPENSE, icon: 'CircleDot', color: '#9CA3AF', isDefault: true },
];

export const categoryService = {
  async seedDefaultCategories(userId: string) {
    for (const cat of DEFAULT_CATEGORIES) {
      await prisma.category.upsert({
        where: {
          userId_name_type: {
            userId,
            name: cat.name,
            type: cat.type,
          },
        },
        update: {},
        create: {
          userId,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
        },
      });
    }
  },

  async listCategories(userId: string, type?: 'INCOME' | 'EXPENSE') {
    return prisma.category.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });
  },

  async createCategory(userId: string, data: { name: string; type: TransactionType; icon?: string; color?: string }) {
    const existing = await prisma.category.findUnique({
      where: {
        userId_name_type: {
          userId,
          name: data.name.trim(),
          type: data.type,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict(`A category named "${data.name}" already exists for ${data.type}`);
    }

    return prisma.category.create({
      data: {
        userId,
        name: data.name.trim(),
        type: data.type,
        icon: data.icon || 'CircleDot',
        color: data.color || '#F97316',
        isDefault: false,
      },
    });
  },

  async updateCategory(userId: string, id: string, data: { name?: string; icon?: string; color?: string }) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) throw ApiError.notFound('Category not found or unauthorized');

    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.icon && { icon: data.icon }),
        ...(data.color && { color: data.color }),
      },
    });
  },

  async deleteCategory(userId: string, id: string) {
    const category = await prisma.category.findFirst({
      where: { id, userId },
      include: { _count: { select: { transactions: true, budgets: true } } },
    });

    if (!category) throw ApiError.notFound('Category not found or unauthorized');

    if (category._count.transactions > 0 || category._count.budgets > 0) {
      throw ApiError.badRequest(
        `Cannot delete category because it has ${category._count.transactions} transactions and ${category._count.budgets} budgets associated with it.`
      );
    }

    await prisma.category.delete({ where: { id } });
    return { message: 'Category deleted successfully' };
  },
};
