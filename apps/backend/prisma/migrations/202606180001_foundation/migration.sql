CREATE TYPE "EmpresaStatus" AS ENUM ('ATIVA', 'INATIVA', 'SUSPENSA');
CREATE TYPE "TokenTipo" AS ENUM ('RECUPERACAO_SENHA', 'CONVITE');

CREATE TABLE "empresas" (
  "id" UUID PRIMARY KEY,
  "nome" TEXT NOT NULL,
  "nome_fantasia" TEXT,
  "cnpj" TEXT,
  "email" TEXT NOT NULL,
  "telefone" TEXT,
  "plano" TEXT NOT NULL DEFAULT 'foundation',
  "status" "EmpresaStatus" NOT NULL DEFAULT 'ATIVA',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "usuarios" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "senha_hash" TEXT NOT NULL,
  "cargo" TEXT,
  "avatar" TEXT,
  "ultimo_acesso" TIMESTAMPTZ(3),
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "permissoes" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL,
  "usuario_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "modulo" TEXT NOT NULL,
  "visualizar" BOOLEAN NOT NULL DEFAULT false,
  "criar" BOOLEAN NOT NULL DEFAULT false,
  "editar" BOOLEAN NOT NULL DEFAULT false,
  "excluir" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "sessoes" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "usuario_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "token_hash" TEXT NOT NULL,
  "familia" UUID NOT NULL,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "revoked_at" TIMESTAMPTZ(3),
  "replaced_by_hash" TEXT,
  "ip" TEXT,
  "user_agent" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "tokens_acao" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "usuario_id" UUID NOT NULL REFERENCES "usuarios"("id") ON DELETE RESTRICT,
  "tipo" "TokenTipo" NOT NULL,
  "token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "used_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "auditoria" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "usuario_id" UUID REFERENCES "usuarios"("id") ON DELETE SET NULL,
  "acao" TEXT NOT NULL,
  "tabela" TEXT NOT NULL,
  "registro_id" UUID,
  "dados" JSONB,
  "ip" TEXT,
  "user_agent" TEXT,
  "request_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");
CREATE UNIQUE INDEX "empresas_email_key" ON "empresas"("email");
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
CREATE UNIQUE INDEX "usuarios_empresa_id_email_key" ON "usuarios"("empresa_id", "email");
CREATE INDEX "usuarios_empresa_id_idx" ON "usuarios"("empresa_id");
CREATE INDEX "usuarios_empresa_id_deleted_at_idx" ON "usuarios"("empresa_id", "deleted_at");
CREATE UNIQUE INDEX "permissoes_empresa_id_usuario_id_modulo_key" ON "permissoes"("empresa_id", "usuario_id", "modulo");
CREATE INDEX "permissoes_empresa_id_idx" ON "permissoes"("empresa_id");
CREATE UNIQUE INDEX "sessoes_token_hash_key" ON "sessoes"("token_hash");
CREATE INDEX "sessoes_empresa_id_usuario_id_idx" ON "sessoes"("empresa_id", "usuario_id");
CREATE INDEX "sessoes_expires_at_idx" ON "sessoes"("expires_at");
CREATE UNIQUE INDEX "tokens_acao_token_hash_key" ON "tokens_acao"("token_hash");
CREATE INDEX "tokens_acao_empresa_id_usuario_id_tipo_idx" ON "tokens_acao"("empresa_id", "usuario_id", "tipo");
CREATE INDEX "tokens_acao_expires_at_idx" ON "tokens_acao"("expires_at");
CREATE INDEX "auditoria_empresa_id_created_at_idx" ON "auditoria"("empresa_id", "created_at");
CREATE INDEX "auditoria_empresa_id_usuario_id_idx" ON "auditoria"("empresa_id", "usuario_id");

