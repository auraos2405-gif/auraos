import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AccessClaims = {
  sub: string;
  empresaId: string;
  email: string;
};

export function signAccessToken(claims: AccessClaims): string {
  return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
    issuer: 'aura-api',
    audience: 'aura-web',
  });
}

export function verifyAccessToken(token: string): AccessClaims {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'aura-api',
    audience: 'aura-web',
  }) as AccessClaims;
}

