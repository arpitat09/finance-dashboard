import { Router } from 'express';
import authRoutes from './authRoutes';
import transactionRoutes from './transactionRoutes';
import categoryRoutes from './categoryRoutes';
import budgetRoutes from './budgetRoutes';
import goalRoutes from './goalRoutes';
import accountRoutes from './accountRoutes';
import recurringRoutes from './recurringRoutes';
import notificationRoutes from './notificationRoutes';
import dashboardRoutes from './dashboardRoutes';
import analyticsRoutes from './analyticsRoutes';
import assistantRoutes from './assistantRoutes';
import exportRoutes from './exportRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/goals', goalRoutes);
router.use('/accounts', accountRoutes);
router.use('/recurring', recurringRoutes);
router.use('/notifications', notificationRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/assistant', assistantRoutes);
router.use('/exports', exportRoutes);

export default router;
