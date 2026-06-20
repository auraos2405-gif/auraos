import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../app-error.js';
import { verifyAccessToken } from '../../lib/jwt.js';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'AUTH_REQUIRED', 'Autenticação necessária.');
  }

  try {
    const claims = verifyAccessToken(header.slice(7));
    req.auth = {
      usuarioId: claims.sub,
      empresaId: claims.empresaId,
      email: claims.email,
    };
    next();
  } catch {
    throw new AppError(401, 'INVALID_TOKEN', 'Sessão inválida ou expirada.');
  }
}

