import { Response, NextFunction } from 'express';
import { recurringService } from '../services/recurringService';
import { AuthRequest } from '../middleware/authenticate';

export const recurringController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recurringService.listRecurring(req.user!.id);
      res.status(200).json({
        success: true,
        data: result.recurring,
        summary: result.summary,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await recurringService.createRecurring(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Recurring payment created successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await recurringService.updateRecurring(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Recurring payment updated successfully',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recurringService.deleteRecurring(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },

  async processDue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await recurringService.processDueRecurring(req.user!.id);
      res.status(200).json({
        success: true,
        message: `Processed ${result.processedCount} due recurring transactions`,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },
};
