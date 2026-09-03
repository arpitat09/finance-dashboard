import { Response, NextFunction } from 'express';
import { goalService } from '../services/goalService';
import { AuthRequest } from '../middleware/authenticate';

export const goalController = {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await goalService.listGoals(req.user!.id);
      res.status(200).json({
        success: true,
        data: result.goals,
        summary: result.summary,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.createGoal(req.user!.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Goal created successfully',
        data: goal,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.updateGoal(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Goal updated successfully',
        data: goal,
      });
    } catch (err) {
      next(err);
    }
  },

  async contribute(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.contributeToGoal(req.user!.id, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Contribution added successfully',
        data: goal,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await goalService.deleteGoal(req.user!.id, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },
};
