# Nutritionist Auth Specification

## Purpose

Fornecer, no frontend, as telas e o comportamento de cadastro, login (tradicional e via Google), sessão autenticada, logout e consulta do próprio perfil, para que um nutricionista consiga criar sua conta e acessar o restante do sistema com segurança.

## Requirements

### Requirement: Formulário de Cadastro de Nutricionista
O sistema DEVE exibir um formulário de cadastro com os campos nome completo, e-mail, senha e empresa (opcional), e DEVE enviar esses dados ao backend apenas quando todos os campos obrigatórios estiverem preenchidos e passarem na validação de cliente.

#### Scenario: Cadastro bem-sucedido sem empresa
- **WHEN** um visitante preenche nome, e-mail ainda não utilizado e senha válida, deixa empresa em branco, e envia o formulário
- **THEN** o sistema envia a requisição de cadastro sem o campo empresa, exibe uma confirmação de conta criada e encaminha o visitante para a tela de login (o cadastro não emite um token de acesso, então não há autenticação automática nesta etapa)

#### Scenario: Cadastro bem-sucedido com empresa
- **WHEN** um visitante preenche nome, e-mail ainda não utilizado, senha válida e o nome de uma empresa, e envia o formulário
- **THEN** o sistema envia a requisição de cadastro com o campo empresa preenchido e exibe a mesma confirmação de conta criada

#### Scenario: Envio bloqueado com campos obrigatórios vazios
- **WHEN** um visitante tenta enviar o formulário de cadastro sem preencher nome, e-mail ou senha
- **THEN** o sistema não envia a requisição ao backend e indica visualmente quais campos são obrigatórios

### Requirement: Validação de Cliente no Cadastro
O sistema DEVE validar, antes do envio, que nome não está vazio nem contém apenas espaços em branco e não excede 255 caracteres; que e-mail está em formato de e-mail válido; que senha tem entre 8 e 72 caracteres e combina ao menos uma letra e um número; e que empresa, quando informada, não está vazia nem contém apenas espaços em branco e não excede 255 caracteres. Essas regras espelham a política aplicada pelo backend.

#### Scenario: Senha abaixo da política mínima
- **WHEN** um visitante digita uma senha com menos de 8 caracteres, ou sem combinar letra e número, e tenta enviar o formulário
- **THEN** o sistema exibe uma mensagem indicando que a senha não atende à política mínima e não envia a requisição

#### Scenario: E-mail em formato inválido
- **WHEN** um visitante digita um valor de e-mail que não corresponde a um formato de e-mail válido e tenta enviar o formulário
- **THEN** o sistema exibe uma mensagem de formato de e-mail inválido e não envia a requisição

#### Scenario: Nome ou empresa apenas com espaços em branco
- **WHEN** um visitante preenche o campo nome, ou o campo empresa, apenas com espaços em branco e tenta enviar o formulário
- **THEN** o sistema trata o campo como inválido em ambos os casos — exibe a mensagem de campo obrigatório para nome, e uma mensagem de valor inválido para empresa (que não é o mesmo que deixar empresa em branco/não informada) — e não envia uma requisição com esse valor

#### Scenario: Campo acima do tamanho máximo permitido
- **WHEN** um visitante digita um nome ou empresa com mais de 255 caracteres, ou uma senha com mais de 72 caracteres
- **THEN** o sistema impede a digitação além do limite ou exibe uma mensagem de tamanho máximo excedido, e não envia a requisição enquanto o campo exceder o limite

### Requirement: Tratamento de Erros do Servidor no Cadastro
O sistema DEVE interpretar as respostas de erro do endpoint de cadastro e exibir uma mensagem apropriada ao usuário para cada código de erro retornado, sem expor detalhes técnicos da resposta.

#### Scenario: E-mail duplicado rejeitado pelo servidor
- **WHEN** o backend responde ao envio do formulário de cadastro com HTTP 409 e o código de erro `EMAIL_ALREADY_IN_USE`
- **THEN** o sistema exibe uma mensagem indicando que o e-mail já está em uso e mantém o usuário na tela de cadastro com os demais campos preenchidos

#### Scenario: Erros de validação por campo retornados pelo servidor
- **WHEN** o backend responde ao envio do formulário de cadastro com HTTP 400, o código de erro `VALIDATION_ERROR` e uma lista de campos inválidos
- **THEN** o sistema exibe a mensagem de erro correspondente próxima a cada campo indicado na resposta

