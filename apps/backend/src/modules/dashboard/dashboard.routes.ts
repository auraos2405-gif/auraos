import { Router } from 'express';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { ok } from '../../http/response.js';
import { getExecutiveDashboard, markAlertAsRead } from '../executive/executive.service.js';
import { z } from 'zod';

export const dashboardRouter = Router();

dashboardRouter.get('/executive', authenticate, async (req, res) => {
  ok(res, await getExecutiveDashboard(req.auth!.empresaId));
});

dashboardRouter.post('/alerts/:id/read', authenticate, async (req, res) => {
  const { id } = z.object({ id: z.string().uuid() }).parse(req.params);
  await markAlertAsRead(req.auth!.empresaId, id);
  ok(res, { message: 'Alerta marcado como lido.' });
});
