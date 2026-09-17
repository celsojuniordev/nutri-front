import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('env', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('exposes the configured variables when both are present', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')

    const { env } = await import('./env')

    expect(env.apiBaseUrl).toBe('http://localhost:8080')
    expect(env.googleClientId).toBe('test-client-id')
  })

  it('throws a clear error when VITE_API_BASE_URL is missing', async () => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')

    await expect(import('./env')).rejects.toThrow(/VITE_API_BASE_URL/)
  })

  it('throws a clear error when VITE_GOOGLE_CLIENT_ID is missing', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', '')

    await expect(import('./env')).rejects.toThrow(/VITE_GOOGLE_CLIENT_ID/)
  })
})
