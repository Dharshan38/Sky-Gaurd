import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

type PrismaLikeError = {
  code?: string;
  meta?: {
    target?: string[];
  };
  message?: string;
};

const isPrismaLikeError = (error: unknown): error is PrismaLikeError => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  let statusCode = 500;
  let message = 'Internal server error';

  if (error instanceof HttpError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    message = error.issues.map((issue) => issue.message).join(', ');
  } else if (isPrismaLikeError(error)) {
    if (error.code === 'P2002') {
      statusCode = 409;
      const target = error.meta?.target?.join(', ');
      message = target ? `${target} already exists` : 'Unique constraint violation';
    } else {
      message = error.message ?? message;
    }
  } else if (error instanceof Error && error.message) {
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message
  });
};