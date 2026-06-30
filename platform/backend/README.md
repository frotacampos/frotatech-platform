# FrotaTech Platform Backend

Backend FastAPI para a FrotaTech Platform Core.

## Desenvolvimento local

```powershell
cd platform/backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Atalho local usado em Windows:

```powershell
python run_local.py
```

## Migrations

```powershell
cd platform/backend
alembic upgrade head
```

## Seeds locais

```powershell
cd platform/backend
python -m app.scripts.seed_demo
```

Credenciais seedadas para a Sprint 5:

- `admin@frotatech.demo / admin123`
- `gestor@frotatech.demo / gestor123`
- `operador@frotatech.demo / operador123`
- `cidadao@frotatech.demo / cidadao123`

## Endpoints iniciais

- `GET /`
- `GET /health`
- `GET /api/v1/health`
- `GET /api/v1/modules`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/lumicity/health`
- `GET /api/v1/lumicity/reports`
- `POST /api/v1/lumicity/reports`
- `GET /api/v1/lumicity/reports/{id}`
- `PATCH /api/v1/lumicity/reports/{id}`
- `DELETE /api/v1/lumicity/reports/{id}`
- `POST /api/v1/lumicity/reports/{id}/assign`
- `PATCH /api/v1/lumicity/reports/{id}/status`
- `GET /api/v1/lumicity/materials`
- `GET /api/v1/lumicity/stock/movements`

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
