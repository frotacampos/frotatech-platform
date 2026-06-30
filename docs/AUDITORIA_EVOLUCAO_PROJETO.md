# Auditoria de Evolucao do Projeto LumiCity / FrotaTech Platform

Data: 2026-06-28

## Resumo executivo

O projeto evoluiu de um frontend gerado no Base44 para uma base tecnica com tres elementos importantes:

1. O frontend LumiCity roda localmente, builda e preserva a UX atual.
2. A camada de dados do frontend foi isolada por adapters/providers, permitindo alternar entre `base44`, `mock` e `http`.
3. A FrotaTech Platform Core nasceu dentro do repositorio com um backend FastAPI minimo, documentacao arquitetural, Docker Compose e endpoints foundation.

Apesar disso, o LumiCity ainda nao funciona como SaaS proprio completo. Ele ainda depende do Base44 para operacao real, autenticacao efetiva, dados persistidos, storage, IA e parte do bootstrap publico. O backend proprio ainda e uma fundacao tecnica, nao uma API funcional de negocio.

Diagnostico direto: a arquitetura de migracao esta bem encaminhada; a operacao real ainda nao comecou.

## Estado atual validado

### Frontend LumiCity

Ja temos:

- Projeto React/Vite rodando localmente.
- Build do frontend passando com `npm.cmd run build`.
- Dev server validado anteriormente em `http://127.0.0.1:5173`.
- Node recomendado documentado como Node 22 LTS.
- `.env.example` criado.
- `.nvmrc` criado.
- Campo `engines` criado em `package.json`.
- Vite ajustado para rodar localmente.
- UX preservada.
- Base44 nao removido.

Pendencias conhecidas:

- Typecheck ainda falha.
- Lint ainda possui imports nao usados herdados.
- `npm audit` ainda aponta vulnerabilidades.
- Sem `.env.local` real, recursos Base44 ficam limitados.
- O app ainda nao usa backend proprio para dados reais.

### Camada API do frontend

Ja temos:

- `src/lib/api/*` como camada publica para as telas.
- Adapters principais:
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
- Providers:
  - `src/lib/api/providers/base44`
  - `src/lib/api/providers/mock`
  - `src/lib/api/providers/http`
- `providerFactory.js` lendo `VITE_API_MODE`.
- Modos aceitos:
  - `base44`
  - `mock`
  - `http`
- Contratos HTTP placeholder preparados para futuro FastAPI.

Resultado pratico:

- As telas centrais deixaram de depender diretamente de imports Base44 e passaram a falar com `src/lib/api`.
- O Base44 ficou encapsulado principalmente em `providers/base44`.
- O modo `mock` permite demonstracao e desenvolvimento offline basico.
- O modo `http` ainda nao funciona de ponta a ponta porque o backend nao possui endpoints de negocio.

### FrotaTech Platform Core

Ja temos:

- Pasta `platform/`.
- Backend FastAPI minimo em `platform/backend`.
- Estrutura base:
  - `app/main.py`
  - `app/core`
  - `app/db`
  - `app/api`
  - `app/models`
  - `app/schemas`
  - `app/services`
  - `app/modules/lumicity`
- `requirements.txt`.
- `Dockerfile`.
- `docker-compose.yml` com:
  - backend
  - postgres
  - redis
- Documentacao:
  - `docs/FROTATECH_PLATFORM_CORE.md`
  - `docs/SPRINT_3_FROTATECH_FOUNDATION.md`

Endpoints atuais:

- `GET /`
- `GET /health`
- `GET /api/v1/health`
- `GET /api/v1/modules`
- `GET /docs`

Validacao informada pelo navegador:

- `/` respondeu com `service=frotatech-platform-core`.
- `/health` respondeu `status=ok`.
- `/api/v1/health` respondeu `status=ok`, `api=v1`.
- `/api/v1/modules` listou:
  - `lumicity`
  - `urbaneye`
  - `aquaflow`
- `/docs` abriu Swagger/OpenAPI 3.1.