#### Scenario: Falha de rede ou servidor indisponível no cadastro
- **WHEN** o envio do formulário de cadastro falha por erro de rede ou por uma resposta do servidor que não corresponde a nenhum código de erro tratado (ex.: HTTP 500)
- **THEN** o sistema exibe uma mensagem de erro genérica indicando falha ao processar o cadastro, sem perder os dados já preenchidos no formulário

### Requirement: Formulário de Login por E-mail/Senha
O sistema DEVE exibir um formulário de login com os campos e-mail e senha, enviá-los ao backend quando preenchidos, e conceder acesso à área autenticada quando o backend confirmar as credenciais.

#### Scenario: Login bem-sucedido
- **WHEN** um nutricionista cadastrado envia seu e-mail e senha corretos pelo formulário de login
- **THEN** o sistema estabelece uma sessão autenticada no cliente e encaminha o nutricionista para a área autenticada do sistema

#### Scenario: Envio bloqueado com campos vazios
- **WHEN** um usuário tenta enviar o formulário de login sem preencher e-mail ou senha
- **THEN** o sistema não envia a requisição ao backend e indica visualmente quais campos são obrigatórios

### Requirement: Tratamento de Erros do Servidor no Login
O sistema DEVE tratar qualquer resposta HTTP 401 do endpoint de login como credenciais inválidas, exibindo uma única mensagem genérica, sem diferenciar e-mail inexistente, senha incorreta ou conta criada exclusivamente via Google.

#### Scenario: Credenciais inválidas rejeitadas
- **WHEN** o backend responde ao envio do formulário de login com HTTP 401 e o código de erro `INVALID_CREDENTIALS`
- **THEN** o sistema exibe uma mensagem genérica de e-mail ou senha incorretos, sem indicar qual dos dois está errado nem se a conta existe apenas via Google, e não estabelece sessão

#### Scenario: Falha de rede ou servidor indisponível no login
- **WHEN** o envio do formulário de login falha por erro de rede ou por uma resposta do servidor que não corresponde a um código de erro tratado
- **THEN** o sistema exibe uma mensagem de erro genérica indicando falha ao tentar entrar, sem estabelecer sessão

### Requirement: Login e Cadastro via Conta Google
O sistema DEVE oferecer, nas telas de login e de cadastro, uma opção de entrar com uma conta Google. Ao ser acionada, o sistema DEVE obter um token de identidade da conta Google escolhida pelo usuário e enviá-lo ao backend, estabelecendo uma sessão autenticada em caso de sucesso, independentemente de o backend ter criado uma conta nova ou reaproveitado uma conta existente.

#### Scenario: Entrar com Google cria conta automaticamente
- **WHEN** um visitante aciona a opção de entrar com Google, seleciona uma conta Google cujo e-mail ainda não possui cadastro no sistema, e o backend responde com sucesso indicando que uma conta foi criada
- **THEN** o sistema estabelece uma sessão autenticada e encaminha o visitante para a área autenticada, podendo exibir uma mensagem de boas-vindas indicando que a conta foi criada

#### Scenario: Entrar com Google autentica conta existente
- **WHEN** um nutricionista aciona a opção de entrar com Google usando uma conta Google cujo e-mail já possui cadastro no sistema, e o backend responde com sucesso indicando que nenhuma conta nova foi criada
- **THEN** o sistema estabelece uma sessão autenticada para a conta existente e encaminha o nutricionista para a área autenticada, sem exibir uma mensagem de criação de conta

#### Scenario: Usuário cancela a seleção de conta Google
- **WHEN** um usuário aciona a opção de entrar com Google e fecha ou cancela a janela de seleção de conta antes de concluir
- **THEN** o sistema permanece na tela atual, sem estabelecer sessão e sem exibir uma mensagem de erro como se fosse uma falha do backend

### Requirement: Tratamento de Erros do Login via Google
O sistema DEVE tratar a rejeição do backend ao token de identidade do Google como uma falha específica do login via Google, distinta da falha de credenciais inválidas do login tradicional.

#### Scenario: Token do Google rejeitado pelo backend
- **WHEN** o backend responde à tentativa de login via Google com HTTP 401 e o código de erro `GOOGLE_TOKEN_INVALID`
- **THEN** o sistema exibe uma mensagem indicando falha ao entrar com Google e não estabelece sessão

#### Scenario: Falha de rede ou servidor indisponível no login via Google
- **WHEN** o envio do token de identidade ao backend falha por erro de rede ou por uma resposta do servidor que não corresponde a um código de erro tratado
- **THEN** o sistema exibe uma mensagem de erro genérica indicando falha ao entrar com Google, sem estabelecer sessão

