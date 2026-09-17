# Design

## Context

`nutri-front` é um repositório greenfield: não existe `package.json`, código ou configuração de build ainda. Este é o primeiro change de implementação do frontend, então ele também estabelece a base técnica do projeto (estrutura de pastas, client HTTP, roteamento) que capacidades futuras (`patient-management`, `diet-prescription`, `physical-assessment`) vão reutilizar — o mesmo papel que a change `add-nutritionist-auth` cumpriu em `nutri-back`.

O backend (`nutri-back`, capacidade `nutritionist-auth`) já está implementado e publicado (`API.md`): API REST stateless autenticada por JWT (`Authorization: Bearer <token>`), sem cookie de sessão, sem refresh token, com CORS já configurado no servidor para aceitar a origem do frontend via variável de ambiente (`ALLOWED_ORIGINS`). O frontend é consumido em uma origem separada da API. Ver proposal.md - Why para a motivação e `specs/nutritionist-auth/spec.md` para o contrato de comportamento observável.

As decisões de stack abaixo (framework, UI, dados/formulários, testes) foram confirmadas explicitamente com o usuário antes deste design, entre as alternativas apresentadas.

## Goals / Non-Goals

**Goals:**
- Definir a stack técnica inicial do projeto (framework, estilo, camada de dados/formulários, testes) e a estrutura de pastas que capacidades futuras vão seguir.
- Definir como o token JWT é armazenado, injetado em requisições e invalidado no cliente, incluindo o trade-off de segurança (XSS) entre as opções de armazenamento.
- Definir o mecanismo de roteamento protegido (guard) e como ele reage a uma sessão que expira em tempo de uso (401 em qualquer chamada autenticada).
- Definir como cada código de erro do formato `ApiError` do backend (`VALIDATION_ERROR`, `EMAIL_ALREADY_IN_USE`, `INVALID_CREDENTIALS`, `UNAUTHORIZED`, `GOOGLE_TOKEN_INVALID`) é mapeado para uma mensagem/tratamento de UI.
- Definir a integração com Google Identity Services no cliente (obtenção do `idToken`) e como ela se conecta ao endpoint `POST /api/auth/google`.
- Definir a estratégia de testes (unitário/componente + e2e) cobrindo os cenários do spec delta desta capacidade.

**Non-Goals:**
- Não definir o design visual/identidade de marca final — usa-se os componentes padrão do shadcn/ui, sem tema customizado nesta change.
- Não implementar recuperação de senha, verificação de e-mail, MFA ou refresh token — nenhum desses existe no backend nesta fase (ver `nutri-back` - Non-Goals).
- Não construir as telas de negócio completas (pacientes, dietas, avaliação física) — apenas uma tela mínima de perfil para validar o fluxo ponta a ponta.
- Não definir pipeline de CI/CD ou hospedagem de produção — fora do escopo desta change de frontend inicial.

## Decisions

### Stack: React + Vite + TypeScript
Escolhido em vez de Next.js ou Vue, confirmado com o usuário. Justificativa: o sistema é uma área autenticada (dashboard) consumindo uma API externa via HTTP, sem necessidade de SSR/SEO — um SPA client-side é suficiente e mais simples de operar do que um framework fullstack. Vite oferece build e dev server rápidos e configuração mínima para esse cenário. TypeScript é usado em todo o projeto para alinhar os tipos de request/response com os DTOs já documentados em `API.md`, reduzindo divergência entre frontend e o contrato do backend.

Alternativa considerada: Next.js (App Router) — rejeitado para esta fatia porque adicionaria complexidade de SSR/roteamento por arquivo sem benefício, já que não há requisito de SEO para uma área logada.

### UI/Estilo: Tailwind CSS + shadcn/ui
Escolhido em vez de Material UI ou CSS puro, confirmado com o usuário. shadcn/ui fornece componentes acessíveis (inputs, formulários, botões, toasts/alerts) copiados para o projeto (não uma dependência de runtime opaca), o que acelera a construção das telas de cadastro/login com validação inline e mensagens de erro, mantendo controle total sobre o código dos componentes. Tailwind cobre a estilização do restante da interface sem exigir uma convenção de CSS separada.

### Dados/HTTP/Formulários: TanStack Query + Axios + React Hook Form + Zod
Escolhido em vez de Redux Toolkit + Formik/Yup ou Context + fetch manual, confirmado com o usuário.
- **Axios** encapsula as chamadas HTTP com uma instância central configurada com a `baseURL` (`VITE_API_BASE_URL`) e dois interceptors: um de request, que injeta `Authorization: Bearer <token>` quando há sessão ativa; e um de response, que detecta HTTP 401 em qualquer chamada a endpoint protegido e dispara o encerramento de sessão (ver "Expiração de Sessão" abaixo), evitando repetir essa lógica em cada tela.
- **TanStack Query** gerencia os estados de requisição (carregando, sucesso, erro, cache) das chamadas de leitura (ex.: `GET /api/nutricionistas/me`) e das mutações (cadastro, login, login via Google, logout), evitando estado de loading/erro implementado manualmente em cada componente.
- **React Hook Form + Zod** cobrem os formulários de cadastro e login: os schemas Zod espelham exatamente as regras de validação do backend documentadas em `API.md` (nome ≤255 não vazio, e-mail válido, senha 8–72 com letra+número, empresa opcional ≤255 não vazia quando presente), dando feedback ao usuário antes de uma chamada de rede, sem duplicar a validação final (que permanece no backend).

