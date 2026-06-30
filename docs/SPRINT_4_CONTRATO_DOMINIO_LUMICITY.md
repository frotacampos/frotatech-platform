# Sprint 4 - Contrato e dominio LumiCity no backend

Data: 2026-06-29

## Resumo executivo

Este sprint transformou a foundation FastAPI em um primeiro backend funcional de dominio para o LumiCity, ainda sem remover Base44 e sem conectar o frontend ao modo HTTP por padrao.

A decisao tecnica adotada foi:

```text
API base: /api/v1
Modulo LumiCity: /api/v1/lumicity/*
```

Foram criados banco via SQLAlchemy, Alembic, modelos iniciais, schemas Pydantic, migration inicial, seeds locais e endpoints foundation do modulo LumiCity.

## Estrutura revisada

Backend atual:

```text
platform/backend/
  alembic.ini
  alembic/
    env.py
    versions/
      0001_initial_lumicity_domain.py
  app/
    api/
    core/
    db/
      base.py
      session.py
    models/
    schemas/
    scripts/
      seed_demo.py
    modules/
      lumicity/
        router.py
        routes/
          health.py
          reports.py
          materials.py
          stock.py
  requirements.txt
  run_local.py
```

## Banco e migrations

Configuracao:

- `DATABASE_URL` lido em `app/core/config.py`.
- Padrao local sem Docker: `sqlite:///./frotatech_local.db`.
- Docker Compose continua configurado para PostgreSQL/PostGIS.

Comandos:

```powershell
cd platform/backend
alembic upgrade head
```

Estado validado:

```text
0001_initial_lumicity_domain (head)
```

## Modelos criados

- `Tenant`
- `User`
- `City`
- `Report`
- `Material`
- `StockMovement`
- `AuditLog`

## Schemas criados

- `TenantRead`
- `UserRead`
- `CityRead`
- `ReportCreate`
- `ReportRead`
- `MaterialRead`
- `StockMovementRead`
- `AuditLogRead`

## Seeds locais

Comando:

```powershell
cd platform/backend
python -m app.scripts.seed_demo
```

Dados criados:

- tenant `FrotaTech Demo`
- cidade `Cidade Demo`
- usuario admin `admin@frotatech.demo`
- tres chamados de exemplo
- tres materiais de exemplo
- movimentacoes iniciais de estoque
- audit log `demo.seeded`

Credencial reservada para a Sprint 5:

```text
admin@frotatech.demo / admin123
```

Observacao: login ainda nao foi implementado neste sprint.

## Endpoints criados

Foundation do modulo:

- `GET /api/v1/lumicity/health`
- `GET /api/v1/lumicity/reports`
- `POST /api/v1/lumicity/reports`
- `GET /api/v1/lumicity/materials`
- `GET /api/v1/lumicity/stock/movements`

Endpoints de plataforma mantidos:

- `GET /`
- `GET /health`
- `GET /api/v1/health`
- `GET /api/v1/modules`
- `GET /docs`

## Como rodar localmente

Backend:

```powershell
cd platform/backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python -m app.scripts.seed_demo
python run_local.py
```

Frontend permanece separado:

```powershell
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

## URLs para testar no Swagger

- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/api/v1/lumicity/health`
- `http://127.0.0.1:8000/api/v1/lumicity/reports`
- `http://127.0.0.1:8000/api/v1/lumicity/materials`
- `http://127.0.0.1:8000/api/v1/lumicity/stock/movements`

Exemplo de payload para `POST /api/v1/lumicity/reports`:

```json
{
  "title": "Luminaria apagada",
  "description": "Poste apagado proximo a praca central",
  "priority": "media",
  "address": "Rua Teste, 123",
  "neighborhood": "Centro"
}
```

## Providers HTTP do frontend

Os providers HTTP relacionados ao dominio LumiCity foram alinhados para o novo prefixo:

- `/lumicity/reports`
- `/lumicity/materials`
- `/lumicity/stock/movements`
- `/lumicity/cities`
- `/lumicity/companies`
- `/lumicity/citizens`

O frontend ainda nao foi conectado por padrao ao backend proprio. Base44 continua preservado.

## Validacoes executadas

- `python -m compileall platform/backend/app platform/backend/alembic`: OK.
- `alembic upgrade head`: OK.
- `python -m app.scripts.seed_demo`: OK e idempotente.
- `GET /api/v1/lumicity/health`: `200 OK`.
- `GET /api/v1/lumicity/reports`: `200 OK`.
- `POST /api/v1/lumicity/reports`: `201 Created`.
- `GET /api/v1/lumicity/materials`: `200 OK`.
- `GET /api/v1/lumicity/stock/movements`: `200 OK`.
- `npm.cmd run build`: OK.

Observacao: o build do frontend manteve o aviso esperado `[base44] Proxy not enabled (VITE_BASE44_APP_BASE_URL not set)`.

## O que nao foi alterado

- Base44 nao foi removido.
- Frontend nao foi conectado por padrao ao backend HTTP.
- Nenhuma tela ou UX foi alterada.
- IA, storage e realtime nao foram implementados.
- Auth JWT ainda nao foi implementado.

## Pendencias para Sprint 5 - Auth JWT e multi-tenancy

1. Implementar `POST /api/v1/auth/login`.
2. Implementar `GET /api/v1/auth/me`.
3. Implementar hash/validacao de senha usando `passlib`.
4. Emitir JWT com `python-jose`.
5. Criar dependencia FastAPI de usuario autenticado.
6. Criar dependencia FastAPI de tenant atual.
7. Aplicar filtro obrigatorio por tenant em queries LumiCity.
8. Definir roles iniciais: `admin`, `gestor`, `operador`, `cidadao`.
9. Proteger endpoints de escrita.
10. Atualizar `AuthContext.jsx` para parar de depender diretamente do bootstrap Base44 quando `VITE_API_MODE=http`.
