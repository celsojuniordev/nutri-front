import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http } from '@/lib/http'
import { getMe, login, loginWithGoogle, logout, register } from '@/features/auth/api'
import type { ApiError } from '@/features/auth/types'

vi.mock('@/lib/http', () => ({
  http: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const mockedHttp = vi.mocked(http, true)

describe('auth api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('register() posts to /api/nutricionistas with the given body', async () => {
    const body = { name: 'Ana', email: 'ana@example.com', password: 'Senha123' }
    mockedHttp.post.mockResolvedValueOnce({ data: { id: 1, name: 'Ana', email: 'ana@example.com' } })

    const result = await register(body)

    expect(mockedHttp.post).toHaveBeenCalledWith('/api/nutricionistas', body)
    expect(result).toEqual({ id: 1, name: 'Ana', email: 'ana@example.com' })
  })

  it('register() propagates the ApiError body on failure', async () => {
    const apiError: ApiError = {
      status: 409,
      error: 'EMAIL_ALREADY_IN_USE',
      message: 'E-mail já cadastrado',
      timestamp: '2026-01-01T00:00:00Z',
    }
    mockedHttp.post.mockRejectedValueOnce({ response: { data: apiError } })

    await expect(
      register({ name: 'Ana', email: 'ana@example.com', password: 'Senha123' }),
    ).rejects.toMatchObject({ response: { data: apiError } })
  })

  it('login() posts to /api/auth/login with the given credentials', async () => {
    const body = { email: 'ana@example.com', password: 'Senha123' }
    mockedHttp.post.mockResolvedValueOnce({ data: { token: 'jwt-123' } })

    const result = await login(body)

    expect(mockedHttp.post).toHaveBeenCalledWith('/api/auth/login', body)
    expect(result).toEqual({ token: 'jwt-123' })
  })

  it('loginWithGoogle() posts to /api/auth/google with the idToken', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: { token: 'jwt-123', accountCreated: true } })

    const result = await loginWithGoogle({ idToken: 'google-id-token' })

    expect(mockedHttp.post).toHaveBeenCalledWith('/api/auth/google', { idToken: 'google-id-token' })
    expect(result).toEqual({ token: 'jwt-123', accountCreated: true })
  })

  it('logout() posts to /api/auth/logout', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: undefined })

    await logout()

    expect(mockedHttp.post).toHaveBeenCalledWith('/api/auth/logout')
  })

  it('getMe() gets /api/nutricionistas/me', async () => {
    mockedHttp.get.mockResolvedValueOnce({
      data: { id: 1, name: 'Ana', company: 'Clínica Vida', email: 'ana@example.com' },
    })

    const result = await getMe()

    expect(mockedHttp.get).toHaveBeenCalledWith('/api/nutricionistas/me')
    expect(result).toEqual({ id: 1, name: 'Ana', company: 'Clínica Vida', email: 'ana@example.com' })
  })
})
