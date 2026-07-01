# Deploy Render - FrotaTech Platform API

Este documento prepara o backend FastAPI da FrotaTech Platform para producao no Render, usando PostgreSQL gerenciado e dominio publico para a API.

## Estado atual

- Frontend LumiCity publicado em: `https://lumicity.frotatech.dev.br`
- Backend local atual: `http://127.0.0.1:8000`
- API versionada: `/api/v1`
- Health checks:
  - `GET /health`
  - `GET /api/v1/health`

## Arquivos de deploy

- `render.yaml`: blueprint opcional para criar Web Service e PostgreSQL.
- `Dockerfile`: pronto para usar `$PORT` se o deploy for por container.
- `start.sh`: comando de start portavel para ambientes Linux.
- `.env.production.example`: variaveis de producao esperadas.

## Variaveis obrigatorias

Configure no Render:

```env
DATABASE_URL=<Render PostgreSQL Internal Database URL>
SECRET_KEY=<secret-longo-e-aleatorio>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=https://lumicity.frotatech.dev.br,https://staging-lumicity.frotatech.dev.br
API_V1_PREFIX=/api/v1
RUN_MIGRATIONS_ON_START=true
RUN_DEMO_SEED_ON_START=false
```

Observacoes:

- O Render pode fornecer `DATABASE_URL` como `postgresql://...`.
- A aplicacao normaliza automaticamente `postgres://` e `postgresql://` para `postgresql+psycopg://`.
- `ALLOWED_ORIGINS` e a variavel oficial de CORS em producao.
- `CORS_ORIGINS` ainda funciona como fallback legado local.

## Opcao A - Blueprint com render.yaml

1. No Render, escolha **New > Blueprint**.
2. Conecte o repositorio GitHub do LumiCity.
3. Selecione o arquivo `render.yaml` na raiz do projeto.
4. Confirme a criacao dos recursos:
   - Web Service: `frotatech-platform-api`
   - PostgreSQL: `frotatech-platform-db`
5. Revise as variaveis de ambiente.
6. Gere ou substitua `SECRET_KEY` por um valor forte.
7. Execute o primeiro deploy.

O blueprint usa:

```bash
Root Directory: platform/backend
Build Command: pip install -r requirements.txt
Start Command: sh start.sh
Health Check Path: /health
```

## Opcao B - Criacao manual no Render

### 1. Criar PostgreSQL

1. No Render, escolha **New > PostgreSQL**.
2. Nome sugerido: `frotatech-platform-db`.
3. Database: `frotatech`.
4. User: `frotatech`.
5. Copie a **Internal Database URL**.

### 2. Criar Web Service

1. No Render, escolha **New > Web Service**.
2. Conecte o repositorio GitHub.
3. Configure:

```bash
Name: frotatech-platform-api
Root Directory: platform/backend
Runtime: Python
Build Command: pip install -r requirements.txt
Start Command: sh start.sh
Health Check Path: /health
```

4. Configure as variaveis de ambiente listadas acima.
5. Clique em **Deploy Web Service**.

## Migrations

Depois do primeiro deploy, rode as migrations no ambiente do Render:

```bash
alembic upgrade head
```

Se `RUN_MIGRATIONS_ON_START=true`, o `start.sh` executa `alembic upgrade head` automaticamente antes de iniciar o Uvicorn. Mesmo assim, no primeiro deploy de producao, confira os logs do Render para garantir que Alembic finalizou sem erro.

Se o Render Shell nao estiver disponivel no plano usado, crie um Job temporario com:

```bash
cd platform/backend
alembic upgrade head
```

## Seeds de demonstracao

Depois das migrations:

```bash
python -m app.scripts.seed_demo
```

Usuarios demo esperados:

```text
admin@frotatech.demo / admin123
gestor@frotatech.demo / gestor123
operador@frotatech.demo / operador123
cidadao@frotatech.demo / cidadao123
```

Use seed apenas em ambiente de demonstracao ou homologacao. Em producao real, troque senhas imediatamente.

Nao deixe `RUN_DEMO_SEED_ON_START=true` permanentemente em producao, porque o seed atual garante usuarios demo e redefine as senhas demo a cada execucao.

## Validacao da API

Com a URL publica gerada pelo Render:

```bash
curl https://<render-service-url>/health
curl https://<render-service-url>/api/v1/health
curl https://<render-service-url>/docs
```

Respostas esperadas:

```json
{"status":"ok","service":"frotatech-platform-core"}
```

```json
{"status":"ok","service":"frotatech-platform-core","api":"v1"}
```

## Conectar api.frotatech.dev.br

1. No Web Service do Render, abra **Settings > Custom Domains**.
2. Adicione:

```text
api.frotatech.dev.br
```

3. Copie o alvo DNS informado pelo Render.
4. No Cloudflare/DNS do dominio, crie ou ajuste:

```text
Type: CNAME
Name: api
Target: <alvo informado pelo Render>
Proxy: DNS only inicialmente
```

5. Aguarde a validacao SSL no Render.
6. Teste:

```bash
curl https://api.frotatech.dev.br/health
curl https://api.frotatech.dev.br/api/v1/health
```

7. Depois de validado, se quiser usar proxy Cloudflare, ative com cuidado e teste novamente `/health`, `/docs` e login JWT.

## Conectar o frontend depois do deploy

No projeto publicado do frontend, configure:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=https://api.frotatech.dev.br/api/v1
```

Depois redeploy o frontend.

## Checklist final

- PostgreSQL criado no Render.
- Web Service criado com root `platform/backend`.
- `DATABASE_URL` configurada com Internal Database URL.
- `SECRET_KEY` forte configurada.
- `ALLOWED_ORIGINS` inclui producao e staging.
- Deploy concluiu sem erro.
- `alembic upgrade head` executado.
- `python -m app.scripts.seed_demo` executado apenas se for ambiente demo.
- `/health` responde 200.
- `/api/v1/health` responde 200.
- `api.frotatech.dev.br` aponta para o Web Service.
- Frontend atualizado com `VITE_API_BASE_URL`.
