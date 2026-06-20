import { generateOpaqueToken, hashToken } from '../src/lib/crypto.js';
import { signAccessToken, verifyAccessToken } from '../src/lib/jwt.js';
import {
  acceptInviteSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  inviteSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from '../src/modules/auth/auth.schemas.js';

describe('Foundation security primitives', () => {
  it('generates unique opaque tokens and deterministic non-reversible hashes', () => {
    const first = generateOpaqueToken();
    const second = generateOpaqueToken();
    expect(first).not.toBe(second);
    expect(hashToken(first)).toHaveLength(64);
    expect(hashToken(first)).toBe(hashToken(first));
    expect(hashToken(first)).not.toContain(first);
  });

  it('signs and validates tenant-bound access tokens', () => {
    const claims = { sub: 'user-id', empresaId: 'tenant-id', email: 'admin@aura.local' };
    const token = signAccessToken(claims);
    expect(verifyAccessToken(token)).toEqual(expect.objectContaining(claims));
    expect(() => verifyAccessToken(`${token}invalid`)).toThrow();
  });

  it('validates and normalizes auth payloads', () => {
    expect(loginSchema.parse({ email: ' ADMIN@AURA.LOCAL ', senha: 'x' }).email).toBe('admin@aura.local');
    expect(refreshSchema.safeParse({ refreshToken: '' }).success).toBe(false);
    expect(forgotPasswordSchema.safeParse({ email: 'invalid' }).success).toBe(false);
    expect(inviteSchema.safeParse({ nome: 'A', email: 'a@a.com' }).success).toBe(false);
  });

  it('enforces strong passwords in every password-changing flow', () => {
    expect(resetPasswordSchema.safeParse({ token: 'token', novaSenha: 'weak' }).success).toBe(false);
    expect(acceptInviteSchema.safeParse({ token: 'token', senha: 'AuraDemo123' }).success).toBe(true);
    expect(changePasswordSchema.safeParse({ senhaAtual: 'old', novaSenha: 'AuraDemo123' }).success).toBe(true);
  });
});