Resultado pratico:

- A plataforma backend existe e sobe.
- Ainda nao existe API de negocio do LumiCity.
- Ainda nao existe conexao real com PostgreSQL/Redis em runtime de aplicacao.
- Ainda nao existe autenticacao JWT implementada.
- Ainda nao existe persistencia.

## Mapa do que ja foi entregue

| Area | Status | Observacao |
| --- | --- | --- |
| Frontend local | Entregue | React/Vite roda e builda |
| Documentacao inicial | Entregue | Auditorias e docs de sprint criadas |
| Isolamento Base44 no frontend | Parcialmente entregue | Camada `src/lib/api` e providers criados |
| Modo mock | Parcialmente entregue | Dados em memoria, suficiente para demo basica |
| Modo HTTP no frontend | Preparado | Contratos existem, backend ainda nao implementa |
| Backend FastAPI | Foundation entregue | Health, modules e Swagger funcionando |
| Docker Compose | Criado | Config valido, daemon Docker precisa estar ativo para executar |
| PostgreSQL/PostGIS | Planejado/criado no compose | Sem modelos, migrations ou conexao usada |
| Redis | Planejado/criado no compose | Sem uso real ainda |
| Auth proprio | Nao entregue | Ainda falta JWT, roles e sessoes |
| Multi-tenant | Nao entregue | Ainda falta modelagem e enforcement |
| Auditoria | Nao entregue | Apenas planejada |
| Storage proprio | Nao entregue | Ainda depende do provider/Base44 ou mock |
| IA propria | Nao entregue | Ainda depende de Base44 ou mock |
| Realtime proprio | Nao entregue | Ainda nao ha WebSocket/Redis funcional |
| Testes | Nao entregue | Ainda sem suite confiavel |

## O que falta para funcionar de fato

Para o LumiCity funcionar como SaaS proprio, nao basta o backend responder health check. Faltam as capacidades abaixo.

### 1. Autenticacao propria

Falta implementar:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- refresh token ou estrategia equivalente.
- hash de senha com `passlib`.
- emissao e validacao JWT com `python-jose`.
- roles minimas:
  - admin
  - gestor
  - operador
  - cidadao
- protecao real por rota.

Impacto:

- Sem isso, nao existe acesso seguro fora do Base44.

### 2. Banco de dados relacional

Falta implementar:

- Conexao SQLAlchemy.
- Configuracao `DATABASE_URL`.
- Alembic inicial.
- Modelos base:
  - tenants/empresas
  - users
  - roles
  - audit_logs
  - cidades
  - chamados/reports
  - materiais
  - movimentacoes de estoque
  - cidadaos
- Migrations versionadas.
- Seeds minimas para desenvolvimento.

Impacto:

- Sem banco, nao ha persistencia propria.

### 3. API de negocio do LumiCity

Falta implementar endpoints reais alinhados aos providers HTTP do frontend.

Minimo para primeira operacao:

- `GET /api/v1/reports`
- `POST /api/v1/reports`
- `GET /api/v1/reports/{id}`
- `PATCH /api/v1/reports/{id}`
- `DELETE /api/v1/reports/{id}`
- `POST /api/v1/reports/{id}/assign`
- `PATCH /api/v1/reports/{id}/status`
- `GET /api/v1/materials`
- `POST /api/v1/materials`
- `PATCH /api/v1/materials/{id}`
- `DELETE /api/v1/materials/{id}`
- `GET /api/v1/stock/movements`
- `POST /api/v1/stock/movements`
- `GET /api/v1/cities`
- `GET /api/v1/companies`
- `GET /api/v1/users`

Decisao posterior registrada em 2026-06-29:

- O padrao final adotado para o modulo LumiCity e `/api/v1/lumicity/*`.
- Os providers HTTP foram alinhados para caminhos como `/lumicity/reports`, `/lumicity/materials` e `/lumicity/stock/movements`.

### 4. Frontend conectado ao backend proprio

Falta implementar:

