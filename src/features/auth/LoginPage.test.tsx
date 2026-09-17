import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login } from '@/features/auth/api'
import LoginPage from '@/features/auth/LoginPage'
import ProfilePage from '@/features/auth/ProfilePage'
import { AuthProvider } from '@/features/auth/useAuth'

vi.mock('@/features/auth/api', () => ({
  login: vi.fn(),
  loginWithGoogle: vi.fn(),
  getMe: vi.fn().mockResolvedValue({ id: 1, name: 'Ana Silva', email: 'ana@example.com' }),
  logout: vi.fn(),
  register: vi.fn(),
}))

vi.mock('@react-oauth/google', async () => await import('@/test/googleOAuthMock'))

const mockedLogin = vi.mocked(login)

function renderLoginPage() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('blocks submission while required fields are empty', () => {
    renderLoginPage()

    expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled()
    expect(mockedLogin).not.toHaveBeenCalled()
  })

  it('logs in successfully and navigates to the authenticated area', async () => {
    const user = userEvent.setup()
    mockedLogin.mockResolvedValueOnce({ token: 'jwt-123' })
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Senha123')
    await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument())
    expect(localStorage.getItem('evolvitta.auth.token')).toBe('jwt-123')
  })

  it('shows a single generic message for invalid credentials, without revealing which field is wrong', async () => {
    const user = userEvent.setup()
    mockedLogin.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 401,
        data: {
          status: 401,
          error: 'INVALID_CREDENTIALS',
          message: 'Credenciais inválidas',
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    })
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'wrongpass')
    await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText('E-mail ou senha incorretos.')).toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })

  it('shows a generic failure message on network/unmapped errors without establishing a session', async () => {
    const user = userEvent.setup()
    mockedLogin.mockRejectedValueOnce(new Error('Network Error'))
    renderLoginPage()

    await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
    await user.type(screen.getByLabelText('Senha'), 'Senha123')
    await waitFor(() => expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled())
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(
      await screen.findByText('Não foi possível entrar. Tente novamente em instantes.'),
    ).toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })
})
