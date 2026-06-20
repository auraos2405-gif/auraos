# Sprint 2 — Executive Experience™

## Escopo entregue

- Dashboard Executivo responsivo.
- Índice AURA™ determinístico e auditável.
- AuraHalo™ com cinco estados visuais.
- AuraMetricCard reutilizável.
- AuraRecommendationCard reutilizável.
- Conselho da AURA™ sem IA generativa.
- Alertas priorizados por severidade.
- Resumo de fluxo de caixa, liquidez, contas a pagar e contas a receber.
- Persistência de índices, alertas e recomendações.
- Seed executivo e testes automatizados.

## Snapshot financeiro

O Finance Core pertence à Sprint 3. Para não antecipar seus CRUDs, a Sprint 2 usa um snapshot financeiro armazenado em cada cálculo do Índice AURA™. Ele contém:

- quantidade de contas vencidas;
- quantidade de contas a vencer;
- liquidez disponível;
- recebimentos projetados;
- pagamentos projetados;
- horizonte em dias.

Na Sprint 3, um agregador do Finance Core produzirá esse mesmo contrato. O motor e o dashboard não precisarão ser reescritos.

## Fórmula do Índice AURA™ v1

O cálculo parte de 100 pontos e aplica penalidades limitadas:

| Componente | Penalidade máxima | Regra |
|---|---:|---|
| Contas vencidas | 30 | 6 pontos por conta |
| Contas a vencer | 10 | 1,5 ponto por conta |
| Cobertura de liquidez | 30 | Proporcional ao déficit de cobertura |
| Fluxo projetado | 20 | Proporcional ao déficit sobre pagamentos |

`fluxo projetado = liquidez + recebimentos - pagamentos`

O resultado é arredondado e limitado ao intervalo de 0 a 100.

| Score | Classificação | Halo |
|---:|---|---|
| 0–20 | Crítico | Vermelho |
| 21–40 | Risco | Laranja |
| 41–60 | Atenção | Amarelo |
| 61–80 | Saudável | Azul |
| 81–100 | Excelente | Verde |

## Regras determinísticas iniciais

- Contas vencidas: recomenda regularização prioritária.
- Contas próximas: recomenda reservar liquidez e revisar calendário.
- Fluxo negativo: recomenda antecipar cobranças e renegociar pagamentos.
- Fluxo positivo: recomenda preservar reserva e acompanhar recebimentos.
- Cinco ou mais vencimentos: gera alerta de concentração.

Toda recomendação armazena motivo, dados utilizados, confiança, origem e data.

## API

### `GET /api/v1/dashboard/executive`

Retorna o índice mais recente, tendência, resumo financeiro, alertas não lidos e recomendações ativas. O tenant é obtido exclusivamente do access token.

### `POST /api/v1/dashboard/alerts/:id/read`

Marca um alerta do tenant autenticado como lido. IDs pertencentes a outra empresa não são alterados.

## Estados da interface

O dashboard possui estados explícitos para carregamento, indisponibilidade, ausência de snapshot e dados completos. A primeira recomendação por prioridade é exibida como Conselho da AURA™.

## Fora do escopo

Não foram implementados OCR, Gmail, WhatsApp, Digital Twin, predições, IA generativa ou CRUD financeiro.

