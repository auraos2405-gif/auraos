CREATE TYPE "AuraClassificacao" AS ENUM ('CRITICO', 'RISCO', 'ATENCAO', 'SAUDAVEL', 'EXCELENTE');
CREATE TYPE "AlertaSeveridade" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'CRITICA');
CREATE TYPE "RecomendacaoStatus" AS ENUM ('ATIVA', 'CONCLUIDA', 'IGNORADA');

CREATE TABLE "aura_indices" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "score" INTEGER NOT NULL,
  "classificacao" "AuraClassificacao" NOT NULL,
  "contas_vencidas" INTEGER NOT NULL,
  "contas_a_vencer" INTEGER NOT NULL,
  "liquidez" DECIMAL(15,2) NOT NULL,
  "recebimentos" DECIMAL(15,2) NOT NULL,
  "pagamentos" DECIMAL(15,2) NOT NULL,
  "fluxo_projetado" DECIMAL(15,2) NOT NULL,
  "componentes" JSONB NOT NULL,
  "periodo_dias" INTEGER NOT NULL DEFAULT 30,
  "calculado_em" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "aura_alertas" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT NOT NULL,
  "severidade" "AlertaSeveridade" NOT NULL,
  "origem" TEXT NOT NULL,
  "evidencia" JSONB,
  "lido" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "aura_recomendacoes" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "titulo" TEXT NOT NULL,
  "observacao" TEXT NOT NULL,
  "impacto" TEXT NOT NULL,
  "recomendacao" TEXT NOT NULL,
  "motivo" TEXT NOT NULL,
  "dados_utilizados" JSONB NOT NULL,
  "confidence_score" DECIMAL(3,2) NOT NULL,
  "origem" TEXT NOT NULL,
  "prioridade" INTEGER NOT NULL DEFAULT 0,
  "status" "RecomendacaoStatus" NOT NULL DEFAULT 'ATIVA',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE INDEX "aura_indices_empresa_id_calculado_em_idx" ON "aura_indices"("empresa_id", "calculado_em");
CREATE INDEX "aura_alertas_empresa_id_lido_created_at_idx" ON "aura_alertas"("empresa_id", "lido", "created_at");
CREATE INDEX "aura_alertas_empresa_id_severidade_idx" ON "aura_alertas"("empresa_id", "severidade");
CREATE INDEX "aura_recomendacoes_empresa_id_status_prioridade_idx" ON "aura_recomendacoes"("empresa_id", "status", "prioridade");
CREATE INDEX "aura_recomendacoes_empresa_id_created_at_idx" ON "aura_recomendacoes"("empresa_id", "created_at");
