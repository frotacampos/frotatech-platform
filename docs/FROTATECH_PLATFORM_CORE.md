# FrotaTech Platform Core

## Objetivo

A FrotaTech Platform Core sera a base compartilhada para produtos SaaS da FrotaTech, iniciando pelo LumiCity e preparada para reutilizacao por UrbanEye AI e AquaFlow.

O objetivo e substituir gradualmente dependencias externas, como Base44, por uma API propria, modular, auditavel e escalavel.

## Arquitetura alvo

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

## Componentes centrais

### Identity/Auth

Responsavel por login, refresh token, JWT, politicas de senha, sessoes e integracao futura com SSO.

Implementacao inicial criada na Sprint 5:

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- Bearer token JWT.

### Tenants/Empresas

Responsavel por multi-tenancy, segregacao de dados, empresas contratantes, orgaos publicos e unidades operacionais.

### Users/Roles

Responsavel por usuarios, papeis, permissoes e politicas de acesso por modulo.

### Audit Logs

Responsavel por trilha de auditoria para acoes sensiveis, alteracoes de registros e eventos de seguranca.

### Storage

Responsavel por upload, download, URLs assinadas, anexos, imagens e documentos, com S3 ou Supabase como opcoes futuras.

### AI Service

Responsavel por chamadas a modelos de IA, prompts, logs de uso, limites por tenant e desacoplamento de provedores como OpenAI.

### Notification Service

Responsavel por notificacoes internas, email, WhatsApp/SMS futuro, webhooks e eventos operacionais.

### GIS/PostGIS

Responsavel por dados geograficos, camadas, consultas espaciais, mapas e relatorios por localizacao.

## Modulos de produto

### LumiCity

Gestao de iluminacao publica: chamados, materiais, equipes, empresas, fiscalizacao, mapas e relatorios.

### UrbanEye AI

Monitoramento urbano com visao computacional, cameras, eventos, alertas e analise operacional.

### AquaFlow

Operacoes de agua/saneamento, fluxo, ocorrencias, ativos, mapas e indicadores operacionais.

## Padrao de API

Base path:

```text
/api/v1
```

Endpoints de plataforma:

```text
/api/v1/auth
/api/v1/users
/api/v1/tenants
/api/v1/storage
/api/v1/ai
/api/v1/notifications
/api/v1/audit
```

Endpoints de modulos:

```text
/api/v1/lumicity/*
/api/v1/urbaneye
/api/v1/aquaflow
```

Endpoints foundation criados neste sprint:

```text
GET /health
GET /api/v1/health
GET /api/v1/modules
POST /api/v1/auth/login
GET /api/v1/auth/me
GET /api/v1/lumicity/health
GET /api/v1/lumicity/reports
POST /api/v1/lumicity/reports
GET /api/v1/lumicity/reports/{id}
PATCH /api/v1/lumicity/reports/{id}
DELETE /api/v1/lumicity/reports/{id}
POST /api/v1/lumicity/reports/{id}/assign
PATCH /api/v1/lumicity/reports/{id}/status
GET /api/v1/lumicity/materials
GET /api/v1/lumicity/stock/movements
```

## Principios

- API propria antes de migracao de dados em massa.
- Frontends continuam estaveis enquanto os providers sao trocados por etapas.
- Contratos HTTP versionados em `/api/v1`.
- Multi-tenancy desde a base.
- Auditoria e permissoes como capacidades centrais, nao extensoes tardias.
- Storage e IA desacoplados de fornecedores.
- PostgreSQL/PostGIS como banco principal.
- Redis para cache, filas leves e realtime futuro.
- Docker como caminho padrao de execucao local.
