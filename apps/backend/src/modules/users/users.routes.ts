import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../http/app-error.js';

export const usersRouter = Router();
usersRouter.use(authenticate);

usersRouter.get('/me', async (req, res) => {
  const user = await prisma.usuario.findFirst({
    where: { id: req.auth!.usuarioId, empresaId: req.auth!.empresaId, deletedAt: null },
    select: {
      id: true,
      empresaId: true,
      nome: true,
      email: true,
      cargo: true,
      avatar: true,
      empresa: { select: { id: true, nome: true, nomeFantasia: true } },
      permissoes: {
        where: { deletedAt: null },
        select: { modulo: true, visualizar: true, criar: true, editar: true, excluir: true },
      },
    },
  });
  if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'Usuário não encontrado.');
  ok(res, user);
});

usersRouter.get('/', authorize('usuarios', 'visualizar'), async (req, res) => {
  const users = await prisma.usuario.findMany({
    where: { empresaId: req.auth!.empresaId, deletedAt: null },
    select: { id: true, nome: true, email: true, cargo: true, avatar: true, ativo: true, createdAt: true },
    orderBy: { nome: 'asc' },
  });
  ok(res, users);
});

