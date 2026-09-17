import { expect, test } from '@playwright/test'
import { mockApiRoute, mockGoogleIdentityScript } from './support/mocks'

test('registering with an email already in use shows the duplicate-email error', async ({ page }) => {
  await mockGoogleIdentityScript(page)
  await mockApiRoute(page, '**/api/nutricionistas', {
    status: 409,
    body: {
      status: 409,
      error: 'EMAIL_ALREADY_IN_USE',
      message: 'E-mail já cadastrado',
      timestamp: '2026-01-01T00:00:00Z',
    },
  })

  await page.goto('/cadastro')
  await page.getByLabel('Nome completo').fill('Ana Silva')
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel('Senha').fill('Senha123')
  await page.getByRole('button', { name: 'Criar conta' }).click()

  await expect(page.getByText('Este e-mail já está em uso. Tente entrar.')).toBeVisible()
  await expect(page).toHaveURL(/\/cadastro$/)
})

test('logging in with invalid credentials shows a single generic message', async ({ page }) => {
  await mockGoogleIdentityScript(page)
  await mockApiRoute(page, '**/api/auth/login', {
    status: 401,
    body: {
      status: 401,
      error: 'INVALID_CREDENTIALS',
      message: 'Credenciais inválidas',
      timestamp: '2026-01-01T00:00:00Z',
    },
  })

  await page.goto('/login')
  await page.getByLabel('E-mail').fill('ana@example.com')
  await page.getByLabel('Senha').fill('SenhaErrada1')
  await page.getByRole('button', { name: 'Entrar', exact: true }).click()

  await expect(page.getByText('E-mail ou senha incorretos.')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})