Alternativa considerada: Context API + fetch nativo — rejeitada por exigir mais código manual para cache, retries e estados de loading/erro que o TanStack Query já resolve, sem ganho real de simplicidade para este projeto.

### Testes: Vitest + Testing Library + Playwright
Escolhido em vez de Jest + Cypress ou "somente unitário/componente", confirmado com o usuário. Vitest compartilha configuração com o Vite (mesmo bundler/transformer), reduzindo configuração duplicada; Testing Library cobre testes de componente (formulários de cadastro/login, mensagens de erro por cenário); Playwright cobre o fluxo e2e completo (cadastro → login → acesso a rota autenticada → logout, e login via Google mockado na camada de rede) contra um backend real ou mockado via interceptação de rede.

### Estrutura de pastas
```
src/
├── main.tsx                     (bootstrap: providers de QueryClient, Router)
├── App.tsx                      (definição de rotas)
├── lib/
│   ├── http.ts                  (instância Axios + interceptors)
│   └── env.ts                   (leitura tipada de VITE_API_BASE_URL, VITE_GOOGLE_CLIENT_ID)
├── features/
│   └── auth/
│       ├── api.ts                (funções de chamada: register, login, loginWithGoogle, logout, getMe)
│       ├── schemas.ts             (schemas Zod: registerSchema, loginSchema)
│       ├── types.ts                (tipos alinhados aos DTOs do backend)
│       ├── session.ts              (armazenamento/leitura do token, contexto/estado de sessão)
│       ├── useAuth.ts              (hook: sessão atual, login, logout, isAuthenticated)
│       ├── ProtectedRoute.tsx        (guard de rota autenticada)
│       ├── RedirectIfAuthenticated.tsx (guard inverso para telas de login/cadastro)
│       ├── RegisterPage.tsx
│       ├── LoginPage.tsx
│       ├── GoogleLoginButton.tsx
│       └── ProfilePage.tsx          (tela mínima pós-login)
└── components/ui/                (componentes shadcn/ui)
```
Capacidades futuras adicionam seus próprios diretórios em `features/<capacidade>/` seguindo o mesmo padrão.

### Armazenamento do token JWT: `localStorage` com hidratação na inicialização
Decisão: armazenar o token JWT em `localStorage` sob uma chave dedicada, lido na inicialização da aplicação para hidratar o estado de sessão antes de renderizar rotas protegidas.

Trade-off considerado (memória volátil vs. `localStorage`):
- **Manter o token só em memória** (variável de estado, perdido ao recarregar) elimina a superfície de um token roubável via XSS lendo `localStorage`, mas exigiria login a cada reload de página — inaceitável para a experiência esperada (ver spec - "Sessão mantida após recarregar a página") e, sem refresh token nesta fase (não-objetivo tanto aqui quanto no backend), não há mecanismo de restabelecer sessão silenciosamente após um reload.
- **`localStorage`** persiste entre reloads e abas, ao custo de ficar acessível a qualquer script executado no contexto da página (risco de XSS). Mitigação: o projeto não injeta HTML não sanitizado nem `dangerouslySetInnerHTML` a partir de dados de terceiros nesta capacidade; se uma capacidade futura precisar renderizar conteúdo não confiável, essa decisão de armazenamento deve ser revisitada (ex.: mover para um cookie `httpOnly` emitido pelo backend, o que exigiria mudança no contrato de API atual).
- Rejeitado usar cookie `httpOnly` nesta change porque o backend (`nutri-back`, já implementado) retorna o token no corpo da resposta JSON, não o define como cookie — mudar isso está fora do escopo deste frontend e exigiria uma mudança de contrato no backend.

### Tratamento de erro centralizado por código `ApiError.error`
O client HTTP (Axios) propaga o corpo `ApiError` da resposta de erro para quem chamou a função de API. Cada tela mapeia o campo `error` da resposta para uma mensagem de UI:
| Código `error` | Onde ocorre | Tratamento na UI |
|---|---|---|
| `VALIDATION_ERROR` | Cadastro (400) | Mensagem por campo, usando `details[].field`/`details[].message` quando presentes |
| `EMAIL_ALREADY_IN_USE` | Cadastro (409) | Mensagem genérica associada ao campo e-mail |
| `INVALID_CREDENTIALS` | Login tradicional (401) | Mensagem genérica única (não distingue e-mail inexistente, senha errada ou conta só-Google) |
| `GOOGLE_TOKEN_INVALID` | Login via Google (401) | Mensagem específica de falha ao entrar com Google, distinta da mensagem de credenciais inválidas |
| `UNAUTHORIZED` | Qualquer endpoint protegido (401) | Não exibido como mensagem de formulário; dispara o fluxo de expiração de sessão (ver abaixo) |
| Nenhum dos acima (erro de rede, HTTP 500, etc.) | Qualquer chamada | Mensagem genérica de falha ao processar a solicitação, sem expor detalhes técnicos |

