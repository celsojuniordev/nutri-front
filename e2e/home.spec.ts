import { expect, test } from '@playwright/test'

test('the home page loads and redirects to the login route', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/login$/)
  await expect(page.getByRole('heading', { name: 'Entrar' })).toBeVisible()
})
