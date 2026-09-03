import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors';
import { config } from '../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
      ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
  }

  // Prisma unique constraint error
  if ((err as any).code === 'P2002') {
    const target = (err as any).meta?.target || 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${target} already exists.`,
    });
  }

  // Prisma record not found error
  if ((err as any).code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Requested record was not found.',
    });
  }

  console.error('Unhandled Error:', err);

  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(config.nodeEnv === 'development' && { error: err.message, stack: err.stack }),
  });
}
