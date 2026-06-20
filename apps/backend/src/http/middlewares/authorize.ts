import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../app-error.js';

type Action = 'visualizar' | 'criar' | 'editar' | 'excluir';

export function authorize(modulo: string, action: Action) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) throw new AppError(401, 'AUTH_REQUIRED', 'Autenticação necessária.');

    const permission = await prisma.permissao.findFirst({
      where: {
        empresaId: req.auth.empresaId,
        usuarioId: req.auth.usuarioId,
        modulo,
        deletedAt: null,
        [action]: true,
      },
      select: { id: true },
    });

    if (!permission) throw new AppError(403, 'FORBIDDEN', 'Você não possui permissão para esta ação.');
    next();
  };
}

