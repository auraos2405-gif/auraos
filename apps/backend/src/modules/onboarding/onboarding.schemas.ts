import { emailSchema } from '@aura/shared';
import { z } from 'zod';

const onboardingPasswordSchema = z.string().min(8, 'A senha deve ter pelo menos 8 caracteres').max(72);

export const createCompanySchema = z.object({
  empresa: z.object({
    nome: z.string().trim().min(2).max(160),
    nomeFantasia: z.string().trim().max(160).optional().nullable(),
    cnpj: z.string().trim().max(20).optional().nullable(),
    telefone: z.string().trim().min(8).max(30),
    email: emailSchema,
    plano: z.enum(['foundation', 'professional', 'enterprise']).default('foundation'),
  }),
  administrador: z.object({
    nome: z.string().trim().min(2).max(120),
    email: emailSchema,
    senha: onboardingPasswordSchema,
    confirmarSenha: onboardingPasswordSchema,
  }),
}).superRefine((value, context) => {
  if (value.administrador.senha !== value.administrador.confirmarSenha) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['administrador', 'confirmarSenha'],
      message: 'A confirmação de senha não confere.',
    });
  }
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
