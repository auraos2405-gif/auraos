import { Router } from 'express';
import { env } from '../../config/env.js';
import { authenticate } from '../../http/middlewares/authenticate.js';
import { authorize } from '../../http/middlewares/authorize.js';
import { ok } from '../../http/response.js';
import { audit } from '../audit/audit.service.js';
import {
  acceptInvite,
  changePassword,
  inviteUser,
  login,
  logout,
  refresh,
  requestPasswordReset,
  resetPassword,
} from './auth.service.js';
import {
  acceptInviteSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  inviteSchema,
  loginSchema,
  logoutSchema,
  refreshSchema,
  resetPasswordSchema,
} from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/login', async (req, res) => {
  const input = loginSchema.parse(req.body);
  const result = await login(input.email, input.senha, req.ip, req.header('user-agent'));
  await audit({
    empresaId: result.usuario.empresaId,
    usuarioId: result.usuario.id,
    acao: 'LOGIN',
    tabela: 'sessoes',
    ip: req.ip,
    userAgent: req.header('user-agent'),
    requestId: req.requestId,
  });
  ok(res, result);
});

authRouter.post('/refresh', async (req, res) => {
  const input = refreshSchema.parse(req.body);
  ok(res, await refresh(input.refreshToken, req.ip, req.header('user-agent')));
});

authRouter.post('/logout', async (req, res) => {
  const input = logoutSchema.parse(req.body);
  const session = await logout(input.refreshToken);
  if (session) {
    await audit({
      empresaId: session.empresaId,
      usuarioId: session.usuarioId,
      acao: 'LOGOUT',
      tabela: 'sessoes',
      registroId: session.id,
      requestId: req.requestId,
    });
  }
  ok(res, { message: 'Sessão encerrada.' });
});

authRouter.post('/forgot-password', async (req, res) => {
  const input = forgotPasswordSchema.parse(req.body);
  const token = await requestPasswordReset(input.email);
  ok(res, {
    message: 'Se o e-mail estiver cadastrado, as instruções serão enviadas.',
    ...(env.NODE_ENV !== 'production' && token ? { developmentToken: token } : {}),
  });
});

authRouter.post('/reset-password', async (req, res) => {
  const input = resetPasswordSchema.parse(req.body);
  await resetPassword(input.token, input.novaSenha);
  ok(res, { message: 'Senha redefinida.' });
});

authRouter.post('/accept-invite', async (req, res) => {
  const input = acceptInviteSchema.parse(req.body);
  await acceptInvite(input.token, input.senha);
  ok(res, { message: 'Convite aceito.' });
});

authRouter.post('/change-password', authenticate, async (req, res) => {
  const input = changePasswordSchema.parse(req.body);
  await changePassword(req.auth!.usuarioId, req.auth!.empresaId, input.senhaAtual, input.novaSenha);
  await audit({
    empresaId: req.auth!.empresaId,
    usuarioId: req.auth!.usuarioId,
    acao: 'TROCA_SENHA',
    tabela: 'usuarios',
    registroId: req.auth!.usuarioId,
    requestId: req.requestId,
  });
  ok(res, { message: 'Senha alterada. Entre novamente.' });
});

authRouter.post('/invite', authenticate, authorize('usuarios', 'criar'), async (req, res) => {
  const input = inviteSchema.parse(req.body);
  const invited = await inviteUser(req.auth!.empresaId, input.nome, input.email, input.cargo);
  await audit({
    empresaId: req.auth!.empresaId,
    usuarioId: req.auth!.usuarioId,
    acao: 'CONVITE',
    tabela: 'usuarios',
    registroId: invited.usuario.id,
    requestId: req.requestId,
  });
  ok(res, {
    usuario: invited.usuario,
    ...(env.NODE_ENV !== 'production' ? { developmentToken: invited.token } : {}),
  }, 201);
});
