# Correcao de Login em Producao - Vercel

Data: 2026-07-01

## Diagnostico

O backend Render foi validado via Swagger com:

```http
POST https://api.frotatech.dev.br/api/v1/auth/login
```

Payload:

```json
{
  "email": "admin@frotatech.demo",
  "password": "admin123"
}
```

Resultado informado: HTTP 200 com JWT.

O problema restante estava no frontend publicado na Vercel. O bundle servido em producao ainda exibia o fluxo "Entrar como Cidadao" com CPF e data de nascimento e nao continha os sinais do fluxo HTTP atual:

- tela `PlatformLogin`;
- texto `Acesso FrotaTech Platform`;
- storage `frotatech_access_token`;
- fallback da API propria;
- chamada efetiva para `/api/v1/auth/login`.

## Correcao aplicada

Foi criada uma decisao centralizada de modo de API em:

```text
src/lib/api/apiMode.js
```

Comportamento:

- se `VITE_API_MODE` estiver definido como `base44`, `mock` ou `http`, ele continua mandando;
- se `VITE_API_MODE` estiver ausente em `lumicity.frotatech.dev.br`, `staging-lumicity.frotatech.dev.br` ou outro subdominio `*.frotatech.dev.br`, o frontend assume `http`;
- fora dos dominios de producao, o fallback continua `base44` para compatibilidade.

Tambem foi ajustado o link "Sou operador/admin -> Acessar Sistema" para abrir diretamente:

```text
/login?next=/dashboard
```

quando o modo ativo for `http`.

## Arquivos alterados

- `src/lib/api/apiMode.js`
- `src/App.jsx`
- `src/lib/AuthContext.jsx`
- `src/lib/api/providers/providerFactory.js`
- `src/components/home/HeroSection.jsx`
- `src/components/home/HomeHeader.jsx`
- `src/components/home/HomeFooter.jsx`
- `src/components/home/BeneficiosSection.jsx`
- `src/components/home/SistemaPreviewSection.jsx`
- `src/pages/CidadaoCadastro.jsx`
- `.env.example`

## Validacao local

Com `.env.local`:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
```

Executado:

```powershell
npm.cmd run build
```

Resultado: OK.

O bundle gerado contem:

- `Acesso FrotaTech Platform`;
- `frotatech_access_token`;
- `/auth/login`;
- `/login?next=/dashboard`;
- dominios `frotatech.dev.br` para fallback de modo HTTP.

## Deploy necessario

Para que a correcao chegue ao site publico, e necessario novo deploy da Vercel a partir deste codigo.

Variaveis recomendadas na Vercel:

```env
VITE_API_MODE=http
VITE_API_BASE_URL=https://api.frotatech.dev.br/api/v1
```

Mesmo se `VITE_API_MODE` faltar, o novo bundle assume `http` no dominio de producao. Mesmo se `VITE_API_BASE_URL` faltar, o `httpClient` usa fallback para:

```text
https://api.frotatech.dev.br/api/v1
```

## Teste pos-deploy

Abrir:

```text
https://lumicity.frotatech.dev.br/login
```

Entrar com:

```text
admin@frotatech.demo
admin123
```

Resultado esperado:

- token JWT salvo no frontend;
- `GET /api/v1/auth/me` executado com Bearer Token;
- redirecionamento para `/admin-dashboard`.
