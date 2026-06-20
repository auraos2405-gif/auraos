import bcrypt from 'bcryptjs';
import type { PrismaClient } from '@prisma/client';
import { AppError } from '../../http/app-error.js';
import { createSession } from '../auth/auth.service.js';
import { createAdminMasterPermissions, createDefaultCompanySetup } from '../company/company.service.js';
import type { CreateCompanyInput } from './onboarding.schemas.js';

function normalizeOptional(value?: string | null) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export async function createCompanyWithAdmin(prisma: PrismaClient, input: CreateCompanyInput, ip?: string, userAgent?: string) {
  const { empresa, administrador } = input;
  const normalizedCnpj = normalizeOptional(empresa.cnpj);
  const normalizedNomeFantasia = normalizeOptional(empresa.nomeFantasia);

  const duplicateCompany = await prisma.empresa.findFirst({
    where: {
      deletedAt: null,
      OR: [
        { email: empresa.email },
        ...(normalizedCnpj ? [{ cnpj: normalizedCnpj }] : []),
        { nome: empresa.nome },
        ...(normalizedNomeFantasia ? [{ nomeFantasia: normalizedNomeFantasia }] : []),
      ],
    },
    select: { id: true },
  });
  if (duplicateCompany) {
    throw new AppError(409, 'COMPANY_ALREADY_EXISTS', 'Empresa ou e-mail já cadastrados.');
  }

  const duplicateUser = await prisma.usuario.findUnique({
    where: { email: administrador.email },
    select: { id: true },
  });
  if (duplicateUser) {
    throw new AppError(409, 'EMAIL_ALREADY_EXISTS', 'Este e-mail de administrador já está em uso.');
  }

  const passwordHash = await bcrypt.hash(administrador.senha, 12);

  const result = await prisma.$transaction(async (tx) => {
    const empresaCriada = await tx.empresa.create({
      data: {
        nome: empresa.nome,
        nomeFantasia: normalizedNomeFantasia,
        cnpj: normalizedCnpj,
        email: empresa.email,
        telefone: empresa.telefone,
        plano: empresa.plano,
      },
    });

    const usuarioCriado = await tx.usuario.create({
      data: {
        empresaId: empresaCriada.id,
        nome: administrador.nome,
        email: administrador.email,
        senhaHash: passwordHash,
        cargo: 'ADMIN MASTER',
      },
    });

    await createAdminMasterPermissions(tx, empresaCriada.id, usuarioCriado.id);
    await createDefaultCompanySetup(tx, empresaCriada.id, usuarioCriado);

    return { empresaCriada, usuarioCriado };
  });

  const session = await createSession(result.usuarioCriado, ip, userAgent);
  return { ...session, empresa: result.empresaCriada };
}
