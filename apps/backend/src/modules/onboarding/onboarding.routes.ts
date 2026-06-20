import { Router } from 'express';
import { ok } from '../../http/response.js';
import { prisma } from '../../lib/prisma.js';
import { createCompanyWithAdmin } from './onboarding.service.js';
import { createCompanySchema } from './onboarding.schemas.js';

export const onboardingRouter = Router();

onboardingRouter.post('/create-company', async (req, res) => {
  const input = createCompanySchema.parse(req.body);
  const result = await createCompanyWithAdmin(prisma, input, req.ip, req.header('user-agent') ?? undefined);
  ok(res, result, 201);
});
