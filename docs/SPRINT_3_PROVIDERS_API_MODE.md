# Sprint 3 - Providers e VITE_API_MODE

## Resumo executivo

O Sprint 3 separou a camada publica `src/lib/api/*` da implementacao concreta de dados. A aplicacao agora pode selecionar o provider ativo por `VITE_API_MODE`, preservando os contratos criados no Sprint 2 e mantendo o Base44 como provider padrao.

Nao foi criado backend FastAPI, nao houve remocao do Base44, nao foram alteradas telas, layout, UX ou regras de negocio.

## Arquitetura criada

Fluxo alvo implementado:

```text
Frontend LumiCity
  -> src/lib/api/*.js
  -> src/lib/api/providers/providerFactory.js
  -> provider ativo: base44 | mock | http
```

Estrutura adicionada:

```text
src/lib/api/providers/
  providerFactory.js
  base44/
  mock/
  http/
```

`providerFactory.js` le `import.meta.env.VITE_API_MODE` e aceita:

- `base44`: modo atual, usando Base44 internamente.
- `mock`: modo local/demo/offline com dados em memoria.
- `http`: modo preparado para futuro backend proprio.

Fallback: `base44`.

## Como alternar VITE_API_MODE

Crie ou atualize `.env.local` no diretorio raiz do projeto:

```env
VITE_API_MODE=mock
```

Modos recomendados:

```env
VITE_API_MODE=base44
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

```env
VITE_API_MODE=mock
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Apos alterar variaveis Vite, reinicie o dev server.

## Providers criados

Provider Base44:

- `src/lib/api/providers/base44/reportsProvider.js`
- `src/lib/api/providers/base44/materialsProvider.js`
- `src/lib/api/providers/base44/stockProvider.js`
- `src/lib/api/providers/base44/citizensProvider.js`
- `src/lib/api/providers/base44/companiesProvider.js`
- `src/lib/api/providers/base44/citiesProvider.js`
- `src/lib/api/providers/base44/usersProvider.js`
- `src/lib/api/providers/base44/authProvider.js`
- `src/lib/api/providers/base44/aiProvider.js`
- `src/lib/api/providers/base44/storageProvider.js`

Provider Mock:

- `src/lib/api/providers/mock/mockData.js`
- `src/lib/api/providers/mock/reportsProvider.js`
- `src/lib/api/providers/mock/materialsProvider.js`
- `src/lib/api/providers/mock/stockProvider.js`
- `src/lib/api/providers/mock/citizensProvider.js`
- `src/lib/api/providers/mock/companiesProvider.js`
- `src/lib/api/providers/mock/citiesProvider.js`
- `src/lib/api/providers/mock/usersProvider.js`
- `src/lib/api/providers/mock/authProvider.js`
- `src/lib/api/providers/mock/aiProvider.js`
- `src/lib/api/providers/mock/storageProvider.js`

Provider HTTP:

- `src/lib/api/providers/http/httpClient.js`
- `src/lib/api/providers/http/reportsProvider.js`
- `src/lib/api/providers/http/materialsProvider.js`
- `src/lib/api/providers/http/stockProvider.js`
- `src/lib/api/providers/http/citizensProvider.js`
- `src/lib/api/providers/http/companiesProvider.js`
- `src/lib/api/providers/http/citiesProvider.js`
- `src/lib/api/providers/http/usersProvider.js`
- `src/lib/api/providers/http/authProvider.js`
- `src/lib/api/providers/http/aiProvider.js`
- `src/lib/api/providers/http/storageProvider.js`

## Contratos preservados

Os adapters publicos continuam exportando os mesmos objetos:

- `reportsApi`
- `materialsApi`
- `stockApi`
- `citizensApi`
- `companiesApi`
- `citiesApi`
- `usersApi`
- `authApi`
- `aiApi`
- `storageApi`

Contratos principais mantidos:

- chamados: listar, obter, criar, atualizar, excluir, atribuir operador, alterar status e subscription.
- materiais: listar, obter, criar, atualizar e excluir logicamente.
- estoque: listar movimentacoes, criar movimentacao e buscar por material.
- cidadaos: login, cadastro, busca por CPF, listagem, atualizacao e exclusao.
- empresas e cidades: listagem, criacao, atualizacao e exclusao logica.
- usuarios: listagem, usuario atual, convite, atualizacao e exclusao.
- autenticacao: login, logout, usuario atual, atualizacao do usuario atual e role check.
- IA: sugestao de descricao, classificacao de prioridade, relatorio de tendencias e chatbot.
- storage: upload, URL publica e extracao de dados.

