# Proposal

## Why

`nutri-front` é um repositório greenfield (sem código, sem `package.json`) que vai consumir a API já implementada em `nutri-back` (capacidade `nutritionist-auth`, change `add-nutritionist-auth`). Sem uma interface de cadastro, login e sessão autenticada, nenhuma outra tela do sistema (pacientes, dietas, avaliação física) pode ser construída, pois todas dependem de um nutricionista autenticado. Esta change traduz a fatia de autenticação da especificação de sistema (`nutri-specs`, capacidade `nutritionist-auth`) e o contrato de API já publicado por `nutri-back` (`API.md`) em uma especificação de implementação de frontend concreta.

## What Changes

- Adiciona a base técnica do projeto frontend: React + Vite + TypeScript, Tailwind CSS + shadcn/ui, TanStack Query + Axios, React Hook Form + Zod, Vitest + Testing Library + Playwright (decisões detalhadas e justificadas em `design.md`).
- Adiciona a identidade visual e o design system inicial do produto: marca **Evolvitta** (nome, slogan "Acompanhe cada evolução." e símbolo), paleta de cores (Sálvia/Terracota/neutros quentes) e sistema tipográfico de duas trilhas (Manrope/Public Sans para o produto, Lora reservada para documentos entregues ao paciente), aplicados ao tema Tailwind/shadcn/ui e às telas de cadastro e login (decisões completas em `design.md`).
- Adiciona tela de cadastro de nutricionista (nome, e-mail, senha, empresa opcional), com validação de cliente espelhando as regras do backend e tratamento dos erros `VALIDATION_ERROR` (400, por campo) e `EMAIL_ALREADY_IN_USE` (409).
- Adiciona tela de login por e-mail/senha, com tratamento do erro genérico `INVALID_CREDENTIALS` (401) sem revelar se o e-mail existe ou se a conta é só-Google.
- Adiciona login/cadastro via conta Google (Google Identity Services no cliente) que obtém um `idToken` e o envia a `POST /api/auth/google`, tratando os dois resultados possíveis (`accountCreated: true|false`) e o erro `GOOGLE_TOKEN_INVALID` (401).
- Adiciona um client HTTP central (Axios) que injeta `Authorization: Bearer <token>` em toda requisição autenticada e trata `401` de forma global (limpa a sessão e redireciona ao login).
- Adiciona gerenciamento de sessão/autenticação no cliente (armazenamento do token, hidratação ao carregar a aplicação, logout) e roteamento protegido (rotas que exigem nutricionista autenticado redirecionam ao login quando não há sessão válida).
- Adiciona uma tela mínima pós-login que consome `GET /api/nutricionistas/me` e exibe nome, empresa e e-mail do nutricionista autenticado, apenas para validar o fluxo ponta a ponta (não é a tela de perfil definitiva do produto).
- Adiciona logout, que chama `POST /api/auth/logout`, limpa a sessão local e redireciona para a tela de login.
- **Fora de escopo nesta change**: recuperação de senha, verificação de e-mail, autenticação multifator (também fora de escopo em `nutri-specs`/`nutri-back`), telas de gestão de pacientes/dieta/avaliação física (capacidades futuras — devem reaproveitar a identidade visual definida aqui, não redefini-la), i18n/multi-idioma, refresh token (não existe no backend nesta fase).

## Capabilities

### New Capabilities
- `nutritionist-auth`: Cadastro de conta de nutricionista, login por e-mail/senha, login/cadastro via conta Google, logout, consulta do próprio perfil, gerenciamento de sessão (token) e roteamento protegido no frontend — espelhando, do lado do cliente, a capacidade de mesmo nome já implementada em `nutri-back`.

### Modified Capabilities
Nenhuma — este é o primeiro conjunto de specs de implementação deste frontend; não há capacidades existentes em `openspec/specs/`.

## Impact

- **Novo código**: projeto React/Vite/TypeScript inicial (estrutura de pastas, configuração de build, lint), client HTTP (Axios + interceptors), camada de dados (TanStack Query), formulários de cadastro/login (React Hook Form + Zod), integração com Google Identity Services, contexto/estado de sessão, roteamento protegido (React Router), telas de cadastro, login e perfil mínimo pós-login.
- **Dependências novas**: `react`, `react-dom`, `vite`, `typescript`, `tailwindcss`, componentes shadcn/ui, `@tanstack/react-query`, `axios`, `react-hook-form`, `@hookform/resolvers`, `zod`, `react-router-dom`, biblioteca de integração com Google Identity Services (ex.: `@react-oauth/google` ou script oficial do Google carregado diretamente), `vitest`, `@testing-library/react`, `@testing-library/user-event`, `playwright`/`@playwright/test`.
- **Configuração**: variável de ambiente para a URL base da API (`VITE_API_BASE_URL`) e para o Client ID do Google usado pelo Identity Services no cliente (`VITE_GOOGLE_CLIENT_ID`), sem valores hardcoded.
- **Integração externa**: consome os cinco endpoints já publicados por `nutri-back` (`POST /api/nutricionistas`, `GET /api/nutricionistas/me`, `POST /api/auth/login`, `POST /api/auth/google`, `POST /api/auth/logout`) e o script/SDK do Google Identity Services no navegador; nenhum backend é modificado por esta change.
- **Capacidades futuras**: estabelece o padrão de client HTTP autenticado, gerenciamento de sessão e roteamento protegido que as telas de `patient-management`, `diet-prescription` e `physical-assessment` (capacidades futuras do frontend) vão reutilizar.
