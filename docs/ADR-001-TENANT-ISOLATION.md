# ADR-001 — Isolamento multiempresa

Status: aprovado.

## Decisão

Na v1.0, o isolamento é aplicado na camada de aplicação. O middleware de autenticação extrai `empresaId` do JWT assinado. Serviços e consultas autenticadas recebem esse contexto e aplicam `empresa_id` nos filtros. O frontend não é uma fonte confiável para definir tenant.

`empresas` é a raiz do tenant e, por definição, a única entidade de negócio sem `empresa_id`. Auditoria é append-only. RLS permanece desativada na v1.0.

## Verificação

Toda nova rota deve demonstrar em teste que:

- rejeita acesso sem autenticação;
- ignora qualquer tenant fornecido pelo cliente;
- filtra leitura e escrita pelo tenant autenticado;
- não retorna entidades excluídas logicamente.

