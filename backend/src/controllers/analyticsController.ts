import { Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';
import { AuthRequest } from '../middleware/authenticate';

export const analyticsController = {
  async getOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const overview = await analyticsService.getAnalyticsOverview(req.user!.id);
      res.status(200).json({
        success: true,
        data: overview,
      });
    } catch (err) {
      next(err);
    }
  },
};
