import { emailSchema, passwordSchema } from '@aura/shared';
import { z } from 'zod';

export const loginSchema = z.object({ email: emailSchema, senha: z.string().min(1) });
export const refreshSchema = z.object({ refreshToken: z.string().min(1) });
export const logoutSchema = refreshSchema;
export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: z.string().min(1), novaSenha: passwordSchema });
export const changePasswordSchema = z.object({ senhaAtual: z.string().min(1), novaSenha: passwordSchema });
export const inviteSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: emailSchema,
  cargo: z.string().trim().max(80).optional(),
});
export const acceptInviteSchema = z.object({ token: z.string().min(1), senha: passwordSchema });

