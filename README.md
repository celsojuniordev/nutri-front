# Evolvitta — Frontend

Interface web do Evolvitta ("Acompanhe cada evolução."), o sistema de gestão para
nutricionistas. Este repositório consome a API REST do backend
[`nutri-back`](https://github.com/celsojuniordev/nutri-back).

Esta primeira entrega cobre a capacidade `nutritionist-auth`: cadastro de conta,
login por e-mail/senha, login/cadastro via conta Google, sessão autenticada,
rota protegida com o perfil do nutricionista e logout.

## Stack

- **React + Vite + TypeScript** (SPA)
- **Tailwind CSS + shadcn/ui** com os tokens da identidade visual Evolvitta
- **TanStack Query + Axios** para chamadas HTTP e estados de requisição
- **React Hook Form + Zod** para formulários e validação de cliente
- **Vitest + Testing Library** (unitário/componente) e **Playwright** (e2e)

## Pré-requisitos

- Node.js 20+ (desenvolvido com Node 24)
- Backend `nutri-back` rodando localmente, se quiser exercitar a API real

## Configuração

Copie o arquivo de exemplo e preencha as variáveis:

```bash
cp .env.example .env
```

| Variável | Descrição |
|---|---|
| `VITE_API_BASE_URL` | URL base da API do `nutri-back` (ex.: `http://localhost:8080`) |
| `VITE_GOOGLE_CLIENT_ID` | Client ID OAuth 2.0 do Google Cloud Console |

> **Importante — o mesmo Client ID nos dois lados.** O backend valida a audiência
> (`aud`) do token de identidade do Google contra o seu `GOOGLE_CLIENT_ID`. O
> valor de `VITE_GOOGLE_CLIENT_ID` **precisa ser exatamente o mesmo Client ID**
> configurado como `GOOGLE_CLIENT_ID` no `nutri-back` naquele ambiente. Se os
> dois divergirem, todo login via Google falha com `GOOGLE_TOKEN_INVALID`, mesmo
> com a implementação correta nos dois lados.

A aplicação falha na inicialização, com mensagem explícita, se alguma das duas
variáveis estiver ausente.

### Como obter um Client ID de teste no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie (ou
   selecione) um projeto.
2. Em **APIs e serviços → Tela de permissão OAuth**, configure a tela de consentimento
   (tipo "Externo" já basta para testes) e adicione seu e-mail como usuário de teste.
3. Em **APIs e serviços → Credenciais**, clique em **Criar credenciais → ID do cliente OAuth**
   e escolha o tipo **Aplicativo da Web**.
4. Em **Origens JavaScript autorizadas**, adicione `http://localhost:5173`.
5. Copie o **Client ID** gerado para `VITE_GOOGLE_CLIENT_ID` neste projeto e para
   `GOOGLE_CLIENT_ID` no `nutri-back`.

## Comandos

```bash
npm install          # instala as dependências
npm run dev          # sobe o dev server em http://localhost:5173
npm run build        # type-check + build de produção
npm run preview      # serve o build de produção localmente
npm run lint         # ESLint
npm run test         # testes unitários e de componente (Vitest)
npm run test:e2e     # testes end-to-end (Playwright)
```

Na primeira execução dos testes e2e, instale o navegador usado pelo Playwright:

```bash
npx playwright install chromium
```

Os testes e2e sobem o dev server automaticamente e interceptam as chamadas de
API na camada de rede — não é necessário ter o backend rodando para executá-los.

## Estrutura

```
src/
├── main.tsx                  # bootstrap: Google OAuth, React Query, Auth, Router
├── App.tsx                   # rotas (/login, /cadastro, /perfil) e guards
├── lib/
│   ├── env.ts                # leitura tipada das variáveis de ambiente
│   ├── http.ts               # instância Axios + interceptors (token e 401)
│   └── apiError.ts           # extração do corpo de erro padronizado da API
├── features/auth/            # capacidade nutritionist-auth
└── components/ui/            # componentes shadcn/ui
```

## Especificação

O planejamento e as decisões técnicas desta entrega estão em
`openspec/changes/add-nutritionist-auth/` (proposta, design, spec de
comportamento e lista de tarefas).
