# Sprint 1 — Foundation™

## Escopo entregue

- Monorepo com workspaces.
- API REST versionada em `/api/v1`.
- Login, logout e refresh token rotativo.
- Recuperação e troca de senha.
- Convite e ativação de usuário.
- Autorização por módulo e ação.
- Isolamento por `empresa_id` derivado da autenticação.
- Auditoria append-only para eventos da fundação.
- Layout global, login e dashboard protegido.
- Migration inicial e seed local.
- Docker e pipeline de CI.

## Decisões de segurança

- O cliente não informa o tenant nos endpoints autenticados.
- O access token expira em 15 minutos.
- Refresh tokens são opacos, armazenados como SHA-256 e rotacionados.
- Reutilização de sessão inválida revoga sua família.
- Senhas usam bcrypt com custo 12.
- Tokens de convite e recuperação são opacos, possuem hash, uso único e expiração de uma hora.
- Respostas de recuperação não revelam se o e-mail existe.
- A auditoria não possui soft delete.
- RLS não é usada na v1.0, conforme decisão aprovada.

## Endpoints da fundação

| Método | Endpoint | Autenticação |
|---|---|---|
| POST | `/api/v1/auth/login` | Pública |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Refresh token |
| POST | `/api/v1/auth/forgot-password` | Pública |
| POST | `/api/v1/auth/reset-password` | Token de ação |
| POST | `/api/v1/auth/accept-invite` | Token de ação |
| POST | `/api/v1/auth/change-password` | Bearer token |
| POST | `/api/v1/auth/invite` | Permissão `usuarios.criar` |
| GET | `/api/v1/usuarios/me` | Bearer token |
| GET | `/api/v1/usuarios` | Permissão `usuarios.visualizar` |
| GET | `/api/v1/dashboard/executive` | Bearer token |
| GET | `/health` | Pública |

## Integração de e-mail

O provedor transacional ainda não foi definido na arquitetura oficial. Em desenvolvimento, os endpoints de convite e recuperação retornam `developmentToken`. Em produção, esse campo é sempre omitido. Antes do deploy para usuários reais, um adaptador de e-mail deverá consumir esses tokens sem alterar o domínio de autenticação.

## Rollback

1. Reverter a aplicação para a imagem anterior no Railway/Vercel.
2. Migrations não devem ser revertidas destrutivamente em produção.
3. Em incidente de autenticação, revogar todas as sessões ativas no banco.
4. Restaurar banco somente conforme o runbook de backup validado do Supabase.

