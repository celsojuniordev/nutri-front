import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '@/App'
import { setToken } from '@/features/auth/session'
import { AuthProvider } from '@/features/auth/useAuth'
import { http } from '@/lib/http'

vi.mock('@react-oauth/google', async () => await import('@/test/googleOAuthMock'))

vi.mock('@/features/auth/api', () => ({
  getMe: vi.fn().mockResolvedValue({ id: 1, name: 'Ana Silva', email: 'ana@example.com' }),
  logout: vi.fn().mockResolvedValue(undefined),
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  register: vi.fn(),
}))

function unauthorizedAdapter(config: InternalAxiosRequestConfig): Promise<never> {
  return Promise.reject({
    isAxiosError: true,
    config,
    name: 'AxiosError',
    message: 'Request failed with status code 401',
    toJSON: () => ({}),
    response: {
      status: 401,
      statusText: 'Unauthorized',
      data: { status: 401, error: 'UNAUTHORIZED', message: 'Unauthorized' },
      headers: {},
      config,
    },
  } as AxiosError)
}

function renderApp(initialPath: string) {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <App />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('session hydration and protected routing', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps the session after a reload, granting access to protected routes (hydrated token)', () => {
    setToken('jwt-123')

    renderApp('/perfil')

    expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument()
  })

  it('sends a visitor with no previous session to the login screen', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('redirects to login when a protected route is accessed directly without a session', () => {
    renderApp('/perfil')

    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Meu perfil' })).not.toBeInTheDocument()
  })

  it('renders the protected route normally with a valid session', () => {
    setToken('jwt-123')

    renderApp('/perfil')

    expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument()
  })

  it('redirects an already authenticated user away from login and register screens', () => {
    setToken('jwt-123')

    const { unmount } = renderApp('/login')
    expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument()
    unmount()

    renderApp('/cadastro')
    expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument()
  })

  it('clears the session and redirects to login when a request on a protected route returns 401', async () => {
    setToken('jwt-123')
    renderApp('/perfil')
    expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument()

    const previousAdapter = http.defaults.adapter
    http.defaults.adapter = unauthorizedAdapter
    await act(async () => {
      await http.get('/api/nutricionistas/me').catch(() => undefined)
    })
    http.defaults.adapter = previousAdapter

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument())
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })
})
