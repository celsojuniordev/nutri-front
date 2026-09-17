import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
    // A API é apontada para a própria origem do dev server: as chamadas viram
    // same-origin (`/api/...`) e são interceptadas por `page.route` nos testes,
    // sem depender de um backend rodando nem de configuração de CORS.
    env: {
      VITE_API_BASE_URL: 'http://localhost:5173',
      VITE_GOOGLE_CLIENT_ID: 'e2e-google-client-id',
    },
  },
})
