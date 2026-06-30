# Sprint 6 - Chamados completos e frontend em modo HTTP

Data: 2026-06-29

## Resumo executivo

Este sprint completou o fluxo backend de chamados do LumiCity e iniciou a preparacao real do frontend para operar contra a API propria usando `VITE_API_MODE=http`.

Base44 continua preservado e continua sendo usado quando `VITE_API_MODE=base44`. Nao foram criadas telas novas, nem implementados upload, IA, realtime ou refresh token.

## Endpoints implementados

Chamados:

- `GET /api/v1/lumicity/reports`
- `POST /api/v1/lumicity/reports`
- `GET /api/v1/lumicity/reports/{id}`
- `PATCH /api/v1/lumicity/reports/{id}`
- `DELETE /api/v1/lumicity/reports/{id}`
- `POST /api/v1/lumicity/reports/{id}/assign`
- `PATCH /api/v1/lumicity/reports/{id}/status`

Mantidos:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/lumicity/materials`
- `GET /api/v1/lumicity/stock/movements`

## Filtros em GET /reports

Filtros implementados:

- `status`
- `priority`
- `city_id`
- `assigned_operator_id`
- `neighborhood`
- `date_from`
- `date_to`
- `search`

Exemplo:

```text
GET /api/v1/lumicity/reports?status=em_andamento&priority=media&neighborhood=Centro&search=luminaria
```

## Seguranca e tenant

Todas as queries de chamados continuam escopadas por tenant do usuario autenticado.

Regras aplicadas:

- `admin` e `gestor`: CRUD completo, atribuicao e mudanca de status.
- `operador`: listar, ver detalhe e mudar status apenas de chamados atribuidos a ele.
- `cidadao`: criar chamado e listar/ver apenas chamados criados por ele.

O modelo `Report` recebeu `created_by_user_id` para permitir o vinculo de cidadao com seus proprios chamados.

## Auditoria

Eventos gravados em `audit_logs`:

- `report.created`
- `report.updated`
- `report.status_changed`
- `report.assigned`
- `report.deleted`

## Frontend HTTP

Preparado neste sprint:

- `reportsProvider` HTTP cobre todos os endpoints de chamados.
- `httpClient` envia `Authorization: Bearer <token>` automaticamente quando houver token salvo.
- `authProvider` HTTP faz login, salva token e permite `/auth/me`.
- `AuthContext.jsx` passa a evitar bootstrap Base44 quando `VITE_API_MODE=http`.
- Base44 segue preservado quando `VITE_API_MODE=base44`.

## Como ativar frontend em VITE_API_MODE=http

Crie ou ajuste `.env.local` na raiz do frontend:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Depois reinicie o Vite:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Observacao: ainda nao foi criada uma tela de login propria. Para uso completo no navegador, o token JWT precisa ser obtido via Swagger/API e salvo pelo fluxo HTTP futuro. O `AuthContext` ja esta preparado para validar `/auth/me` quando houver token.

## Como testar no Swagger

1. Acesse `http://127.0.0.1:8000/docs`.
2. Execute `POST /api/v1/auth/login`.
3. Use:

```json
{
  "email": "admin@frotatech.demo",
  "password": "admin123"
}
```

4. Copie `access_token`.
5. Clique em `Authorize`.
6. Informe `Bearer SEU_TOKEN`.
7. Teste os endpoints de `/api/v1/lumicity/reports`.

## Validacoes executadas

- `python -m compileall app alembic`: OK.
- `alembic upgrade head`: OK.
- `python -m app.scripts.seed_demo`: OK.
- `POST /api/v1/auth/login`: OK.
- `GET /api/v1/lumicity/reports` sem token: `401`.
- `GET /api/v1/lumicity/reports` com token: OK.
- `GET /api/v1/lumicity/reports/{id}`: OK.
- `POST /api/v1/lumicity/reports`: OK.
- `PATCH /api/v1/lumicity/reports/{id}`: OK.
- `PATCH /api/v1/lumicity/reports/{id}/status`: OK.
- `POST /api/v1/lumicity/reports/{id}/assign`: OK.
- `DELETE /api/v1/lumicity/reports/{id}`: `204`.
- filtros principais: OK.
- operador muda status de chamado atribuido: OK.
- operador nao edita chamado via `PATCH`: `403`.
- cidadao lista apenas chamados criados por ele: OK.
- audit logs gravados: OK.
- `npm.cmd run build`: OK.

## O que nao foi implementado

- upload de imagens.
- IA.
- realtime.
- painel completo de usuarios.
- telas grandes novas.
- refresh token.

## Pendencias para Sprint 7

1. Completar materiais:
   - detalhe de material.
   - criacao/edicao/inativacao.
   - filtros de estoque baixo.
2. Completar estoque:
   - entradas.
   - saidas.
   - baixa de material por chamado.
   - validacao de saldo.
3. Relatorios basicos:
   - chamados por status.
   - chamados por bairro/cidade.
   - consumo de materiais.
4. Testes automatizados para chamados, roles e auditoria.
