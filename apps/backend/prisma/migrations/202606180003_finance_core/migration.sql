CREATE TYPE "CategoriaTipo" AS ENUM ('RECEITA', 'DESPESA');
CREATE TYPE "ContaPagarStatus" AS ENUM ('PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO');
CREATE TYPE "ContaReceberStatus" AS ENUM ('PENDENTE', 'RECEBIDO', 'VENCIDO', 'CANCELADO');

CREATE TABLE "categorias" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "nome" TEXT NOT NULL,
  "tipo" "CategoriaTipo" NOT NULL,
  "ativo" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "fornecedores" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "nome" TEXT NOT NULL,
  "documento" TEXT,
  "email" TEXT,
  "telefone" TEXT,
  "observacoes" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "clientes" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "nome" TEXT NOT NULL,
  "documento" TEXT,
  "email" TEXT,
  "telefone" TEXT,
  "observacoes" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "contas_pagar" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "fornecedor_id" UUID NOT NULL REFERENCES "fornecedores"("id") ON DELETE RESTRICT,
  "categoria_id" UUID NOT NULL REFERENCES "categorias"("id") ON DELETE RESTRICT,
  "descricao" TEXT NOT NULL,
  "valor" DECIMAL(15,2) NOT NULL,
  "emissao" DATE NOT NULL,
  "vencimento" DATE NOT NULL,
  "status" "ContaPagarStatus" NOT NULL DEFAULT 'PENDENTE',
  "linha_digitavel" TEXT,
  "pix_copia_cola" TEXT,
  "observacoes" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE TABLE "contas_receber" (
  "id" UUID PRIMARY KEY,
  "empresa_id" UUID NOT NULL REFERENCES "empresas"("id") ON DELETE RESTRICT,
  "cliente_id" UUID NOT NULL REFERENCES "clientes"("id") ON DELETE RESTRICT,
  "categoria_id" UUID NOT NULL REFERENCES "categorias"("id") ON DELETE RESTRICT,
  "descricao" TEXT NOT NULL,
  "valor" DECIMAL(15,2) NOT NULL,
  "emissao" DATE NOT NULL,
  "vencimento" DATE NOT NULL,
  "status" "ContaReceberStatus" NOT NULL DEFAULT 'PENDENTE',
  "observacoes" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  "deleted_at" TIMESTAMPTZ(3)
);

CREATE INDEX "categorias_empresa_id_tipo_ativo_idx" ON "categorias"("empresa_id", "tipo", "ativo");
CREATE INDEX "categorias_empresa_id_deleted_at_idx" ON "categorias"("empresa_id", "deleted_at");
CREATE INDEX "fornecedores_empresa_id_nome_idx" ON "fornecedores"("empresa_id", "nome");
CREATE INDEX "fornecedores_empresa_id_documento_idx" ON "fornecedores"("empresa_id", "documento");
CREATE INDEX "clientes_empresa_id_nome_idx" ON "clientes"("empresa_id", "nome");
CREATE INDEX "clientes_empresa_id_documento_idx" ON "clientes"("empresa_id", "documento");
CREATE INDEX "contas_pagar_empresa_id_status_vencimento_idx" ON "contas_pagar"("empresa_id", "status", "vencimento");
CREATE INDEX "contas_pagar_empresa_id_fornecedor_id_idx" ON "contas_pagar"("empresa_id", "fornecedor_id");
CREATE INDEX "contas_pagar_empresa_id_categoria_id_idx" ON "contas_pagar"("empresa_id", "categoria_id");
CREATE INDEX "contas_receber_empresa_id_status_vencimento_idx" ON "contas_receber"("empresa_id", "status", "vencimento");
CREATE INDEX "contas_receber_empresa_id_cliente_id_idx" ON "contas_receber"("empresa_id", "cliente_id");
CREATE INDEX "contas_receber_empresa_id_categoria_id_idx" ON "contas_receber"("empresa_id", "categoria_id");
