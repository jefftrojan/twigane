import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error to console (in production, you might want to use a logging service)
  console.error({
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    error: {
      message: err.message,
      stack: err.stack,
    },
    body: req.body,
    query: req.query,
    user: (req as any).user?.userId,
  });

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};