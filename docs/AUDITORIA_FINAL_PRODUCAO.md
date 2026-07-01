# Auditoria Final de Producao - LumiCity / FrotaTech Platform

Data: 2026-07-01

## Resumo executivo

O problema de login em producao foi auditado nas tres camadas: frontend Vercel, backend Render e integracao HTTP.

Foram encontradas duas causas independentes:

1. O bundle atualmente publicado na Vercel esta antigo e nao contem o provider HTTP atual da FrotaTech Platform.
2. O endpoint publico `POST https://api.frotatech.dev.br/api/v1/auth/login` responde `500 Internal Server Error`, inclusive para usuario inexistente, indicando falha antes da validacao de credenciais, muito provavelmente migrations pendentes ou schema/tabelas ausentes no PostgreSQL Render.

Foi aplicada correcao no frontend para eliminar dependencia fragil de configuracao:

- fallback definitivo para `https://api.frotatech.dev.br/api/v1`;
- compatibilidade com `URL_BASE_API_VITE`;
- timeout de 30 segundos;
- logs controlados sem expor credenciais;
- erro passa a ser propagado para a tela em vez de carregamento indefinido.

Tambem foi ajustado o start do Render para suportar migrations automaticas via `RUN_MIGRATIONS_ON_START=true`.

## Evidencias de producao

Frontend publicado:

```text
https://lumicity.frotatech.dev.br
```

Asset inspecionado:

```text
https://lumicity.frotatech.dev.br/assets/index-dQLwh6Zt.js
```

Resultado da inspecao do asset atual:

```text
HasLumicityReports: false
HasHttpClientLog: false
HasProductionFallback: false
HasPlatformLogin: false
HasFrotatechAccessToken: false
```

Conclusao: a Vercel precisa receber novo deploy com a versao atual do projeto.

Backend publico:

```text
GET https://api.frotatech.dev.br/health -> 200
GET https://api.frotatech.dev.br/api/v1/health -> 200
OPTIONS https://api.frotatech.dev.br/api/v1/auth/login -> 200
POST https://api.frotatech.dev.br/api/v1/auth/login -> 500
```

CORS validado:

```text
Access-Control-Allow-Origin: https://lumicity.frotatech.dev.br
Access-Control-Allow-Origin: https://staging-lumicity.frotatech.dev.br
```

Conclusao: DNS/SSL/CORS estao funcionais. A falha restante esta no login contra banco/schema do Render.

## Correcao aplicada no frontend

Arquivo:

```text
src/lib/api/providers/http/httpClient.js
```

Comportamento novo:

```js
const productionApiBaseUrl = "https://api.frotatech.dev.br/api/v1";

const envApiBaseUrl = () => (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.URL_BASE_API_VITE ||
  productionApiBaseUrl
);
```

Timeout:

```text
30000 ms
```

Logs controlados em erro:

```text
[FrotaTech API]
- url
- endpoint
- method
- status
- message
- durationMs
```

Nao sao logados:

- senha;
- token;
- headers sensiveis;
- corpo da requisicao.

## Correcao aplicada no Vite

Arquivo:

```text
vite.config.js
```

Adicionado:

```js
envPrefix: ['VITE_', 'URL_BASE_API_VITE']
```

Isso permite compatibilidade com a variavel legada `URL_BASE_API_VITE`, embora o nome recomendado continue sendo `VITE_API_BASE_URL`.

## Correcao aplicada no Render

Arquivo:

```text
platform/backend/start.sh
```

O start agora aceita:

```env
RUN_MIGRATIONS_ON_START=true
RUN_DEMO_SEED_ON_START=false
```

Arquivo:

```text
render.yaml
```

Start command ajustado para:

```bash
sh start.sh
```

## Validacoes executadas

Build frontend:

```powershell
npm.cmd run build
```

Resultado:

```text
OK
```

Compilacao backend:

```powershell
python -m compileall platform/backend/app
python -m compileall platform/backend/alembic
```

Resultado:

```text
OK
```

Login local:

```text
POST http://127.0.0.1:8000/api/v1/auth/login -> token OK
GET http://127.0.0.1:8000/api/v1/auth/me -> admin@frotatech.demo / admin
```

Login producao:

```text
POST https://api.frotatech.dev.br/api/v1/auth/login -> 500
```

## Acoes obrigatorias para concluir producao

### 1. Publicar novo frontend na Vercel

Depois do Git push, rodar novo deploy da Vercel com:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=https://api.frotatech.dev.br/api/v1
```

Mesmo se `VITE_API_BASE_URL` estiver ausente, o novo codigo usa fallback para `https://api.frotatech.dev.br/api/v1`.

### 2. Publicar novo backend no Render

Atualizar o Web Service para usar:

```bash
Build Command: pip install -r requirements.txt
Start Command: sh start.sh
```

Variaveis:

```env
DATABASE_URL=<Render PostgreSQL Internal Database URL>
SECRET_KEY=<secret-longo>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=https://lumicity.frotatech.dev.br,https://staging-lumicity.frotatech.dev.br
API_V1_PREFIX=/api/v1
RUN_MIGRATIONS_ON_START=true
RUN_DEMO_SEED_ON_START=false
```

### 3. Executar seed uma vez, se o usuario demo for necessario

No Render Shell ou Job temporario:

```bash
python -m app.scripts.seed_demo
```

Nao deixar `RUN_DEMO_SEED_ON_START=true` permanente em producao.

## Checklist final

- Novo codigo enviado ao GitHub.
- Novo deploy da Vercel concluido.
- Novo deploy do Render concluido.
- Logs do Render confirmam `alembic upgrade head`.
- Seed demo executado uma unica vez, se necessario.
- `GET /health` retorna 200.
- `GET /api/v1/health` retorna 200.
- `POST /api/v1/auth/login` retorna token.
- `GET /api/v1/auth/me` retorna usuario com Bearer Token.
- Login na Vercel redireciona para dashboard.
- Dashboard carrega chamados do PostgreSQL.

## Status final

O codigo esta corrigido para producao, mas a plataforma so podera ser confirmada como pronta para uso publico depois de:

1. novo Git push;
2. novo deploy da Vercel;
3. novo deploy do Render;
4. migrations aplicadas no PostgreSQL Render;
5. seed executado se o login demo for usado.
