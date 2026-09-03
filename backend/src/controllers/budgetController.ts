import { Response, NextFunction } from 'express';
import { budgetService } from '../services/budgetService';
import { AuthRequest } from '../middleware/authenticate';

export const budgetController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await budgetService.listBudgets(req.user!.id);
      res.status(200).json({
        success: true,
        data: result.budgets,
        summary: result.summary,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.createBudget(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Budget created successfully',
        data: budget,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const budget = await budgetService.updateBudget(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Budget updated successfully',
        data: budget,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await budgetService.deleteBudget(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
