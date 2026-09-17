import { expect, test } from '@playwright/test'
import { E2E_GOOGLE_ID_TOKEN, mockApiRoute, mockGoogleIdentityScript, NUTRITIONIST } from './support/mocks'

test('logging in with Google creates an account automatically (accountCreated: true)', async ({ page }) => {
  await mockGoogleIdentityScript(page)
  await mockApiRoute(page, '**/api/nutricionistas/me', { status: 200, body: NUTRITIONIST })

  let sentIdToken: string | undefined
  await page.route('**/api/auth/google', async (route) => {
    sentIdToken = (route.request().postDataJSON() as { idToken?: string }).idToken
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ token: 'e2e-jwt', accountCreated: true }),
    })
  })

  await page.goto('/login')
  await page.getByTestId('google-login-button').click()

  await expect(page).toHaveURL(/\/perfil$/)
  await expect(page.getByText(/Conta criada com sucesso/i)).toBeVisible()
  expect(sentIdToken).toBe(E2E_GOOGLE_ID_TOKEN)
})

test('logging in with Google links an existing account (accountCreated: false)', async ({ page }) => {
  await mockGoogleIdentityScript(page)
  await mockApiRoute(page, '**/api/nutricionistas/me', { status: 200, body: NUTRITIONIST })
  await mockApiRoute(page, '**/api/auth/google', {
    status: 200,
    body: { token: 'e2e-jwt', accountCreated: false },
  })

  await page.goto('/login')
  await page.getByTestId('google-login-button').click()

  await expect(page).toHaveURL(/\/perfil$/)
  await expect(page.getByRole('heading', { name: 'Meu perfil' })).toBeVisible()
  await expect(page.getByText(/Conta criada com sucesso/i)).toBeHidden()
})
