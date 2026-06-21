import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { TokenTipo, type Usuario } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { generateOpaqueToken, hashToken } from '../../lib/crypto.js';
import { signAccessToken } from '../../lib/jwt.js';
import { AppError } from '../../http/app-error.js';

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const ACTION_TTL_MS = 60 * 60 * 1000;

function publicUser(user: Usuario) {
  return {
    id: user.id,
    empresaId: user.empresaId,
    nome: user.nome,
    email: user.email,
    cargo: user.cargo,
    avatar: user.avatar,
  };
}

async function createSession(user: Usuario, ip?: string, userAgent?: string, familia: string = randomUUID()) {
  const refreshToken = generateOpaqueToken();
  await prisma.sessao.create({
    data: {
      empresaId: user.empresaId,
      usuarioId: user.id,
      tokenHash: hashToken(refreshToken),
      familia,
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      ip,
      userAgent,
    },
  });

  return {
    accessToken: signAccessToken({ sub: user.id, empresaId: user.empresaId, email: user.email }),
    refreshToken,
    usuario: publicUser(user),
  };
}

export async function login(email: string, senha: string, ip?: string, userAgent?: string) {
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user || !user.ativo || user.deletedAt || !(await bcrypt.compare(senha, user.senhaHash))) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.');
  }

  await prisma.usuario.update({ where: { id: user.id }, data: { ultimoAcesso: new Date() } });
  return createSession(user, ip, userAgent);
}

export async function refresh(rawToken: string, ip?: string, userAgent?: string) {
  const tokenHash = hashToken(rawToken);
  const session = await prisma.sessao.findUnique({
    where: { tokenHash },
    include: { usuario: true },
  });

  if (!session || session.revokedAt || session.deletedAt || session.expiresAt <= new Date()) {
    if (session?.familia) {
      await prisma.sessao.updateMany({ where: { familia: session.familia }, data: { revokedAt: new Date() } });
    }
    throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Sessão inválida ou expirada.');
  }

  if (!session.usuario.ativo || session.usuario.deletedAt) {
    throw new AppError(401, 'INACTIVE_USER', 'Usuário inativo.');
  }

  const next = await createSession(session.usuario, ip, userAgent, session.familia);
  await prisma.sessao.update({
    where: { id: session.id },
    data: { revokedAt: new Date(), replacedByHash: hashToken(next.refreshToken) },
  });
  return next;
}

export async function logout(rawToken: string) {
  const session = await prisma.sessao.findUnique({ where: { tokenHash: hashToken(rawToken) } });
  await prisma.sessao.updateMany({
    where: { tokenHash: hashToken(rawToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return session;
}

export async function createActionToken(usuarioId: string, tipo: TokenTipo) {
  const user = await prisma.usuario.findUniqueOrThrow({ where: { id: usuarioId } });
  const token = generateOpaqueToken();
  await prisma.$transaction([
    prisma.tokenAcao.updateMany({
      where: { empresaId: user.empresaId, usuarioId, tipo, usedAt: null },
      data: { usedAt: new Date() },
    }),
    prisma.tokenAcao.create({
      data: {
        empresaId: user.empresaId,
        usuarioId,
        tipo,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + ACTION_TTL_MS),
      },
    }),
  ]);
  return token;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.usuario.findUnique({ where: { email } });
  if (!user || user.deletedAt || !user.ativo) return null;
  return createActionToken(user.id, TokenTipo.RECUPERACAO_SENHA);
}

async function consumeActionToken(rawToken: string, tipo: TokenTipo, password: string) {
  const token = await prisma.tokenAcao.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { usuario: true },
  });
  if (!token || token.tipo !== tipo || token.usedAt || token.deletedAt || token.expiresAt <= new Date()) {
    throw new AppError(400, 'INVALID_ACTION_TOKEN', 'Token inválido ou expirado.');
  }

  const senhaHash = await bcrypt.hash(password, 12);
  await prisma.$transaction([
    prisma.usuario.update({ where: { id: token.usuarioId }, data: { senhaHash, ativo: true } }),
    prisma.tokenAcao.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
    prisma.sessao.updateMany({
      where: { empresaId: token.empresaId, usuarioId: token.usuarioId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  return token.usuario;
}

export function resetPassword(token: string, password: string) {
  return consumeActionToken(token, TokenTipo.RECUPERACAO_SENHA, password);
}

export function acceptInvite(token: string, password: string) {
  return consumeActionToken(token, TokenTipo.CONVITE, password);
}

export async function changePassword(usuarioId: string, empresaId: string, current: string, next: string) {
  const user = await prisma.usuario.findFirst({ where: { id: usuarioId, empresaId, deletedAt: null } });
  if (!user || !(await bcrypt.compare(current, user.senhaHash))) {
    throw new AppError(400, 'INVALID_CURRENT_PASSWORD', 'A senha atual não confere.');
  }
  await prisma.$transaction([
    prisma.usuario.update({ where: { id: user.id }, data: { senhaHash: await bcrypt.hash(next, 12) } }),
    prisma.sessao.updateMany({ where: { empresaId, usuarioId, revokedAt: null }, data: { revokedAt: new Date() } }),
  ]);
}

export async function inviteUser(empresaId: string, nome: string, email: string, cargo?: string) {
  if (await prisma.usuario.findUnique({ where: { email } })) {
    throw new AppError(409, 'EMAIL_IN_USE', 'Este e-mail já está em uso.');
  }
  const user = await prisma.usuario.create({
    data: {
      empresaId,
      nome,
      email,
      cargo,
      senhaHash: await bcrypt.hash(generateOpaqueToken(), 12),
      ativo: false,
    },
  });
  const token = await createActionToken(user.id, TokenTipo.CONVITE);
  return { usuario: publicUser(user), token };
}
