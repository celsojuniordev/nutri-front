import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setToken } from '@/features/auth/session'

function fakeAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  return Promise.resolve({
    data: null,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  })
}

describe('http request interceptor', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080')
    vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id')
  })

  it('injects Authorization: Bearer <token> when a session is active', async () => {
    setToken('jwt-123')
    const { http } = await import('./http')
    http.defaults.adapter = fakeAdapter

    const response = await http.get('/probe')

    expect(response.config.headers.get('Authorization')).toBe('Bearer jwt-123')
  })

  it('does not inject an Authorization header without a session', async () => {
    const { http } = await import('./http')
    http.defaults.adapter = fakeAdapter

    const response = await http.get('/probe')

    expect(response.config.headers.get('Authorization')).toBeUndefined()
  })
})
