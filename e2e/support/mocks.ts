import type { Page } from '@playwright/test'

export const E2E_GOOGLE_ID_TOKEN = 'e2e-google-id-token'

/**
 * Substitui o script do Google Identity Services por um stub que renderiza um
 * botão real e dispara o callback com um idToken fixo. Assim o fluxo de login
 * via Google é exercitado de ponta a ponta sem depender do SDK real do Google.
 */
export async function mockGoogleIdentityScript(page: Page) {
  await page.route('https://accounts.google.com/gsi/client*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.google = {
          accounts: {
            id: {
              initialize: function (config) { window.__gsiCallback = config.callback },
              renderButton: function (parent) {
                var button = document.createElement('button')
                button.type = 'button'
                button.textContent = 'Continuar com Google'
                button.setAttribute('data-testid', 'google-login-button')
                button.addEventListener('click', function () {
                  if (window.__gsiCallback) {
                    window.__gsiCallback({ credential: '${E2E_GOOGLE_ID_TOKEN}' })
                  }
                })
                parent.appendChild(button)
              },
              prompt: function () {},
              disableAutoSelect: function () {},
            },
          },
        }
      `,
    })
  })
}

interface JsonRouteOptions {
  status: number
  body: unknown
}

export async function mockApiRoute(page: Page, urlPattern: string, options: JsonRouteOptions) {
  await page.route(urlPattern, async (route) => {
    await route.fulfill({
      status: options.status,
      contentType: 'application/json',
      body: JSON.stringify(options.body),
    })
  })
}

export const NUTRITIONIST = {
  id: 1,
  name: 'Ana Silva',
  email: 'ana@example.com',
  company: 'Clínica Vida',
}