- `.env.local` com `VITE_API_MODE=http`.
- `VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1`.
- Ajustar providers HTTP ao contrato final.
- Validar login, dashboard, chamados, almoxarifado e relatorios usando a API propria.
- Remover dependencia runtime de Base44 em `AuthContext.jsx`.

Impacto:

- Hoje o backend existe, mas o LumiCity ainda nao consome dados dele.

### 5. Multi-tenancy e seguranca

Falta implementar:

- Tabela de tenants.
- Relacao usuario -> tenant.
- Escopo obrigatorio por tenant em queries.
- Middleware ou dependencia FastAPI para tenant atual.
- Garantia de que um tenant nao acessa dados de outro.
- Politica de roles por tenant.

Impacto:

- Sem multi-tenancy, nao ha SaaS profissional.

### 6. Auditoria

Falta implementar:

- `audit_logs`.
- Registro de:
  - login/logout
  - criacao de chamado
  - mudanca de status
  - atribuicao de operador
  - alteracao de material/estoque
  - alteracao de usuarios/permissoes
- Endpoint de consulta para admins.

Impacto:

- Sem auditoria, ha risco operacional e juridico em ambiente publico/municipal.

### 7. Storage proprio

Falta implementar:

- Provider S3/Supabase ou storage local temporario.
- Upload de imagens de chamados.
- URLs assinadas ou publicas controladas.
- Metadados de arquivos no banco.
- Limites e validacao de tipo/tamanho.

Impacto:

- Chamados com fotos ainda dependem do Base44 ou de mock.

### 8. IA desacoplada

Falta implementar:

- `POST /api/v1/ai/suggest-description`
- `POST /api/v1/ai/classify-priority`
- `POST /api/v1/ai/trend-report`
- `POST /api/v1/ai/chatbot`
- Gateway interno para OpenAI API.
- Controle de uso por tenant.
- Logs de prompt/resposta quando aplicavel.

Impacto:

- IA ainda nao e servico proprio da FrotaTech Platform.

### 9. Realtime

Falta implementar:

- WebSocket no FastAPI.
- Redis pub/sub ou streams.
- Canal para atualizacao de chamados.
- Substituicao de `subscribeReports`.

Impacto:

- Atualizacoes em tempo real ainda nao existem fora do Base44.

### 10. Testes e qualidade

Falta implementar:

- Testes unitarios backend.
- Testes de contrato dos endpoints.
- Testes dos providers HTTP/mock/base44.
- Smoke test frontend + backend.
- CI basico.
- Correcoes de typecheck/lint/audit.

Impacto:

- O projeto ainda nao tem rede de seguranca para crescer com estabilidade.

## Riscos atuais

### Risco alto: falsa sensacao de backend pronto

O backend responde health checks e Swagger, mas ainda nao possui negocio. Ele prova a fundacao, nao a operacao.

### Risco alto: dependencia Base44 ainda operacional

Mesmo com adapters, o Base44 ainda e o provider real. Sem migrar auth, dados, storage e IA, o lock-in continua.

### Risco alto: autenticacao

`AuthContext.jsx` ainda depende de utilitario do SDK Base44 para bootstrap publico. Isso precisa ser isolado antes do modo HTTP ser considerado serio.

### Risco medio: divergencia de rotas

Mitigado em 2026-06-29: o padrao `/api/v1/lumicity/*` foi adotado no Sprint 4. O risco restante e garantir que todos os endpoints futuros do modulo sigam esse mesmo prefixo.

### Risco medio: ambiente local

O backend rodou com venv temporario e runner Windows. Docker Compose existe, mas Docker Desktop nao estava ativo no ambiente testado.

### Risco medio: qualidade herdada

Lint, typecheck e audit ainda carregam pendencias. Elas nao impedem a fundacao, mas podem atrapalhar evolucao rapida.

## Pronto para que tipo de uso?

### Ja esta pronto para:

