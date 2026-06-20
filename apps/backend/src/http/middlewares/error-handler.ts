import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../app-error.js';

export const notFound: RequestHandler = (req, _res, next) => {
  next(new AppError(404, 'NOT_FOUND', `Rota ${req.method} ${req.path} não encontrada.`));
};

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Dados inválidos.', details: error.flatten() },
      requestId: req.requestId,
    });
    return;
  }

  const appError =
    error instanceof AppError
      ? error
      : new AppError(500, 'INTERNAL_ERROR', 'Identifiquei uma inconsistência interna.');

  if (!(error instanceof AppError) && process.env.NODE_ENV !== 'test') console.error(error);

  res.status(appError.statusCode).json({
    success: false,
    error: { code: appError.code, message: appError.message, details: appError.details },
    requestId: req.requestId,
  });
};

