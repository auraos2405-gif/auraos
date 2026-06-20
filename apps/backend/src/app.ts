import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler, notFound } from './http/middlewares/error-handler.js';
import { requestContext } from './http/middlewares/request-context.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { onboardingRouter } from './modules/onboarding/onboarding.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { categoriesRouter } from './modules/finance/categories.routes.js';
import { suppliersRouter } from './modules/finance/suppliers.routes.js';
import { clientsRouter } from './modules/finance/clients.routes.js';
import { payablesRouter } from './modules/finance/payables.routes.js';
import { receivablesRouter } from './modules/finance/receivables.routes.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(requestContext);
app.use(helmet());
app.use(cors({ origin: env.APP_URL, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: 'draft-8', legacyHeaders: false }));

app.get('/health', (_req, res) => {
  res.json({ status: 'online', version: '1.1.0' });
});

app.use('/api/v1/onboarding', onboardingRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/usuarios', usersRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/categorias', categoriesRouter);
app.use('/api/v1/fornecedores', suppliersRouter);
app.use('/api/v1/clientes', clientsRouter);
app.use('/api/v1/finance/contas-pagar', payablesRouter);
app.use('/api/v1/finance/contas-receber', receivablesRouter);

app.use(notFound);
app.use(errorHandler);
