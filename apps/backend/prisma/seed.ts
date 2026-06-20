import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const empresa = await prisma.empresa.upsert({
    where: { email: 'empresa@aura.local' },
    update: {},
    create: {
      nome: 'Empresa Demonstração AURA',
      nomeFantasia: 'AURA Demo',
      email: 'empresa@aura.local',
    },
  });

  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@aura.local' },
    update: {},
    create: {
      empresaId: empresa.id,
      nome: 'Administrador AURA',
      email: 'admin@aura.local',
      senhaHash: await bcrypt.hash('AuraDemo123', 12),
      cargo: 'Administrador',
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
    { nome: 'Serviços', tipo: 'RECEITA' as const },
    { nome: 'Fornecedores', tipo: 'DESPESA' as const },
    { nome: 'Operacional', tipo: 'DESPESA' as const },
  ]) {
    const exists = await prisma.categoria.findFirst({ where: { empresaId: empresa.id, nome: category.nome, deletedAt: null } });
    if (!exists) await prisma.categoria.create({ data: { empresaId: empresa.id, ...category } });
  }
}

main()
  .finally(async () => prisma.$disconnect());
