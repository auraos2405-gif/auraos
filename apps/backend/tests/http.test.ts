import express from 'express';
import request from 'supertest';
import { AppError } from '../src/http/app-error.js';
import { authenticate } from '../src/http/middlewares/authenticate.js';
import { errorHandler, notFound } from '../src/http/middlewares/error-handler.js';
import { requestContext } from '../src/http/middlewares/request-context.js';
import { signAccessToken } from '../src/lib/jwt.js';
import { z } from 'zod';

function testApp() {
  const app = express();
  app.use(express.json());
  app.use(requestContext);
  app.get('/private', authenticate, (req, res) => res.json({ auth: req.auth, requestId: req.requestId }));
  app.get('/app-error', () => { throw new AppError(409, 'CONFLICT', 'Conflito controlado.'); });
  app.get('/unexpected', () => { throw new Error('secret'); });
  app.get('/validation', () => { z.object({ value: z.string() }).parse({ value: 1 }); });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

describe('HTTP foundation', () => {
  it('creates or preserves request correlation ids', async () => {
    const generated = await request(testApp()).get('/missing');
    expect(generated.headers['x-request-id']).toBeTruthy();
    const supplied = await request(testApp()).get('/missing').set('x-request-id', 'trace-123');
    expect(supplied.headers['x-request-id']).toBe('trace-123');
  });

  it('rejects absent and invalid credentials', async () => {
    expect((await request(testApp()).get('/private')).status).toBe(401);
    expect((await request(testApp()).get('/private').set('authorization', 'Basic bad')).status).toBe(401);
    expect((await request(testApp()).get('/private').set('authorization', 'Bearer invalid')).status).toBe(401);
  });

  it('hydrates a trusted tenant context from a valid token', async () => {
    const token = signAccessToken({ sub: 'user', empresaId: 'tenant', email: 'user@aura.local' });
    const response = await request(testApp()).get('/private').set('authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.auth).toEqual({ usuarioId: 'user', empresaId: 'tenant', email: 'user@aura.local' });
  });

  it('returns stable errors without exposing unexpected details', async () => {
    const controlled = await request(testApp()).get('/app-error');
    expect(controlled.status).toBe(409);
    expect(controlled.body.error.code).toBe('CONFLICT');
    const unexpected = await request(testApp()).get('/unexpected');
    expect(unexpected.status).toBe(500);
    expect(unexpected.body.error.code).toBe('INTERNAL_ERROR');
    expect(unexpected.text).not.toContain('secret');
    const validation = await request(testApp()).get('/validation');
    expect(validation.status).toBe(422);
    expect(validation.body.error.code).toBe('VALIDATION_ERROR');
  });
});
