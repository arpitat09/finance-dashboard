import { prisma } from '../config';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/errors';
import { categoryService } from './categoryService';

export const authService = {
  async register(data: { name: string; email: string; password: string; currency?: string; timezone?: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      throw ApiError.conflict('An account with this email address already exists');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash,
        currency: data.currency || 'INR',
        timezone: data.timezone || 'Asia/Kolkata',
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        timezone: true,
        role: true,
        createdAt: true,
      },
    });

    // Create default starter accounts
    await prisma.account.createMany({
      data: [
        { userId: user.id, name: 'Primary Bank Account', type: 'BANK', balance: 0, currency: user.currency },
        { userId: user.id, name: 'Cash Wallet', type: 'CASH', balance: 0, currency: user.currency },
      ],
    });

    // Create default starter categories for user
    await categoryService.seedDefaultCategories(user.id);

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to FINORA! 🎉',
        message: 'Your personal finance dashboard is ready. Add your first transaction or set up a budget to get started.',
        type: 'SYSTEM',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return { user, token };
  },

  async login(data: { email: string; password: string }) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
        timezone: user.timezone,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        currency: true,
        timezone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string | null; currency?: string; timezone?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.currency && { currency: data.currency }),
        ...(data.timezone && { timezone: data.timezone }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        currency: true,
        timezone: true,
        role: true,
        updatedAt: true,
      },
    });

    return user;
  },

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw ApiError.badRequest('Incorrect current password');
    }

    const passwordHash = await hashPassword(data.newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Password updated successfully' };
  },
};
