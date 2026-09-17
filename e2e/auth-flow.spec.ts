import { expect, test } from '@playwright/test'
import { mockApiRoute, mockGoogleIdentityScript, NUTRITIONIST } from './support/mocks'

test('full flow: register, log in, see the profile, log out and lose access to the protected route', async ({
  page,
}) => {
  await mockGoogleIdentityScript(page)
  await mockApiRoute(page, '**/api/nutricionistas', { status: 201, body: NUTRITIONIST })
  await mockApiRoute(page, '**/api/auth/login', { status: 200, body: { token: 'e2e-jwt' } })
  await mockApiRoute(page, '**/api/nutricionistas/me', { status: 200, body: NUTRITIONIST })
  await mockApiRoute(page, '**/api/auth/logout', { status: 200, body: {} })

  // Cadastro
  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill('Ana Silva')
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel('Senha').fill('Senha123')
  await page.getByLabel(/Empresa/).fill('Clínica Vida')
  await page.getByRole('button', { name: 'Criar conta' }).click()

  // Redirecionamento para o login
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()

  // Login com as credenciais recém-criadas
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel('Senha').fill('Senha123')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  // Área autenticada com os dados do perfil
  await expect(page).toHaveURL(/\/perfil$/)
  await expect(page.getByText('Ana Silva')).toBeVisible()
  await expect(page.getByText('ana@example.com')).toBeVisible()
  await expect(page.getByText('Clínica Vida')).toBeVisible()

  // Logout
  await page.getByRole('button', { name: 'Sair' }).click()
  await expect(page).toHaveURL(/\/login$/)

  // Acesso à rota protegida é negado após o logout
  await page.goto('/perfil')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})
