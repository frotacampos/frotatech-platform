# Publicacao no GitHub - FrotaTech Platform

Repositorio alvo:

```text
frotatech-platform
```

Diretorio local do projeto:

```powershell
cd C:\Users\mmsbc\Documents\Codex\2026-06-26\voc-est-assumindo-o-projeto-lumicity\work\lumicity-unzip\lumicity-main
```

## Arquivos protegidos pelo .gitignore

Nao enviar:

- `.env`
- `.env.local`
- `.env.development`
- `.env.production`
- `.env.test`
- `.env.*.local`
- `.venv/`
- `venv/`
- `node_modules/`
- `dist/`
- `__pycache__/`
- `*.db`
- `*.sqlite`
- `*.sqlite3`
- `platform/backend/uploads/`
- `*.log`
- arquivos temporarios

Enviar:

- `.env.example`
- `platform/backend/.env.production.example`

## Validacoes realizadas

```powershell
npm.cmd run build
```

```powershell
python -m compileall platform/backend/app platform/backend/alembic
```

## Comandos para publicar

Crie antes um repositorio vazio no GitHub chamado `frotatech-platform`.

Depois execute:

```powershell
git init
git add .
git commit -m "Initial commit - FrotaTech Platform"
git branch -M main
git remote add origin <URL_DO_REPOSITORIO>
git push -u origin main
```

Exemplo de URL HTTPS, ajuste para o usuario/organizacao correta:

```powershell
git remote add origin https://github.com/frotacampos/frotatech-platform.git
```

## Conferencia antes do push

Antes de executar `git push`, confira:

```powershell
git status --short
git status --ignored --short
```

Confirme que estes arquivos nao aparecem em `git status --short`:

- `.env.local`
- `platform/backend/frotatech_local.db`
- `node_modules/`
- `dist/`
- `platform/backend/uploads/`

Se algum arquivo sensivel aparecer como staged, remova do indice antes do commit:

```powershell
git rm --cached .env.local
git rm --cached platform/backend/frotatech_local.db
```
