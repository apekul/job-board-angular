import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, status: err.status });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Invalid request parameters', status: 400, details: err.issues });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error', status: 500 });
}
