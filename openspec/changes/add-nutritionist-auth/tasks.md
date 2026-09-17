# Tasks

## 1. Setup do Projeto

- [x] 1.1 Inicializar o projeto com Vite (template `react-ts`), criar `package.json`, e verificar que `npm install` e `npm run dev` sobem a aplicação padrão sem erro
- [x] 1.2 Adicionar e configurar Tailwind CSS (`tailwindcss`, `postcss`, `autoprefixer`), configurando no tema do Tailwind os tokens de cor da identidade visual Evolvitta (paleta Sálvia/Terracota/neutros/semânticas, ver design.md - Identidade Visual e Design System), e verificar que uma classe utilitária usando um token de cor customizado (ex.: `bg-primary-500`) aplicada em `App.tsx` reflete a cor de marca correta no navegador
- [x] 1.3 Inicializar shadcn/ui (`components.json`, diretório `src/components/ui/`), configurando as variáveis de tema (cores, radius) para usar os tokens da identidade visual Evolvitta em vez do tema padrão, e adicionar os componentes iniciais necessários (Button, Input, Label, Form, Card, Alert/Toast) e verificar que cada um renderiza com as cores da marca em um teste de smoke ou no `dev server`
- [x] 1.4 Adicionar `react-router-dom` e configurar as rotas iniciais (`/login`, `/cadastro`, `/perfil`) em `App.tsx`, cada uma renderizando um placeholder, e verificar navegação manual entre elas no navegador
- [x] 1.5 Adicionar `@tanstack/react-query`, configurar um `QueryClientProvider` em `main.tsx`, e verificar com um teste simples que um componente consegue usar `useQuery` sem erro de contexto
- [x] 1.6 Adicionar `axios`, `react-hook-form`, `@hookform/resolvers`, `zod` ao projeto e verificar que `npm run build` conclui sem erros de tipo
- [x] 1.7 Configurar Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`, `jsdom`) e verificar que um teste trivial de renderização de componente passa via `npm run test`
- [x] 1.8 Configurar Playwright (`@playwright/test`) com um teste trivial de carregamento da página inicial e verificar que `npx playwright test` executa e passa
- [x] 1.9 Configurar ESLint/Prettier (ou equivalente já usado no template Vite) e verificar que `npm run lint` não reporta erros no projeto inicial
- [x] 1.10 Configurar o carregamento das fontes Manrope, Public Sans e Lora (Google Fonts, ver design.md - Tipografia) e defini-las como fontes padrão do tema (Manrope para títulos/ações, Public Sans para corpo/UI, Lora reservada para o documento PDF), verificando visualmente que os pesos usados (Manrope 500/600/700/800, Public Sans 400/500/600/700, Lora 500/600 com itálico) carregam sem erro no navegador

## 2. Configuração de Ambiente e Client HTTP

- [x] 2.1 Criar `src/lib/env.ts` lendo `VITE_API_BASE_URL` e `VITE_GOOGLE_CLIENT_ID` de variáveis de ambiente Vite, com erro claro em tempo de build/execução se alguma estiver ausente, e adicionar `.env.example` documentando ambas; verificar que a aplicação falha de forma explícita (mensagem clara) ao rodar sem essas variáveis definidas
- [x] 2.2 Criar `src/lib/http.ts` com uma instância Axios usando `baseURL` de `env.ts`, e verificar com um teste unitário que uma chamada usa a URL base configurada
- [x] 2.3 Implementar o interceptor de request que injeta `Authorization: Bearer <token>` quando há sessão ativa (lendo de `session.ts`, ver seção 3) e verificar com um teste unitário que uma requisição feita com sessão ativa carrega o cabeçalho, e uma sem sessão não carrega
- [x] 2.4 Implementar o interceptor de response que detecta HTTP 401 em chamadas autenticadas, limpa a sessão local e aciona o redirecionamento para login (ver design.md - "Expiração de sessão"), e verificar com um teste unitário (mockando uma resposta 401) que a sessão é limpa e o redirecionamento é disparado exatamente uma vez mesmo com chamadas 401 concorrentes
- [x] 2.5 Verificar com um teste unitário que uma resposta 401 em `POST /api/auth/login` ou `POST /api/auth/google` (rotas públicas) NÃO aciona o fluxo de expiração de sessão do interceptor, sendo tratada apenas como erro de credenciais/token pelo chamador (ver design.md - distinção entre 401 público e 401 de sessão expirada)

## 3. Camada de Sessão/Autenticação

- [x] 3.1 Implementar `src/features/auth/session.ts` com funções para ler, salvar e limpar o token em `localStorage` sob uma chave dedicada, e verificar com testes unitários que salvar/ler/limpar funcionam de forma consistente
- [x] 3.2 Implementar `src/features/auth/useAuth.ts` (hook de contexto de sessão: `isAuthenticated`, `login(token)`, `logout()`, hidratado a partir de `session.ts` na montagem da aplicação) e verificar com um teste de componente que o hook reflete corretamente o estado hidratado a partir de um token pré-existente em `localStorage`
- [x] 3.3 Implementar `src/features/auth/types.ts` com os tipos de request/response alinhados ao contrato documentado em `API.md` do backend (`RegisterRequest`, `NutritionistResponse`, `LoginRequest`, `LoginResponse`, `GoogleLoginRequest`, `GoogleLoginResponse`, `ApiError`)
- [x] 3.4 Implementar `src/features/auth/api.ts` com as funções `register`, `login`, `loginWithGoogle`, `logout`, `getMe`, cada uma usando o client HTTP de `lib/http.ts` e tipada com `types.ts`, e verificar com testes unitários (mockando o client HTTP) que cada função monta a requisição correta (método, path, body) e propaga o corpo `ApiError` em caso de falha

## 4. Schemas de Validação (Zod)

- [x] 4.1 Implementar `registerSchema` em `src/features/auth/schemas.ts` (nome obrigatório, não vazio/só espaços, ≤255; e-mail formato válido; senha 8–72 caracteres com letra e número; empresa opcional, não vazia/só espaços quando presente, ≤255) e verificar com testes unitários cada regra do spec `nutritionist-auth` - "Validação de Cliente no Cadastro" (senha fraca, e-mail inválido, nome/empresa só espaços, campos acima do tamanho máximo, empresa ausente aceita)
- [x] 4.2 Implementar `loginSchema` (e-mail e senha obrigatórios, não vazios) e verificar com um teste unitário que campos vazios são rejeitados pela validação de cliente

## 5. Tela de Cadastro de Nutricionista

- [x] 5.1 Implementar `RegisterPage` com formulário (React Hook Form + `registerSchema` via `@hookform/resolvers/zod`) para nome, e-mail, senha e empresa, desabilitando o envio enquanto os campos obrigatórios não estiverem preenchidos e válidos, e verificar com um teste de componente o cenário "Envio bloqueado com campos obrigatórios vazios" do spec `nutritionist-auth`
- [x] 5.2 Conectar o envio do formulário à mutação `register` (via TanStack Query `useMutation`) e, em caso de sucesso, exibir confirmação e navegar para a tela de login (o cadastro não recebe token de acesso, logo não há autenticação automática); verificar com testes de componente os cenários "Cadastro bem-sucedido sem empresa" e "Cadastro bem-sucedido com empresa" (mockando a resposta de sucesso da API)
- [x] 5.3 Implementar o mapeamento de erro `EMAIL_ALREADY_IN_USE` (409) para uma mensagem associada ao campo e-mail, mantendo os demais campos preenchidos, e verificar com um teste de componente o cenário "E-mail duplicado rejeitado pelo servidor"
- [x] 5.4 Implementar o mapeamento de `VALIDATION_ERROR` (400) do servidor para mensagens por campo usando `details[].field`/`details[].message`, e verificar com um teste de componente o cenário "Erros de validação por campo retornados pelo servidor"
- [x] 5.5 Implementar o tratamento de erro genérico (falha de rede ou código não mapeado) preservando os dados já preenchidos no formulário, e verificar com um teste de componente o cenário "Falha de rede ou servidor indisponível no cadastro"

## 6. Tela de Login por E-mail/Senha

- [x] 6.1 Implementar `LoginPage` com formulário (React Hook Form + `loginSchema`) para e-mail e senha, desabilitando o envio com campos vazios, e verificar com um teste de componente o cenário "Envio bloqueado com campos vazios"
- [x] 6.2 Conectar o envio à mutação `login`, e em caso de sucesso chamar `useAuth().login(token)` e navegar para a área autenticada; verificar com um teste de componente o cenário "Login bem-sucedido" (mockando resposta de sucesso)
- [x] 6.3 Implementar o mapeamento de `INVALID_CREDENTIALS` (401) para uma mensagem genérica única, e verificar com um teste de componente o cenário "Credenciais inválidas rejeitadas", confirmando que a mensagem não varia por tipo de causa
- [x] 6.4 Implementar o tratamento de erro genérico (rede/servidor indisponível) sem estabelecer sessão, e verificar com um teste de componente o cenário "Falha de rede ou servidor indisponível no login"

## 7. Login e Cadastro via Conta Google

- [x] 7.1 Integrar a biblioteca de Google Identity Services (ex.: `@react-oauth/google`) configurada com `VITE_GOOGLE_CLIENT_ID`, implementar `GoogleLoginButton` nas telas de login e cadastro, e verificar com um teste de componente (mockando o provedor do SDK) que o botão aciona o fluxo de obtenção de `idToken`
- [x] 7.2 Conectar o `idToken` obtido à mutação `loginWithGoogle` (`POST /api/auth/google`) e, em caso de sucesso, estabelecer sessão e navegar para a área autenticada, variando a mensagem exibida conforme `accountCreated`; verificar com testes de componente os cenários "Entrar com Google cria conta automaticamente" e "Entrar com Google autentica conta existente" (mockando as duas respostas possíveis)
- [x] 7.3 Implementar o tratamento do cancelamento/fechamento da janela de seleção de conta Google sem exibir erro, e verificar com um teste de componente o cenário "Usuário cancela a seleção de conta Google"
- [x] 7.4 Implementar o mapeamento de `GOOGLE_TOKEN_INVALID` (401) para uma mensagem específica de falha ao entrar com Google, distinta da mensagem de credenciais inválidas do login tradicional, e verificar com um teste de componente o cenário "Token do Google rejeitado pelo backend"
- [x] 7.5 Implementar o tratamento de erro genérico (falha de rede ou código não mapeado) no envio do token de identidade ao backend, sem estabelecer sessão, e verificar com um teste de componente o cenário "Falha de rede ou servidor indisponível no login via Google"

## 8. Sessão Persistente e Roteamento Protegido

- [x] 8.1 Implementar a hidratação da sessão na inicialização da aplicação (leitura do token de `localStorage` antes da primeira renderização de rotas) e verificar com um teste de componente o cenário "Sessão mantida após recarregar a página" (simulando um token pré-existente) e o cenário "Nenhuma sessão anterior" (sem token)
- [x] 8.2 Implementar `ProtectedRoute` envolvendo as rotas autenticadas (ex.: `/perfil`), redirecionando para `/login` quando não há sessão hidratada, e verificar com testes de componente os cenários "Acesso direto a rota protegida sem sessão" e "Acesso a rota protegida com sessão válida"
- [x] 8.3 Implementar `RedirectIfAuthenticated` envolvendo as rotas `/login` e `/cadastro`, redirecionando para a área autenticada quando já há sessão, e verificar com um teste de componente o cenário "Usuário autenticado tenta acessar a tela de login"
- [x] 8.4 Verificar, com um teste de componente que aciona o interceptor de resposta 401 (ver 2.4) a partir de uma chamada feita em uma rota protegida já renderizada, o cenário "Sessão expirada durante o uso" (sessão limpa e redirecionamento para login)

## 9. Tela de Perfil e Logout

- [x] 9.1 Implementar `ProfilePage` consumindo `getMe` (via TanStack Query `useQuery`) e exibindo nome, e-mail e empresa (quando presente) do nutricionista autenticado, e verificar com testes de componente os cenários "Perfil exibido com sucesso" e "Empresa não cadastrada" do spec `nutritionist-auth`
- [x] 9.1.1 Implementar o tratamento de erro genérico ao carregar `getMe` (falha de rede ou resposta do servidor diferente de 401, ex.: HTTP 500), exibindo uma mensagem de erro sem limpar a sessão nem redirecionar para login, e verificar com um teste de componente o cenário "Falha ao carregar o próprio perfil" (distinguindo-o do interceptor de 401 da tarefa 2.4, que não deve disparar aqui)
- [x] 9.2 Implementar a ação de logout (botão) que chama `logout` (`POST /api/auth/logout`), limpa a sessão local independentemente do resultado da chamada, e redireciona para `/login`, e verificar com um teste de componente o cenário "Logout bem-sucedido"
- [x] 9.3 Verificar com um teste de componente/roteamento que, após logout, uma tentativa de acessar novamente uma rota protegida (incluindo simulando navegação "voltar") é negada e redireciona para login, cobrindo o cenário "Acesso após logout"

## 10. Testes End-to-End (Playwright)

- [x] 10.1 Implementar o teste e2e do fluxo completo: cadastro com sucesso → redirecionamento/confirmação → login com as credenciais recém-criadas → acesso à tela de perfil autenticada exibindo os dados corretos → logout → tentativa de acessar a rota protegida novamente é negada, rodando contra a API real de desenvolvimento ou uma API mockada por interceptação de rede, e verificar que o teste passa via `npx playwright test`
- [x] 10.2 Implementar o teste e2e de cadastro com e-mail duplicado (mockando ou preparando previamente uma conta com o mesmo e-mail) verificando a mensagem de erro exibida, e o teste e2e de login com credenciais inválidas verificando a mensagem genérica exibida
- [x] 10.3 Implementar o teste e2e de login via Google mockando a resposta de rede de `POST /api/auth/google` (sem depender do SDK real do Google), cobrindo tanto criação automática de conta (`accountCreated: true`) quanto vinculação a conta existente (`accountCreated: false`)

## 11. Validação da Especificação e Revisão Final

- [x] 11.1 Executar `openspec validate add-nutritionist-auth --strict` e verificar que não reporta erros
- [x] 11.2 Executar a suíte completa de testes (`npm run test` e `npx playwright test`) e verificar que todos os testes unitários, de componente e e2e passam
- [x] 11.3 Revisar se cada cenário do spec delta `nutritionist-auth` tem pelo menos um teste automatizado correspondente (unitário, componente ou e2e), registrando e corrigindo qualquer lacuna encontrada

## 12. Documentação

- [x] 12.1 Criar/atualizar o `README.md` do projeto com instruções de setup (variáveis de ambiente `VITE_API_BASE_URL` e `VITE_GOOGLE_CLIENT_ID`, como obter um Client ID de teste no Google Cloud Console, comandos de dev/build/test), destacando explicitamente que `VITE_GOOGLE_CLIENT_ID` deve ser o mesmo Client ID configurado como `GOOGLE_CLIENT_ID` no backend (`nutri-back`) em cada ambiente — caso contrário todo login via Google falha com `GOOGLE_TOKEN_INVALID` — e verificar que um novo desenvolvedor consegue subir a aplicação localmente e autenticar via Google seguindo apenas essas instruções