- Demonstrar o frontend LumiCity.
- Demonstrar a arquitetura de providers.
- Demonstrar o backend foundation e Swagger.
- Validar a direcao da FrotaTech Platform.
- Comecar implementacao real da API.

### Ainda nao esta pronto para:

- Operacao real com clientes.
- Cadastro e login proprio.
- Persistencia propria de chamados.
- Upload proprio de imagens.
- Uso multi-tenant.
- Auditoria operacional.
- IA propria.
- Realtime proprio.
- Remocao do Base44.

## Caminho recomendado para comecar a funcionar de fato

### Sprint 4 - Contrato e dominio LumiCity no backend

Objetivo:

- Fechar o padrao de rotas.
- Criar schemas Pydantic.
- Criar modelos SQLAlchemy iniciais.
- Criar Alembic.

Entregas:

- `Tenant`
- `User`
- `City`
- `Report`
- `Material`
- `StockMovement`
- migrations iniciais.
- seeds locais.

### Sprint 5 - Auth JWT e multi-tenancy

Objetivo:

- Implementar login proprio e protecao por tenant.

Entregas:

- `/api/v1/auth/login`
- `/api/v1/auth/me`
- JWT.
- password hashing.
- roles.
- dependencias FastAPI de usuario atual e tenant atual.

### Sprint 6 - Chamados LumiCity reais

Objetivo:

- Fazer a primeira tela central operar com backend proprio.

Entregas:

- CRUD de chamados.
- mudanca de status.
- atribuicao de operador.
- filtro por tenant/cidade.
- frontend em `VITE_API_MODE=http` para chamados.

### Sprint 7 - Materiais e estoque

Objetivo:

- Migrar almoxarifado para backend proprio.

Entregas:

- materiais.
- movimentacoes.
- validacoes de entrada/saida.
- relatorios basicos.

### Sprint 8 - Storage e anexos

Objetivo:

- Remover dependencia Base44 para imagens.

Entregas:

- upload.
- metadados.
- storage local/S3/Supabase.
- validacao de arquivo.

### Sprint 9 - Auditoria, IA e realtime

Objetivo:

- Completar capacidades de plataforma.

Entregas:

- audit logs.
- endpoints de IA.
- WebSocket/Redis para atualizacao de chamados.

## Definicao minima de "funcionando de fato"

O projeto pode ser considerado funcionando de fato como SaaS proprio quando:

- usuario consegue logar sem Base44;
- dados sao gravados no PostgreSQL;
- chamados podem ser criados, listados, atualizados e auditados;
- frontend usa `VITE_API_MODE=http` em pelo menos o fluxo principal;
- imagens nao dependem do Base44;
- tenant atual e aplicado em todas as queries;
- admin consegue gerenciar usuarios/roles basicos;
- build frontend passa;
- backend sobe via Docker Compose;
- existe seed local para demonstracao;
- existe uma suite minima de testes backend.

## Prioridade imediata

Prioridade 1:

- Manter o contrato `/api/v1/lumicity/*` em todos os endpoints futuros do modulo.
- Implementar banco, Alembic e modelos base.
- Implementar auth JWT.

Prioridade 2:

- Implementar chamados reais.
- Conectar `reportsApi` HTTP ao backend.
- Isolar `AuthContext.jsx` do Base44.

Prioridade 3:

- Materiais/estoque.
- Storage.
- Auditoria.
- IA.
- Realtime.

## Conclusao

O projeto saiu da fase de "aplicacao gerada dependente do Base44" e entrou na fase de "produto com arquitetura propria em construcao".

O que existe hoje e uma fundacao correta: frontend estabilizado, camada de providers e backend FastAPI inicial. O que ainda falta e a parte que transforma fundacao em produto: autenticacao, banco, modelos, endpoints de negocio, storage, auditoria, multi-tenancy e conexao real do frontend ao backend.

O proximo passo mais importante nao e criar mais telas. E fazer o primeiro fluxo completo funcionar sem Base44: login proprio + listagem/criacao de chamados persistidos em PostgreSQL.
