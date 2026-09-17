import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('http', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
  })

  it('uses the configured API base URL', async () => {
    const { http } = await import('./http')

    expect(http.defaults.baseURL).toBe('http://localhost:8080')
  })
})
