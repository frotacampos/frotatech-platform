# Sprint 3 - FrotaTech Foundation

## Resumo executivo

Este sprint criou a fundacao tecnica da FrotaTech Platform Core dentro do repositorio do LumiCity, sem conectar o frontend ao backend e sem remover Base44.

A nova pasta `platform/` contem um backend FastAPI minimo, preparado para evoluir como API propria compartilhada entre LumiCity, UrbanEye AI e AquaFlow.

## Arquitetura criada

```text
FrotaTech Platform Core
  Identity/Auth
  Tenants/Empresas
  Users/Roles
  Audit Logs
  Storage
  AI Service
  Notification Service
  GIS/PostGIS
  Modulos
    LumiCity
    UrbanEye AI
    AquaFlow
```

Camada inicial criada:

```text
platform/
  backend/
    app/
      main.py
      core/
      db/
      api/
      models/
      schemas/
      services/
      modules/
        lumicity/
    requirements.txt
    Dockerfile
    README.md
  docker-compose.yml
  README.md
```

## Endpoints criados

- `GET /health`
- `GET /api/v1/health`
- `GET /api/v1/modules`
- `GET /`

Resposta esperada de `/api/v1/modules`:

```json
{
  "modules": [
    { "key": "lumicity", "name": "LumiCity" },
    { "key": "urbaneye", "name": "UrbanEye AI" },
    { "key": "aquaflow", "name": "AquaFlow" }
  ]
}
```

## Como rodar localmente

Com Docker:

```powershell
cd platform
docker compose up --build
```

Sem Docker:

```powershell
cd platform/backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Atalho local para Windows:

```powershell
python run_local.py
```

Validacao:

```powershell
Invoke-WebRequest -Uri http://127.0.0.1:8000/ -UseBasicParsing
Invoke-WebRequest -Uri http://127.0.0.1:8000/health -UseBasicParsing
Invoke-WebRequest -Uri http://127.0.0.1:8000/api/v1/health -UseBasicParsing
Invoke-WebRequest -Uri http://127.0.0.1:8000/api/v1/modules -UseBasicParsing
```

## Variaveis futuras

- `APP_ENV`
- `DATABASE_URL`
- `REDIS_URL`
- `SECRET_KEY`
- `ALGORITHM`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `S3_ENDPOINT_URL`
- `S3_BUCKET_NAME`
- `OPENAI_API_KEY`
- `API_V1_PREFIX`

## O que nao foi alterado

- Frontend LumiCity nao foi conectado ao backend.
- Base44 nao foi removido.
- UX, layout e telas nao foram alterados.
- Banco de dados nao foi migrado.
- Regras de negocio nao foram modificadas.
- Pendencias de lint, typecheck e audit continuam fora do escopo.

## Validacoes executadas

Resultados deste sprint:

- Backend FastAPI subiu localmente em `http://127.0.0.1:8000`.
- `GET /`: `200 OK`.
- `GET /health`: `200 OK`.
- `GET /api/v1/health`: `200 OK`.
- `GET /api/v1/modules`: `200 OK`, listando `lumicity`, `urbaneye` e `aquaflow`.
- `npm.cmd run build`: OK para o frontend LumiCity.

Observacoes de ambiente:

- `docker compose config` validou a configuracao do Compose.
- `docker compose up --build -d` nao foi concluido porque o Docker Desktop daemon nao estava ativo neste ambiente (`dockerDesktopLinuxEngine` indisponivel).
- Para validar a API, foi usado um venv temporario fora do repositorio, em `work/.frotatech-platform-venv`.
- O build do frontend manteve o aviso esperado `[base44] Proxy not enabled (VITE_BASE44_APP_BASE_URL not set)`.

## Proximos passos

1. Definir schemas Pydantic por dominio compartilhado: auth, users, tenants, audit e storage.
2. Criar configuracao real por ambiente com `pydantic-settings`.
3. Criar conexao SQLAlchemy/Alembic sem migrar dados ainda.
4. Desenhar contratos REST do modulo LumiCity alinhados aos adapters `http`.
5. Iniciar Sprint de autenticacao JWT e multi-tenancy.