## Arquivos refatorados

Adapters publicos atualizados para delegar ao provider ativo:

- `src/lib/api/reportsApi.js`
- `src/lib/api/materialsApi.js`
- `src/lib/api/stockApi.js`
- `src/lib/api/citizensApi.js`
- `src/lib/api/companiesApi.js`
- `src/lib/api/citiesApi.js`
- `src/lib/api/usersApi.js`
- `src/lib/api/authApi.js`
- `src/lib/api/aiApi.js`
- `src/lib/api/storageApi.js`

Configuracao/documentacao:

- `.env.example`
- `docs/SPRINT_3_PROVIDERS_API_MODE.md`

## Limitacoes do modo mock

- Dados ficam em memoria e sao reiniciados ao recarregar o bundle.
- O mock cobre dados suficientes para desenvolvimento/demo das telas principais, mas nao substitui persistencia real.
- Upload de imagem retorna URL local temporaria quando o navegador permite `URL.createObjectURL`.
- IA retorna textos deterministicos, sem chamada a modelo real.
- Realtime/subscription retorna uma funcao vazia de unsubscribe.
- O bootstrap publico em `src/lib/AuthContext.jsx` ainda usa utilitario do SDK Base44 para carregar settings publicos; isso deve ser isolado em sprint posterior.

## Limitacoes do modo http

- O provider HTTP e um placeholder seguro para o futuro backend FastAPI.
- Espera `VITE_API_BASE_URL`, por padrao `http://127.0.0.1:8000/api/v1`.
- Nao ha backend real neste sprint, portanto chamadas em `VITE_API_MODE=http` podem falhar em runtime ate o Sprint de API.
- Os endpoints foram preparados no formato REST:
  - `GET /lumicity/reports`
  - `POST /lumicity/reports`
  - `GET /lumicity/reports/:id`
  - `PATCH /lumicity/reports/:id`
  - `DELETE /lumicity/reports/:id`
  - `GET /lumicity/materials`
  - `POST /lumicity/materials`
  - `PATCH /lumicity/materials/:id`
  - `DELETE /lumicity/materials/:id`
  - padrao equivalente para estoque, cidadaos, empresas, cidades, usuarios, auth, IA e storage.

## Dependencias Base44 ainda restantes

Base44 permanece propositalmente em:

- `src/api/base44Client.js`
- `src/lib/AuthContext.jsx`
- `src/lib/app-params.js`
- `src/lib/api/providers/base44/*`

Tambem ha mencoes textuais em paginas de documentacao do produto. Essas mencoes nao sao chamadas runtime.

## Validacoes executadas

Modo `base44`:

- `VITE_API_MODE=base44 npm.cmd run build`: OK.
- `VITE_API_MODE=base44 npm.cmd run dev -- --host 127.0.0.1 --port 5173`: OK.
- `Invoke-WebRequest -Uri http://127.0.0.1:5173 -UseBasicParsing`: `StatusCode 200`.

Modo `mock`:

- `VITE_API_MODE=mock npm.cmd run build`: OK.
- `VITE_API_MODE=mock npm.cmd run dev -- --host 127.0.0.1 --port 5173`: OK.
- `Invoke-WebRequest -Uri http://127.0.0.1:5173 -UseBasicParsing`: `StatusCode 200`.

Observacao: o Vite exibiu o aviso `[base44] Proxy not enabled (VITE_BASE44_APP_BASE_URL not set)` nos dois modos. Isso e esperado no ambiente local sem `.env.local` com URL Base44 real.

## Pendencias conhecidas mantidas fora do escopo

- Typecheck ainda possui falhas herdadas.
- Lint ainda possui imports nao usados herdados.
- `npm audit` ainda aponta vulnerabilidades herdadas.
- Nao houve tentativa de `npm audit fix`.
- Nao houve migracao para banco relacional.
- Nao houve criacao de backend FastAPI.
- Nao houve alteracao de layout, UX ou regra de negocio.

## Proximos passos para Sprint 4

1. Isolar `AuthContext.jsx` para consumir `authApi`/provider de settings, removendo dependencia direta do SDK Base44 no bootstrap.
2. Definir contrato formal REST para FastAPI, incluindo schemas de request/response.
3. Criar testes unitarios leves para `providerFactory` e providers mock/http.
4. Mapear endpoints de auditoria, permissoes e multi-tenant antes da implementacao do backend.
5. Planejar persistencia PostgreSQL/PostGIS e storage S3/Supabase sem alterar o frontend.
