# Sprint 3 — Finance Core™

## Escopo entregue

- CRUD de categorias, fornecedores e clientes.
- CRUD de contas a pagar e contas a receber.
- Soft delete, RBAC, auditoria e isolamento multiempresa em todos os endpoints.
- Financial Aggregator™ baseado em lançamentos reais.
- Atualização automática do Índice AURA™, alertas e recomendações após mutações financeiras.
- Telas responsivas com pesquisa, criação, edição e exclusão.
- Migration, seed de categorias e permissões.

## Financial Snapshot

O agregador utiliza um horizonte móvel de 30 dias:

- `contasVencidas`: obrigações em aberto anteriores ao dia atual;
- `contasAVencer`: obrigações em aberto dentro dos próximos 30 dias;
- `pagamentos`: total em aberto vencido ou dentro do horizonte;
- `recebimentos`: total em aberto vencido ou dentro do horizonte;
- `liquidez`: total histórico recebido menos total histórico pago.

Lançamentos cancelados e excluídos logicamente são ignorados. O resultado mantém exatamente o contrato `FinancialSnapshot` definido na Sprint 2.

## Atualização executiva

Após criar, editar ou excluir uma conta:

1. O agregador lê as contas do tenant autenticado.
2. O Índice AURA™ é recalculado.
3. Alertas determinísticos anteriores são arquivados logicamente.
4. Recomendações ativas anteriores são concluídas.
5. Um novo índice, alertas e recomendações são persistidos.
6. O dashboard continua consumindo `GET /api/v1/dashboard/executive` sem alteração de contrato.

## API

Cada recurso oferece `GET /`, `GET /:id`, `POST /`, `PUT /:id` e `DELETE /:id`:

- `/api/v1/categorias`
- `/api/v1/fornecedores`
- `/api/v1/clientes`
- `/api/v1/finance/contas-pagar`
- `/api/v1/finance/contas-receber`

Listagens aceitam `q`, `page` e `limit`. Contas aceitam `status`; categorias aceitam `tipo`.

## Segurança

- `empresa_id` nunca é aceito no payload.
- O tenant vem exclusivamente do access token.
- Relações com categoria, fornecedor ou cliente são verificadas no mesmo tenant.
- Leituras, alterações e soft deletes incluem `empresa_id` no filtro.
- Permissões são verificadas por módulo e ação.
- Criação, edição, exclusão, pagamento e recebimento geram auditoria.

## Fora do escopo

Não foram implementados OCR, Gmail, WhatsApp, IA generativa, Digital Twin, Prediction Engine, Memory Engine, contas bancárias ou conciliação.

