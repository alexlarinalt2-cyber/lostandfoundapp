import type { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncFn = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(fn: AsyncFn): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch((err: Error & { status?: number }) => {
      const status = err.status ?? 500;
      res.status(status).json({
        success: false,
        error: { message: err.message ?? 'Internal server error' },
      });
    });
  };
}
