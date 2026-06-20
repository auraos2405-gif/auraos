# AURA OS

Fundação da plataforma de inteligência operacional empresarial AURA OS.

## Stack

- Frontend: React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Zustand e React Query.
- Backend: Node.js 22, Express, TypeScript e Prisma.
- Dados: PostgreSQL 16 no Supabase e Redis.
- Deploy: Vercel, Railway e Docker.

## Estrutura

```text
apps/frontend       Aplicação web
apps/backend        API REST
packages/ui         Componentes compartilhados
packages/shared     Regras e validações compartilhadas
packages/types      Contratos TypeScript
infra/docker        Imagens de produção
docs                Decisões e operação
```

## Desenvolvimento local

Requisitos: Node.js 22+, npm e Docker.

1. Copie `.env.example` para `.env` e substitua todos os segredos.
2. Inicie PostgreSQL e Redis com `docker compose up postgres redis -d`.
3. Execute `npm install`.
4. Execute `npm run prisma:generate --workspace=@aura/backend`.
5. Execute `npm run db:migrate --workspace=@aura/backend`.
6. Execute `npm run db:seed --workspace=@aura/backend`.
7. Execute `npm run dev`.

O seed local cria `admin@aura.local` com senha `AuraDemo123`. Essa credencial é exclusivamente local e deve ser alterada ou removida em qualquer ambiente compartilhado.

## Qualidade

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

O backend atende em `http://localhost:3000`, o frontend em `http://localhost:5173` e o health check em `GET /health`.

## Escopo

O repositório contém as Sprints 1, 2 e 3:

- Foundation™: autenticação, sessões, convites, recuperação de senha, autorização, isolamento por empresa e auditoria.
- Executive Experience™: dashboard executivo, Índice AURA™, AuraHalo™, alertas e recomendações determinísticas.
- Finance Core™: categorias, fornecedores, clientes, contas a pagar, contas a receber e Financial Aggregator™.

OCR, integrações externas e os motores futuros de inteligência permanecem fora do escopo atual.
