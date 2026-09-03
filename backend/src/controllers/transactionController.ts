import { Response, NextFunction } from 'express';
import { transactionService } from '../services/transactionService';
import { AuthRequest } from '../middleware/authenticate';

export const transactionController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.listTransactions(req.user!.id, req.query as any);
      res.status(200).json({
        success: true,
        data: result.transactions,
        meta: result.meta,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.getTransactionById(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.createTransaction(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transaction = await transactionService.updateTransaction(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Transaction updated successfully',
        data: transaction,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transactionService.deleteTransaction(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