### Expiração de sessão: interceptor de resposta único
Em vez de cada tela verificar 401 individualmente, o interceptor de resposta do Axios detecta HTTP 401 em qualquer chamada feita com o token injetado (endpoints protegidos) e centraliza a reação: limpa o token de `localStorage`, limpa o cache do TanStack Query relacionado à sessão, e redireciona para a tela de login. Isso evita tratamento duplicado ou inconsistente entre telas (ver spec - "Sessão expirada durante o uso") e garante que múltiplas chamadas simultâneas que recebem 401 não disparem múltiplos redirecionamentos conflitantes (o interceptor verifica se a sessão já foi limpa antes de agir novamente).

Distinção importante: 401 nas rotas **públicas** de autenticação (`/api/auth/login`, `/api/auth/google`) representa credenciais/token inválidos (tratado por cada formulário, ver tabela acima), não uma sessão expirada — o interceptor só aciona o fluxo de expiração de sessão para chamadas que foram feitas com um token de sessão ativo.

### Roteamento protegido: guard por componente de rota
Usa-se `react-router-dom` com dois wrappers de rota: `ProtectedRoute` (redireciona para `/login` quando não há sessão hidratada) envolvendo as rotas autenticadas, e `RedirectIfAuthenticated` (redireciona para a área autenticada) envolvendo as rotas de login/cadastro. Ambos leem o estado de sessão hidratado na inicialização (ver "Armazenamento do token" acima) antes de decidir o redirecionamento, evitando um "flash" da tela errada enquanto a hidratação inicial ainda não ocorreu.

### Integração com Google Identity Services
O botão "Entrar com Google" usa o SDK do Google Identity Services carregado no cliente (via biblioteca de integração para React, ex.: `@react-oauth/google`, configurada com `VITE_GOOGLE_CLIENT_ID`) para obter um `idToken` diretamente do Google, sem redirecionamento gerenciado pelo backend — o mesmo modelo assumido pelo design do backend ("o frontend já obtém o `id_token` diretamente do Google no cliente"). O `idToken` obtido é enviado a `POST /api/auth/google`; a resposta (`{ token, accountCreated }`) segue o mesmo fluxo de estabelecimento de sessão do login tradicional, e `accountCreated` é usado apenas para variar a mensagem de boas-vindas exibida (ver spec - "Entrar com Google cria conta automaticamente").

### Estratégia de testes
- **Unitário**: schemas Zod (cada regra de validação do cadastro/login) e funções puras de `session.ts` (leitura/escrita/limpeza do token).
- **Componente** (Testing Library + Vitest): `RegisterPage` e `LoginPage` cobrindo cada cenário de validação de cliente e cada mensagem de erro do servidor mockando as funções de `api.ts`; `GoogleLoginButton` mockando o SDK do Google para simular sucesso, cancelamento e falha; `ProtectedRoute`/`RedirectIfAuthenticated` cobrindo redirecionamento com e sem sessão.
- **E2E** (Playwright, contra a API real ou mockada por interceptação de rede): fluxo completo cadastro → confirmação → login → acesso à tela de perfil autenticada → logout → tentativa de voltar a rota protegida negada; login via Google mockado interceptando a chamada de rede a `POST /api/auth/google` (sem depender do SDK real do Google em CI).

## Risks / Trade-offs

- [Token em `localStorage` acessível via XSS] → Aceito nesta change dado que o backend retorna o token no corpo JSON (não como cookie `httpOnly`) e não há conteúdo não confiável renderizado nesta capacidade; revisitar se uma capacidade futura introduzir renderização de HTML de terceiros, ou migrar para cookie `httpOnly` exigiria mudança de contrato no backend.
- [Sem refresh token, uma sessão expirada em uso interrompe o fluxo do usuário exigindo novo login] → Espelha a mesma limitação aceita no backend (`nutri-back` - Non-Goals); mitigado apenas por um tempo de expiração configurado no servidor que equilibre segurança e frequência de re-login (fora do controle do frontend).
- [Dependência do SDK do Google Identity Services disponível no navegador do usuário] → Se o script do Google falhar ao carregar (bloqueador de conteúdo, rede), apenas a opção "Entrar com Google" fica indisponível; login tradicional por e-mail/senha continua funcionando normalmente, pois os dois mecanismos são independentes no frontend, espelhando a mesma independência já garantida no backend.
- [Componentes shadcn/ui são copiados para o repositório, não uma dependência versionada] → Aceito como trade-off da abordagem shadcn/ui (mais controle, menos atualização automática); atualizações de componente são manuais quando necessário.
- [Ausência de design visual/identidade de marca definitiva nesta change] → Sinalizado como não-objetivo explícito; uma mudança futura de UI/UX pode reestilizar as telas sem alterar o comportamento especificado aqui.
