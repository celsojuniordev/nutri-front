import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginWithGoogle } from '@/features/auth/api'
import GoogleLoginButton from '@/features/auth/GoogleLoginButton'
import ProfilePage from '@/features/auth/ProfilePage'
import { AuthProvider } from '@/features/auth/useAuth'

vi.mock('@/features/auth/api', () => ({
  loginWithGoogle: vi.fn(),
  getMe: vi.fn().mockResolvedValue({ id: 1, name: 'Ana Silva', email: 'ana@example.com' }),
  logout: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

vi.mock('@react-oauth/google', async () => await import('@/test/googleOAuthMock'))

const mockedLoginWithGoogle = vi.mocked(loginWithGoogle)

function renderGoogleLoginButton() {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<GoogleLoginButton />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('sends the idToken obtained from the Google SDK to the backend', async () => {
    const user = userEvent.setup()
    mockedLoginWithGoogle.mockResolvedValueOnce({ token: 'jwt-123', accountCreated: false })
    renderGoogleLoginButton()

    await user.click(screen.getByRole('button', { name: /simular conta google selecionada/i }))

    await waitFor(() => expect(mockedLoginWithGoogle).toHaveBeenCalled())
    expect(mockedLoginWithGoogle.mock.calls[0][0]).toEqual({ idToken: 'google-id-token' })
  })

  it('creates an account automatically and shows the account-created welcome message', async () => {
    const user = userEvent.setup()
    mockedLoginWithGoogle.mockResolvedValueOnce({ token: 'jwt-123', accountCreated: true })
    renderGoogleLoginButton()

    await user.click(screen.getByRole('button', { name: /simular conta google selecionada/i }))

    expect(await screen.findByText(/conta criada com sucesso/i)).toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBe('jwt-123')
  })

  it('authenticates an existing account without showing an account-created message', async () => {
    const user = userEvent.setup()
    mockedLoginWithGoogle.mockResolvedValueOnce({ token: 'jwt-456', accountCreated: false })
    renderGoogleLoginButton()

    await user.click(screen.getByRole('button', { name: /simular conta google selecionada/i }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Meu perfil' })).toBeInTheDocument())
    expect(screen.queryByText(/conta criada com sucesso/i)).not.toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBe('jwt-456')
  })

  it('stays on the page without an error message when the user cancels the Google account picker', async () => {
    const user = userEvent.setup()
    renderGoogleLoginButton()

    await user.click(screen.getByRole('button', { name: /simular cancelamento/i }))

    expect(screen.queryByText(/falha ao entrar com google/i)).not.toBeInTheDocument()
    expect(mockedLoginWithGoogle).not.toHaveBeenCalled()
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })

  it('shows a Google-specific message when the backend rejects the token (401 GOOGLE_TOKEN_INVALID)', async () => {
    const user = userEvent.setup()
    mockedLoginWithGoogle.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        status: 401,
        data: {
          status: 401,
          error: 'GOOGLE_TOKEN_INVALID',
          message: 'Token do Google inválido',
          timestamp: '2026-01-01T00:00:00Z',
        },
      },
    })
    renderGoogleLoginButton()

    await user.click(screen.getByRole('button', { name: /simular conta google selecionada/i }))

    expect(
      await screen.findByText('Não foi possível entrar com o Google. Tente novamente.'),
    ).toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })

  it('shows a generic message on network/unmapped failures without establishing a session', async () => {
    const user = userEvent.setup()
    mockedLoginWithGoogle.mockRejectedValueOnce(new Error('Network Error'))
    renderGoogleLoginButton()

    await user.click(screen.getByRole('button', { name: /simular conta google selecionada/i }))

    expect(
      await screen.findByText(
        'Não foi possível concluir o login com o Google. Tente novamente em instantes.',
      ),
    ).toBeInTheDocument()
    expect(localStorage.getItem('evolvitta.auth.token')).toBeNull()
  })
})