### Requirement: Persistência de Sessão Autenticada
O sistema DEVE reter a sessão autenticada (o token de acesso emitido pelo backend) de forma que um nutricionista que recarregue a página, ou reabra a aplicação, continue autenticado sem precisar refazer login, enquanto o token não expirar nem for invalidado.

#### Scenario: Sessão mantida após recarregar a página
- **WHEN** um nutricionista autenticado recarrega a página da aplicação
- **THEN** o sistema reconhece a sessão existente sem exigir novo login e mantém o acesso às rotas autenticadas

#### Scenario: Nenhuma sessão anterior
- **WHEN** um visitante sem login anterior abre a aplicação
- **THEN** o sistema não concede acesso à área autenticada e direciona para a tela de login

### Requirement: Expiração ou Invalidação de Sessão
O sistema DEVE encerrar a sessão local e redirecionar para a tela de login sempre que qualquer requisição a um endpoint protegido for rejeitada pelo backend com HTTP 401.

#### Scenario: Sessão expirada durante o uso
- **WHEN** um nutricionista autenticado realiza uma ação que dispara uma requisição a um endpoint protegido e o backend responde com HTTP 401
- **THEN** o sistema limpa a sessão local e redireciona o nutricionista para a tela de login, sem exigir que outras chamadas simultâneas repitam esse mesmo tratamento de forma duplicada ou inconsistente

### Requirement: Proteção de Rotas Autenticadas
O sistema DEVE impedir o acesso a rotas que exponham dados vinculados a um nutricionista quando não houver sessão autenticada válida, redirecionando para a tela de login.

#### Scenario: Acesso direto a rota protegida sem sessão
- **WHEN** um usuário sem sessão autenticada tenta acessar diretamente (via URL) uma rota que exige autenticação
- **THEN** o sistema redireciona o usuário para a tela de login, sem exibir os dados da rota protegida

#### Scenario: Acesso a rota protegida com sessão válida
- **WHEN** um nutricionista com sessão autenticada válida acessa uma rota protegida
- **THEN** o sistema exibe o conteúdo da rota normalmente

### Requirement: Redirecionamento do Usuário Já Autenticado
O sistema DEVE redirecionar um nutricionista que já possui sessão autenticada para a área autenticada ao tentar acessar as telas de login ou cadastro, em vez de exibir esses formulários novamente.

#### Scenario: Usuário autenticado tenta acessar a tela de login
- **WHEN** um nutricionista com sessão autenticada válida acessa a URL da tela de login ou de cadastro
- **THEN** o sistema o redireciona para a área autenticada sem exibir o formulário

### Requirement: Consulta e Exibição do Próprio Perfil
O sistema DEVE, para um nutricionista autenticado, consultar e exibir seus próprios dados de perfil (nome, empresa quando cadastrada, e e-mail).

#### Scenario: Perfil exibido com sucesso
- **WHEN** um nutricionista autenticado acessa a tela que exibe seu próprio perfil
- **THEN** o sistema exibe nome, e-mail e empresa (quando cadastrada) desse nutricionista, obtidos do backend

#### Scenario: Empresa não cadastrada
- **WHEN** um nutricionista autenticado sem empresa cadastrada acessa a tela de perfil
- **THEN** o sistema exibe nome e e-mail e não exibe um valor de empresa (campo omitido ou indicado como não informado)

#### Scenario: Falha ao carregar o próprio perfil
- **WHEN** a consulta aos próprios dados de perfil falha por erro de rede ou por uma resposta do servidor que não é HTTP 401 (ex.: HTTP 500)
- **THEN** o sistema exibe uma mensagem de erro genérica indicando falha ao carregar o perfil, sem encerrar a sessão nem redirecionar para o login (esse tratamento é exclusivo de uma resposta HTTP 401, ver "Expiração ou Invalidação de Sessão")

### Requirement: Logout do Nutricionista
O sistema DEVE permitir que um nutricionista autenticado encerre sua sessão a partir de uma ação explícita na interface, invalidando a sessão tanto no backend quanto no cliente.

#### Scenario: Logout bem-sucedido
- **WHEN** um nutricionista autenticado aciona a opção de logout
- **THEN** o sistema solicita a invalidação do token ao backend, remove a sessão armazenada no cliente e redireciona para a tela de login

#### Scenario: Acesso após logout
- **WHEN** um nutricionista tenta acessar uma rota protegida depois de ter feito logout, incluindo pelo botão "voltar" do navegador
- **THEN** o sistema nega o acesso e redireciona para a tela de login, sem exibir dados de antes do logout
