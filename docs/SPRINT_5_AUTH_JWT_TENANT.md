# Sprint 5 - Auth JWT e tenant obrigatorio

Data: 2026-06-29

## Resumo executivo

Este sprint implementou autenticacao propria com JWT no backend da FrotaTech Platform e protegeu as rotas do modulo LumiCity com usuario autenticado, roles minimas e filtro obrigatorio por tenant.

O frontend continua sem ativar `VITE_API_MODE=http` por padrao. Base44 permanece preservado.

## Auth JWT

Endpoints criados:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Implementado:

- hash de senha com `passlib` + `bcrypt`.
- validacao de senha.
- emissao de access token JWT com `python-jose`.
- settings/env:
  - `SECRET_KEY`
  - `ALGORITHM`
  - `ACCESS_TOKEN_EXPIRE_MINUTES`
- dependencia `get_current_user`.
- dependencia `get_current_tenant`.
- helper `require_roles`.
- autenticacao Bearer exibida no Swagger para rotas protegidas.

## Roles minimas

Roles usadas:

- `admin`
- `gestor`
- `operador`
- `cidadao`

Regras aplicadas neste sprint:

- leitura de chamados: `admin`, `gestor`, `operador`.
- criacao de chamados: `admin`, `gestor`, `operador`, `cidadao`.
- materiais: `admin`, `gestor`, `operador`.
- estoque: `admin`, `gestor`, `operador`.

## Tenant obrigatorio

As queries do LumiCity agora usam o tenant do usuario autenticado:

- `GET /api/v1/lumicity/reports`
- `POST /api/v1/lumicity/reports`
- `GET /api/v1/lumicity/materials`
- `GET /api/v1/lumicity/stock/movements`

O cliente nao escolhe mais `tenant_id` em runtime para estas operacoes. O backend aplica `current_user.tenant_id`.

## Seeds demo

O seed foi atualizado e ficou idempotente:

```powershell
cd platform/backend
python -m app.scripts.seed_demo
```

Usuarios garantidos:

- `admin@frotatech.demo / admin123`
- `gestor@frotatech.demo / gestor123`
- `operador@frotatech.demo / operador123`
- `cidadao@frotatech.demo / cidadao123`

Tenant:

- `FrotaTech Demo`

## Como testar login no Swagger

1. Acesse `http://127.0.0.1:8000/docs`.
2. Abra `POST /api/v1/auth/login`.
3. Use o payload:

```json
{
  "email": "admin@frotatech.demo",
  "password": "admin123"
}
```

4. Copie o valor de `access_token`.
5. Clique em `Authorize`.
6. Informe:

```text
Bearer SEU_TOKEN_AQUI
```

7. Teste:
   - `GET /api/v1/auth/me`
   - `GET /api/v1/lumicity/reports`
   - `GET /api/v1/lumicity/materials`
   - `GET /api/v1/lumicity/stock/movements`

## Frontend

O provider HTTP foi preparado para uso futuro:

- `authProvider.login` armazena o `access_token`.
- `httpRequest` envia `Authorization: Bearer <token>` quando houver token salvo.
- `authProvider.logout` limpa o token local.

O modo HTTP nao foi ativado por padrao e o `AuthContext.jsx` ainda nao foi migrado.

## Validacoes executadas

- `python -m compileall platform/backend/app platform/backend/alembic`: OK.
- `alembic upgrade head`: OK.
- `python -m app.scripts.seed_demo`: OK.
- Backend iniciado em `http://127.0.0.1:8000`: OK.
- `POST /api/v1/auth/login`: OK, token Bearer emitido.
- `GET /api/v1/auth/me` com Bearer token: OK.
- `GET /api/v1/lumicity/reports` sem token: `401`.
- `GET /api/v1/lumicity/reports` com token: OK, dados filtrados pelo tenant do usuario.
- `GET /api/v1/lumicity/materials` com operador: OK.
- `GET /api/v1/lumicity/stock/movements` com operador: OK.
- `GET /api/v1/lumicity/materials` com cidadao: `403`.
- `POST /api/v1/lumicity/reports` com cidadao: `201 Created`.
- `npm.cmd run build`: OK.

Observacao: o build do frontend manteve o aviso esperado `[base44] Proxy not enabled (VITE_BASE44_APP_BASE_URL not set)`.

## O que nao foi implementado

- refresh token.
- storage.
- IA.
- realtime.
- novas telas.
- permissoes complexas.
- painel de gestao de usuarios.
- ativacao do frontend em `VITE_API_MODE=http` por padrao.

## Pendencias para Sprint 6

1. Completar fluxo de chamados:
   - detalhe de chamado.
   - alteracao de status.
   - atribuicao de operador.
   - filtros por status, prioridade, cidade e periodo.
2. Implementar endpoints:
   - `GET /api/v1/lumicity/reports/{id}`
   - `PATCH /api/v1/lumicity/reports/{id}`
   - `POST /api/v1/lumicity/reports/{id}/assign`
   - `PATCH /api/v1/lumicity/reports/{id}/status`
3. Conectar primeiro fluxo frontend em `VITE_API_MODE=http`.
4. Ajustar `AuthContext.jsx` para autenticar via backend proprio quando `VITE_API_MODE=http`.
5. Criar testes automatizados para auth, roles e tenant isolation.
