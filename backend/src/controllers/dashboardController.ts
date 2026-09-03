import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';
import { insightService } from '../services/insightService';
import { AuthRequest } from '../middleware/authenticate';

export const dashboardController = {
  async getSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as string) || 'this-month';
      const summary = await dashboardService.getDashboardSummary(req.user!.id, period);
      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCashFlow(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const timeframe = (req.query.timeframe as string) || '30D';
      const trend = await dashboardService.getCashFlowTrend(req.user!.id, timeframe);
      res.status(200).json({
        success: true,
        data: trend,
      });
    } catch (err) {
      next(err);
    }
  },

  async getCategoryBreakdown(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as string) || 'this-month';
      const breakdown = await dashboardService.getCategoryBreakdown(req.user!.id, period);
      res.status(200).json({
        success: true,
        data: breakdown,
      });
    } catch (err) {
      next(err);
    }
  },

  async getHealthScore(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const health = await dashboardService.getFinancialHealthScore(req.user!.id);
      res.status(200).json({
        success: true,
        data: health,
      });
    } catch (err) {
      next(err);
    }
  },

  async getInsights(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const insights = await insightService.generateInsights(req.user!.id);
      res.status(200).json({
        success: true,
        data: insights,
      });
    } catch (err) {
      next(err);
    }
  },
};
