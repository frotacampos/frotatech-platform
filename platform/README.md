# FrotaTech Platform

Foundation tecnico para uma plataforma propria e reutilizavel entre LumiCity, UrbanEye AI e AquaFlow.

## Objetivo

Criar uma base backend comum para substituir gradualmente dependencias de plataformas externas, com modulos compartilhados de identidade, tenants, usuarios, auditoria, storage, IA, notificacoes e GIS.

## Estrutura

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
```

## Servicos planejados

- Backend FastAPI
- PostgreSQL com extensao PostGIS
- Redis para cache, filas leves e realtime futuro

## Como rodar com Docker

```powershell
cd platform
docker compose up --build
```

Endpoints iniciais:

- `GET http://127.0.0.1:8000/health`
- `GET http://127.0.0.1:8000/api/v1/health`
- `GET http://127.0.0.1:8000/api/v1/modules`
- `GET http://127.0.0.1:8000/api/v1/lumicity/health`
- `GET http://127.0.0.1:8000/api/v1/lumicity/reports`
- `GET http://127.0.0.1:8000/api/v1/lumicity/reports/{id}`
- `PATCH http://127.0.0.1:8000/api/v1/lumicity/reports/{id}`
- `DELETE http://127.0.0.1:8000/api/v1/lumicity/reports/{id}`
- `POST http://127.0.0.1:8000/api/v1/lumicity/reports/{id}/assign`
- `PATCH http://127.0.0.1:8000/api/v1/lumicity/reports/{id}/status`
- `GET http://127.0.0.1:8000/api/v1/lumicity/materials`
- `GET http://127.0.0.1:8000/api/v1/lumicity/stock/movements`
