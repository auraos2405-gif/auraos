import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { email: 'megalojao1020@aura.local' },
    update: {
      nome: 'MegaLojao1020',
      nomeFantasia: 'MegaLojao1020',
      telefone: '(11) 99999-1020',
      plano: 'foundation',
    },
    create: {
      nome: 'MegaLojao1020',
      nomeFantasia: 'MegaLojao1020',
      email: 'megalojao1020@aura.local',
      telefone: '(11) 99999-1020',
      plano: 'foundation',
    },
  });

  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@aura.local' },
    update: {
      nome: 'Administrador MASTER',
      cargo: 'ADMIN MASTER',
    },
    create: {
      empresaId: empresa.id,
      nome: 'Administrador MASTER',
      email: 'admin@aura.local',
      senhaHash: await bcrypt.hash('AuraDemo123', 12),
      cargo: 'ADMIN MASTER',
    },
  });

  for (const modulo of ['usuarios', 'categorias', 'fornecedores', 'clientes', 'contas_pagar', 'contas_receber']) {
    await prisma.permissao.upsert({
      where: { empresaId_usuarioId_modulo: { empresaId: empresa.id, usuarioId: usuario.id, modulo } },
      update: { visualizar: true, criar: true, editar: true, excluir: true },
      create: { empresaId: empresa.id, usuarioId: usuario.id, modulo, visualizar: true, criar: true, editar: true, excluir: true },
    });
  }

  for (const category of [
    { nome: 'Vendas', tipo: 'RECEITA' as const },
    { nome: 'Servicos', tipo: 'RECEITA' as const },
    { nome: 'Fornecedores', tipo: 'DESPESA' as const },
    { nome: 'Operacional', tipo: 'DESPESA' as const },
  ]) {
    const exists = await prisma.categoria.findFirst({ where: { empresaId: empresa.id, nome: category.nome, deletedAt: null } });
    if (!exists) await prisma.categoria.create({ data: { empresaId: empresa.id, ...category } });
  }
}

main().finally(async () => prisma.$disconnect());
