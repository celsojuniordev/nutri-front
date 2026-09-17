import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

function unauthorizedAdapter(config: InternalAxiosRequestConfig): Promise<never> {
  return Promise.reject({
    isAxiosError: true,
    config,
    toJSON: () => ({}),
    name: 'AxiosError',
    message: 'Request failed with status code 401',
    response: {
      status: 401,
      statusText: 'Unauthorized',
      data: { status: 401, error: 'UNAUTHORIZED', message: 'Unauthorized' },
      headers: {},
      config,
    },
  } as AxiosError)
}

describe('http response interceptor — session expiration', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
  })

  it('clears the session and notifies exactly once for a single 401 on an authenticated call', async () => {
    const { getToken, onSessionExpired, setToken } = await import('@/features/auth/session')
    setToken('jwt-123')
    const { http } = await import('./http')
    http.defaults.adapter = unauthorizedAdapter

    let notifications = 0
    onSessionExpired(() => {
      notifications += 1
    })

    await expect(http.get('/api/nutricionistas/me')).rejects.toBeTruthy()

    expect(getToken()).toBeNull()
    expect(notifications).toBe(1)
  })

  it('clears the session and notifies exactly once even with concurrent 401 responses', async () => {
    const { getToken, onSessionExpired, setToken } = await import('@/features/auth/session')
    setToken('jwt-123')
    const { http } = await import('./http')
    http.defaults.adapter = unauthorizedAdapter

    let notifications = 0
    onSessionExpired(() => {
      notifications += 1
    })

    const results = await Promise.allSettled([
      http.get('/api/nutricionistas/me'),
      http.get('/api/nutricionistas/me'),
    ])

    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    expect(getToken()).toBeNull()
    expect(notifications).toBe(1)
  })

  it('does not trigger the session-expiration flow for a 401 on a call made without an active session (e.g. login/google)', async () => {
    const { getToken, onSessionExpired } = await import('@/features/auth/session')
    // Sem `setToken`: nenhuma sessão ativa, como em POST /api/auth/login ou
    // POST /api/auth/google, que nunca enviam o cabeçalho Authorization.
    const { http } = await import('./http')
    http.defaults.adapter = unauthorizedAdapter

    let notifications = 0
    onSessionExpired(() => {
      notifications += 1
    })

    await expect(http.post('/api/auth/login', { email: 'a@a.com', password: 'wrong' })).rejects.toBeTruthy()

    expect(getToken()).toBeNull()
    expect(notifications).toBe(0)
  })
})
