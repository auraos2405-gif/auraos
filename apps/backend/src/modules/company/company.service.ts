import { AlertaSeveridade, AuraClassificacao, CategoriaTipo, RecomendacaoStatus } from '@prisma/client';
import type { Prisma, Usuario } from '@prisma/client';

const adminModules = [
  'usuarios',
  'categorias',
  'fornecedores',
  'clientes',
  'contas_pagar',
  'contas_receber',
  'dashboard',
  'onboarding',
  'configuracoes',
  'relatorios',
];

const defaultCategories = [
  { nome: 'Vendas', tipo: CategoriaTipo.RECEITA },
  { nome: 'Serviços', tipo: CategoriaTipo.RECEITA },
  { nome: 'Fornecedores', tipo: CategoriaTipo.DESPESA },
  { nome: 'Operacional', tipo: CategoriaTipo.DESPESA },
];

type PrismaWriter = Prisma.TransactionClient;

export async function createAdminMasterPermissions(prisma: PrismaWriter, empresaId: string, usuarioId: string) {
  await Promise.all(
    adminModules.map((modulo) =>
      prisma.permissao.create({
        data: {
          empresaId,
          usuarioId,
          modulo,
          visualizar: true,
          criar: true,
          editar: true,
          excluir: true,
        },
      }),
    ),
  );
}

export async function createDefaultCompanySetup(prisma: PrismaWriter, empresaId: string, usuario?: Usuario) {
  await Promise.all(defaultCategories.map((category) => prisma.categoria.create({ data: { empresaId, ...category } })));

  await prisma.auraIndice.create({
    data: {
      empresaId,
      score: 72,
      classificacao: AuraClassificacao.SAUDAVEL,
      contasVencidas: 0,
      contasAVencer: 0,
      liquidez: 0,
      recebimentos: 0,
      pagamentos: 0,
      fluxoProjetado: 0,
      componentes: {
        onboarding: true,
        origem: 'AURA_FIRST_ACCESS_1_0',
      },
    },
  });

  await prisma.auraAlerta.create({
    data: {
      empresaId,
      titulo: 'Configure sua operação financeira',
      descricao: 'Cadastre categorias, fornecedores, clientes e boletos para ativar leituras mais precisas da Aura.',
      severidade: AlertaSeveridade.BAIXA,
      origem: 'onboarding',
      evidencia: { etapa: 'primeiro_acesso' },
    },
  });

  await prisma.auraRecomendacao.create({
    data: {
      empresaId,
      titulo: 'Comece pelo assistente de configuração',
      observacao: usuario ? `${usuario.nome}, sua empresa já está pronta para os primeiros cadastros.` : 'Sua empresa já está pronta para os primeiros cadastros.',
      impacto: 'Acelera a leitura inicial da AURA OS.',
      recomendacao: 'Siga os passos: categorias, fornecedores, clientes, boletos e Aura Copilot.',
      motivo: 'Primeiro acesso concluído sem dados operacionais importados.',
      dadosUtilizados: { origem: 'AURA_FIRST_ACCESS_1_0' },
      confidenceScore: 0.95,
      origem: 'onboarding',
      prioridade: 10,
      status: RecomendacaoStatus.ATIVA,
    },
  });
}
